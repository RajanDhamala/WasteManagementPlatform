import app from './app.js';
import dotenv from 'dotenv';
import ConnectDb from './src/Database/ConnectDb.js';
import { Server } from 'socket.io';
import http from 'http';
import {SocketConnection} from './src/Utils/SocketConnection.js';
import {connectRedis} from './src/Utils/RedisUtil.js'
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
});
SocketConnection(io);

const startServer = async () => {
    try {
        await ConnectDb();
        console.log('Database connected successfully');
        
        // await connectRedis();
        console.log('Redis connected successfully');
        const PORT = process.env.PORT || 8000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error during server startup:', err);
    }
};

startServer();

export const getIo = () => io;
