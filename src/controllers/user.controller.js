import { UserService } from "../dao/users.mongo.dao.js"

const service = new UserService()

export class UserController {
    constructor() {
    }

    async getUsers() {
        try {
            return await service.getUsers()
        } catch (err) {
            return err.message
        }
        
    }

    async getUsersPaginated(page, limit) {
        try {
            return await service.getUsersPaginated()
        } catch (err) {
            return err.message
        }
    }
}