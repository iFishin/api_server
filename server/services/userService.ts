import { openDb } from '../db';

export interface User {
    id?: number;
    name: string;
    email: string;
}

export default class UserService {
    // 获取所有用户
    async getAllUsers(): Promise<User[]> {
        const db = await openDb();
        return db.all('SELECT * FROM users');
    }

    // 根据 ID 获取用户
    async getUserById(id: number): Promise<User | undefined> {
        const db = await openDb();
        return db.get('SELECT * FROM users WHERE id = ?', id);
    }

    // 创建用户
    async createUser(user: User): Promise<User> {
        const db = await openDb();
        const { name, email } = user;
        const { lastID } = await db.run(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            name, email
        );
        return this.getUserById(lastID!) as Promise<User>;
    }

    // 更新用户
    async updateUser(id: number, user: User): Promise<User | undefined> {
        const db = await openDb();
        const { name, email } = user;
        await db.run(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            name, email, id
        );
        return this.getUserById(id);
    }

    // 删除用户
    async deleteUser(id: number): Promise<void> {
        const db = await openDb();
        await db.run('DELETE FROM users WHERE id = ?', id);
    }
}