import CartDAO from '../dao/cart.dao.js';

class CartRepository {
    async createCart() {
        return await CartDAO.create({ products: [] });
    }

    async getCartById(id) {
        return await CartDAO.findById(id);
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        return await CartDAO.addProduct(cartId, productId, quantity);
    }

    async removeProductFromCart(cartId, productId) {
        return await CartDAO.removeProduct(cartId, productId);
    }

    async clearCart(cartId) {
        return await CartDAO.clearCart(cartId);
    }

    async updateCart(cartId, cartData) {
        return await CartDAO.update(cartId, cartData);
    }

    async deleteCart(cartId) {
        return await CartDAO.delete(cartId);
    }
}

export default new CartRepository();
