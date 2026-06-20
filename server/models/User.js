"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = require("../services/userService");
class UserModel {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    getAll = () => this.userService.getAllUsers();
    getById = (id) => this.userService.getUserById(id);
    create = (user) => this.userService.createUser(user);
    update = (id, user) => this.userService.updateUser(id, user);
    delete = (id) => this.userService.deleteUser(id);
}
// Dependency injection for better testability
const userService = new userService_1.UserService();
exports.default = new UserModel(userService);
