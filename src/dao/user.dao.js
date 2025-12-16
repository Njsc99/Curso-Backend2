import userModel from '../models/user.model.js';

class UserDAO {
    async findById(id) {
        return await userModel.findById(id).populate('cart');
    }

    async findOne(query) {
        return await userModel.findOne(query).populate('cart');
    }

    async create(userData) {
        return await userModel.create(userData);
    }

    async update(id, userData) {
        return await userModel.findByIdAndUpdate(id, userData, { new: true });
    }

    async delete(id) {
        return await userModel.findByIdAndDelete(id);
    }

    async findAll() {
        return await userModel.find().populate('cart');
    }
}

export default new UserDAO();
