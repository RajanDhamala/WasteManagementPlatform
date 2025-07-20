// redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const Redisclient = createClient({
  url: process.env.REDIS_URL,
});

Redisclient.on('error', (err) => {
  console.error('Redis error:', err);
});

const connectRedis = async () => {
  if (!Redisclient.isOpen) {
    await Redisclient.connect();
    console.log('Connected to Redis');
  }
};


const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate(); 

export { Redisclient, connectRedis, pubClient, subClient };
