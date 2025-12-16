import { Router } from 'express';
import { passportCall } from '../../utils.js';
import { authorize } from '../../middleware/auth.js';
import CartRepository from '../../repositories/cart.repository.js';
import ProductRepository from '../../repositories/product.repository.js';
import TicketRepository from '../../repositories/ticket.repository.js';
import { sendPurchaseConfirmation } from '../../utils/mailer.js';

const router = Router();

// Obtener carrito por ID
router.get('/:cid', passportCall('jwt'), async (req, res) => {
    try {
        const cart = await CartRepository.getCartById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Agregar producto al carrito (solo usuarios)
router.post('/:cid/product/:pid', passportCall('jwt'), authorize('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        // Verificar que el carrito pertenece al usuario
        if (req.user.cart && req.user.cart.toString() !== cid) {
            return res.status(403).json({ 
                status: "error", 
                message: "No puedes modificar este carrito" 
            });
        }

        // Verificar que el producto existe y tiene stock
        const product = await ProductRepository.getProductById(pid);
        if (!product) {
            return res.status(404).json({ 
                status: "error", 
                message: "Producto no encontrado" 
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ 
                status: "error", 
                message: "Stock insuficiente" 
            });
        }

        const updatedCart = await CartRepository.addProductToCart(cid, pid, quantity);
        res.json({ 
            status: "success", 
            message: "Producto agregado al carrito",
            payload: updatedCart 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Actualizar cantidad de un producto en el carrito
router.put('/:cid/product/:pid', passportCall('jwt'), authorize('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        // Verificar que el carrito pertenece al usuario
        if (req.user.cart && req.user.cart.toString() !== cid) {
            return res.status(403).json({ 
                status: "error", 
                message: "No puedes modificar este carrito" 
            });
        }

        const cart = await CartRepository.getCartById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        const productIndex = cart.products.findIndex(p => p.product._id.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ 
                status: "error", 
                message: "Producto no encontrado en el carrito" 
            });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.json({ 
            status: "success", 
            message: "Cantidad actualizada",
            payload: cart 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Eliminar producto del carrito
router.delete('/:cid/product/:pid', passportCall('jwt'), authorize('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Verificar que el carrito pertenece al usuario
        if (req.user.cart && req.user.cart.toString() !== cid) {
            return res.status(403).json({ 
                status: "error", 
                message: "No puedes modificar este carrito" 
            });
        }

        const updatedCart = await CartRepository.removeProductFromCart(cid, pid);
        res.json({ 
            status: "success", 
            message: "Producto eliminado del carrito",
            payload: updatedCart 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Vaciar carrito
router.delete('/:cid', passportCall('jwt'), authorize('user'), async (req, res) => {
    try {
        const { cid } = req.params;

        // Verificar que el carrito pertenece al usuario
        if (req.user.cart && req.user.cart.toString() !== cid) {
            return res.status(403).json({ 
                status: "error", 
                message: "No puedes modificar este carrito" 
            });
        }

        const clearedCart = await CartRepository.clearCart(cid);
        res.json({ 
            status: "success", 
            message: "Carrito vaciado",
            payload: clearedCart 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Finalizar compra
router.post('/:cid/purchase', passportCall('jwt'), authorize('user'), async (req, res) => {
    try {
        const { cid } = req.params;

        // Verificar que el carrito pertenece al usuario
        if (req.user.cart && req.user.cart.toString() !== cid) {
            return res.status(403).json({ 
                status: "error", 
                message: "No puedes realizar esta compra" 
            });
        }

        const cart = await CartRepository.getCartById(cid);
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ 
                status: "error", 
                message: "El carrito está vacío" 
            });
        }

        const purchasedProducts = [];
        const failedProducts = [];
        let totalAmount = 0;

        // Verificar stock y procesar productos
        for (const item of cart.products) {
            const product = await ProductRepository.getProductById(item.product._id);
            
            if (!product) {
                failedProducts.push({
                    productId: item.product._id,
                    reason: "Producto no encontrado"
                });
                continue;
            }

            if (product.stock >= item.quantity) {
                // Hay suficiente stock
                await ProductRepository.updateStock(product._id, -item.quantity);
                purchasedProducts.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price
                });
                totalAmount += product.price * item.quantity;
            } else {
                // No hay suficiente stock
                failedProducts.push({
                    productId: product._id,
                    productName: product.title,
                    requestedQuantity: item.quantity,
                    availableStock: product.stock,
                    reason: "Stock insuficiente"
                });
            }
        }

        // Si no se pudo comprar nada
        if (purchasedProducts.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No se pudo procesar ningún producto",
                failedProducts
            });
        }

        // Crear ticket con los productos comprados
        const ticket = await TicketRepository.createTicket(
            req.user.email,
            totalAmount,
            purchasedProducts
        );

        // Actualizar carrito: eliminar productos comprados
        const remainingProducts = cart.products.filter(item => 
            !purchasedProducts.find(p => p.product.toString() === item.product._id.toString())
        );
        
        await CartRepository.updateCart(cid, { products: remainingProducts });

        // Enviar email de confirmación
        const ticketWithProducts = await TicketRepository.getTicketById(ticket._id);
        await sendPurchaseConfirmation(req.user.email, ticketWithProducts);

        const response = {
            status: "success",
            message: purchasedProducts.length === cart.products.length 
                ? "Compra realizada exitosamente" 
                : "Compra parcial realizada",
            ticket: {
                id: ticket._id,
                code: ticket.code,
                amount: ticket.amount,
                purchaser: ticket.purchaser,
                purchase_datetime: ticket.purchase_datetime
            }
        };

        if (failedProducts.length > 0) {
            response.failedProducts = failedProducts;
        }

        res.json(response);
    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;
