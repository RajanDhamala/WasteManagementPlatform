import app from './app.js';
import dotenv from 'dotenv';
import ConnectDb from './src/Database/ConnectDb.js';
import {Server} from 'socket.io';
import http from 'http';
import SocketConnection from './src/Utils/SocketConnection.js';
import {connectRedis } from './src/Utils/RedisUtil.js'

dotenv.config();

ConnectDb().then(()=>{

    const server=http.createServer(app);
    const io = new Server(server, {
        cors: {
          origin: [
            'http://localhost:5173',
          ], 
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
    SocketConnection(io);
    connectRedis();

    server.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log('Error in connecting to the database',err);
})



