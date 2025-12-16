import cartModel from '../models/cart.model.js';

class CartDAO {
    async create(cartData) {
        return await cartModel.create(cartData);
    }

    async findById(id) {
        return await cartModel.findById(id).populate('products.product');
    }

    async update(id, cartData) {
        return await cartModel.findByIdAndUpdate(id, cartData, { new: true });
    }

    async delete(id) {
        return await cartModel.findByIdAndDelete(id);
    }

    async addProduct(cartId, productId, quantity = 1) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(
            p => p.product.toString() === productId
        );

        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        return await cart.save();
    }

    async removeProduct(cartId, productId) {
        return await cartModel.findByIdAndUpdate(
            cartId,
            { $pull: { products: { product: productId } } },
            { new: true }
        );
    }

    async clearCart(cartId) {
        return await cartModel.findByIdAndUpdate(
            cartId,
            { products: [] },
            { new: true }
        );
    }
}

export default new CartDAO();
