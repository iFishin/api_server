import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function openDb() {
    if (!db) {
        db = await open({
            filename: process.env.DB_FILENAME || 'database.db',
            driver: sqlite3.Database,
        });
    }
    return db;
}