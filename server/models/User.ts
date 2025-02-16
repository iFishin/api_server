import { openDb } from '../db';

export interface User {
    id?: number;
    name: string;
    email: string;
}

export default {
    async getAll(): Promise<User[]> {
        const db = await openDb();
        return db.all('SELECT * FROM users');
    },

    async getById(id: number): Promise<User | undefined> {
        const db = await openDb();
        return db.get('SELECT * FROM users WHERE id = ?', id);
    },

    async create(user: User): Promise<User> {
        const db = await openDb();
        const { name, email } = user;
        const { lastID } = await db.run(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            name, email
        );
        return this.getById(lastID!) as Promise<User>;
    },

    async update(id: number, user: User): Promise<User | undefined> {
        const db = await openDb();
        const { name, email } = user;
        await db.run(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            name, email, id
        );
        return this.getById(id);
    },

    async delete(id: number): Promise<void> {
        const db = await openDb();
        await db.run('DELETE FROM users WHERE id = ?', id);
    },
};