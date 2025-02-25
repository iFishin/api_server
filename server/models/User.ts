import UserService from '../services/UserService';

export interface User {
    id?: number;
    name: string;
    email: string;
}

class UserModel {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    getAll = () => this.userService.getAllUsers();
    getById = (id: number) => this.userService.getUserById(id);
    create = (user: User) => this.userService.createUser(user);
    update = (id: number, user: User) => this.userService.updateUser(id, user);
    delete = (id: number) => this.userService.deleteUser(id);
}

// Dependency injection for better testability
const userService = new UserService();
export default new UserModel(userService);
