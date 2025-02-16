import { Request, Response } from 'express';
import User, { User as UserType } from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.getById(parseInt(req.params.id));
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.query;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        const newUser = await User.create({ name: name.toString(), email: email.toString() });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updatedUser = await User.update(parseInt(req.params.id), req.body);
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await User.delete(parseInt(req.params.id));
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};