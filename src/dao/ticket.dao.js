import ticketModel from '../models/ticket.model.js';

class TicketDAO {
    async create(ticketData) {
        return await ticketModel.create(ticketData);
    }

    async findById(id) {
        return await ticketModel.findById(id).populate('products.product');
    }

    async findByPurchaser(email) {
        return await ticketModel.find({ purchaser: email }).populate('products.product');
    }

    async findAll() {
        return await ticketModel.find().populate('products.product');
    }
}

export default new TicketDAO();
