import cookie from 'cookie';
import { CacheJoinedEvent } from '../Controller/EventController.js';
import { Redisclient } from './RedisUtil.js';


async function GetUsers() {
  const userIds = await Redisclient.sMembers('connectedUsers');
  if (!userIds || userIds.length === 0) return [];

  const pipeline = Redisclient.multi();

  for (const userId of userIds) {
    pipeline.json.get(`user:${userId}`);
  }

  const responses = await pipeline.exec();
  if (!Array.isArray(responses)) return [];

  return responses
    .filter(Boolean)
    .map((data) => {
      if (!data) return null;
      return {
        name: data.name,
        userId: data.userId
      };
    })
    .filter(Boolean);
}



function SocketConnection(io) {
  io.on("connection", async (socket) => {
    const rawCookies = socket.handshake.headers.cookie;
    const parsedCookies = cookie.parse(rawCookies || "");

    let currentUser = null;
    try {
      currentUser = parsedCookies.CurrentUser
        ? JSON.parse(parsedCookies.CurrentUser)
        : null;
    } catch (error) {
      console.error("Error parsing CurrentUser cookie:", error);
      socket.disconnect();
      return;
    }

    const username = currentUser?.name || "Guest";
    const userId = currentUser?._id;

    const redisKey = `user:${userId}`;
    const existingUser = await Redisclient.json.get(redisKey);
    if (existingUser) {
      console.log(`[SKIP] User ${username} already connected: ${existingUser.socketId}`);
      return;
    }

    await Redisclient.json.set(redisKey, '.', {
      socketId: socket.id,
      name: username,
      userId,
      groups: [],
    });
    // await Redisclient.expire(redisKey, 120); // expires in 2 min
    await Redisclient.sAdd('connectedUsers', userId);

    console.log(`New client connected: ${username} (ID: ${socket.id})`);

    // Join event rooms
const joinedEvents = await CacheJoinedEvent(userId);
console.log(`CacheJoinedEvent returned ${joinedEvents.length} events for user ${userId}`);

for (const event of joinedEvents) {
  const eventId = event._id?.toString?.() || event.id?.toString?.();
  if (!eventId) {
    console.warn("Event missing valid ID. Skipping this one:", event);
    continue;
  }

  socket.join(eventId);
  console.log(`${event.title} - Joined room: ${eventId}`);

  const result = await Redisclient.json.arrAppend(redisKey, '.groups', eventId);
  console.log(`Updated Redis groups array for ${redisKey}:`, result);
}

console.log("Final socket rooms after joining:", Array.from(socket.rooms));


    socket.on("Send-group-Message", ({ message, sender, group, MessageId, senderId }) => {
      console.log(`Group message from ${sender} in group ${group}: ${message}`);
      socket.to(group).emit("Group-Message", {
        message,
        sender,
        group,
        timestamp: new Date().toISOString(),
        MessageId,
        senderId
      });
    });

    socket.on("Is-Typing", ({ isTyping, sender, group }) => {
      socket.to(group).emit("Group-Typing", { isTyping, sender, group });
    });

    socket.on("Send-peer2peer", async ({ message, messageId, timestamps, sender, reciever }) => {
      console.log(`Peer-to-peer message from ${sender} to ${reciever}: ${message}`);
      const recieverData = await Redisclient.json.get(`user:${reciever}`);
      const targetSocketId = recieverData?.socketId;

      if (targetSocketId) {
        io.to(targetSocketId).emit("Recieve-peer2peer", {
          message,
          messageId,
          timestamps,
          sender
        });
      } else {
        console.log(`Receiver ${reciever} not found or offline.`);
      }
    });

    socket.on("call-user", ({ offer, to }) => {
      io.to(to).emit("call-made", { offer, socket: socket.id });
    });

    socket.on("make-answer", ({ answer, to }) => {
      io.to(to).emit("answer-made", { answer, socket: socket.id });
    });

    socket.on("Call-timeout", ({ reason, RejectedBy, RejectedOf }) => {
      io.to(RejectedOf).emit("Call-expired", { reason, RejectedBy });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, socket: socket.id });
    });

    socket.on("disconnect", async () => {
      console.log(`Disconnected: ${socket.id} (${username})`);

      const userData = await Redisclient.json.get(redisKey);
      const userGroups = userData?.groups || [];

      for (const group of userGroups) {
        socket.to(group).emit("user-left-group", {
          user: username,
          id: socket.id,
          group,
        });
      }

      await Redisclient.del(redisKey);
      await Redisclient.sRem('connectedUsers', userId);

      io.emit("user-disconnected", { id: socket.id, user: username });
    });
  });
}

export { SocketConnection,GetUsers };
