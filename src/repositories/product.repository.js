import ProductDAO from '../dao/product.dao.js';

class ProductRepository {
    async createProduct(productData) {
        return await ProductDAO.create(productData);
    }

    async getProductById(id) {
        return await ProductDAO.findById(id);
    }

    async getProductByCode(code) {
        return await ProductDAO.findOne({ code });
    }

    async getAllProducts(filter = {}) {
        return await ProductDAO.findAll(filter);
    }

    async updateProduct(id, productData) {
        return await ProductDAO.update(id, productData);
    }

    async deleteProduct(id) {
        return await ProductDAO.delete(id);
    }

    async updateStock(id, quantity) {
        return await ProductDAO.updateStock(id, quantity);
    }

    async checkStock(id, requiredQuantity) {
        const product = await ProductDAO.findById(id);
        return product && product.stock >= requiredQuantity;
    }
}

export default new ProductRepository();
