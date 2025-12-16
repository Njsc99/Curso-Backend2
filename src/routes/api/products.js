import { Router } from 'express';
import { passportCall } from '../../utils.js';
import { isAdmin } from '../../middleware/auth.js';
import ProductRepository from '../../repositories/product.repository.js';
import ProductDTO from '../../dto/product.dto.js';

const router = Router();

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
    try {
        const products = await ProductRepository.getAllProducts();
        const productsDTO = products.map(p => new ProductDTO(p));
        res.json({ status: "success", payload: productsDTO });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Obtener producto por ID (público)
router.get('/:pid', async (req, res) => {
    try {
        const product = await ProductRepository.getProductById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }
        const productDTO = new ProductDTO(product);
        res.json({ status: "success", payload: productDTO });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Crear producto (solo admin)
router.post('/', passportCall('jwt'), isAdmin, async (req, res) => {
    try {
        const { title, description, price, stock, category, code } = req.body;
        
        // Validar que el código no exista
        const existingProduct = await ProductRepository.getProductByCode(code);
        if (existingProduct) {
            return res.status(400).json({ 
                status: "error", 
                message: "Ya existe un producto con ese código" 
            });
        }

        const productData = {
            title,
            description,
            price,
            stock,
            category,
            code,
            owner: req.user.email
        };

        const newProduct = await ProductRepository.createProduct(productData);
        const productDTO = new ProductDTO(newProduct);
        
        res.status(201).json({ 
            status: "success", 
            message: "Producto creado correctamente",
            payload: productDTO 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Actualizar producto (solo admin)
router.put('/:pid', passportCall('jwt'), isAdmin, async (req, res) => {
    try {
        const { pid } = req.params;
        const updateData = req.body;
        
        // No permitir actualizar el ID
        delete updateData._id;
        
        const updatedProduct = await ProductRepository.updateProduct(pid, updateData);
        if (!updatedProduct) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        const productDTO = new ProductDTO(updatedProduct);
        res.json({ 
            status: "success", 
            message: "Producto actualizado correctamente",
            payload: productDTO 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Eliminar producto (solo admin)
router.delete('/:pid', passportCall('jwt'), isAdmin, async (req, res) => {
    try {
        const { pid } = req.params;
        
        const deletedProduct = await ProductRepository.deleteProduct(pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.json({ 
            status: "success", 
            message: "Producto eliminado correctamente" 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;
