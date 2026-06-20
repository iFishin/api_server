"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.getAll();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.getById(parseInt(req.params.id));
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { name, email } = req.query;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        const newUser = await User_1.default.create({ name: name.toString(), email: email.toString() });
        res.status(201).json(newUser);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const updatedUser = await User_1.default.update(parseInt(req.params.id), req.body);
        if (updatedUser) {
            res.json(updatedUser);
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        await User_1.default.delete(parseInt(req.params.id));
        res.json({ message: `User ${req.params.id} successfully deleted` });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
