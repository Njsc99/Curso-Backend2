import productModel from '../models/product.model.js';

class ProductDAO {
    async create(productData) {
        return await productModel.create(productData);
    }

    async findById(id) {
        return await productModel.findById(id);
    }

    async findOne(query) {
        return await productModel.findOne(query);
    }

    async findAll(filter = {}) {
        return await productModel.find(filter);
    }

    async update(id, productData) {
        return await productModel.findByIdAndUpdate(id, productData, { new: true });
    }

    async delete(id) {
        return await productModel.findByIdAndDelete(id);
    }

    async updateStock(id, quantity) {
        return await productModel.findByIdAndUpdate(
            id,
            { $inc: { stock: quantity } },
            { new: true }
        );
    }
}

export default new ProductDAO();
