import app from './app.js';
import dotenv from 'dotenv';
import ConnectDb from './src/Database/ConnectDb.js';
import { createServer } from "http";

dotenv.config();

let isConnected = false;

async function ensureDbConnection() {
    if (!isConnected) {
        try {
            await ConnectDb();
            isConnected = true;
            console.log("✅ Connected to the database!");
        } catch (err) {
            console.error("❌ Database connection error:", err);
        }
    }
}

const server = createServer(app);

export default async function handler(req, res) {
    await ensureDbConnection(); // Ensure DB is connected
    return server.emit("request", req, res);
}
