import app from './app.js';
import dotenv from 'dotenv';
import ConnectDb from './src/Database/ConnectDb.js';
import { Server } from 'socket.io';
import http from 'http';
import SocketConnection from './src/Utils/SocketConnection.js';
import {connectRedis} from './src/Utils/RedisUtil.js'
dotenv.config();

let io;  

const server = http.createServer(app);

ConnectDb().then(() => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"],
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
    });

    SocketConnection(io);
    connectRedis()

    server.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.error('Error connecting to the database:', err);
});

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized yet!");
    }
    return io;
};
