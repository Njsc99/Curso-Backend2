import TicketDAO from '../dao/ticket.dao.js';
import { v4 as uuidv4 } from 'uuid';

class TicketRepository {
    async createTicket(purchaserEmail, amount, products) {
        const ticketData = {
            code: uuidv4(),
            purchase_datetime: new Date(),
            amount,
            purchaser: purchaserEmail,
            products
        };
        return await TicketDAO.create(ticketData);
    }

    async getTicketById(id) {
        return await TicketDAO.findById(id);
    }

    async getTicketsByUser(email) {
        return await TicketDAO.findByPurchaser(email);
    }

    async getAllTickets() {
        return await TicketDAO.findAll();
    }
}

export default new TicketRepository();
