import UserDAO from '../dao/user.dao.js';
import { createHash, isValidPassword } from '../utils.js';

class UserRepository {
    async getUserById(id) {
        return await UserDAO.findById(id);
    }

    async getUserByEmail(email) {
        return await UserDAO.findOne({ email });
    }

    async createUser(userData) {
        if (userData.password) {
            userData.password = createHash(userData.password);
        }
        return await UserDAO.create(userData);
    }

    async updateUser(id, userData) {
        if (userData.password) {
            userData.password = createHash(userData.password);
        }
        return await UserDAO.update(id, userData);
    }

    async deleteUser(id) {
        return await UserDAO.delete(id);
    }

    async getAllUsers() {
        return await UserDAO.findAll();
    }

    async validatePassword(user, password) {
        return isValidPassword(user, password);
    }

    async updatePassword(id, newPassword) {
        const hashedPassword = createHash(newPassword);
        return await UserDAO.update(id, { password: hashedPassword });
    }
}

export default new UserRepository();
