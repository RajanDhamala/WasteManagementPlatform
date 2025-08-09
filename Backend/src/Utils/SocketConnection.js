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
        userId: data.userId,
        publicKey: data.publicKey,
      };
    })
    .filter(Boolean);
}

function SocketConnection(io) {
  io.on("connection", async (socket) => {
     console.log("connect to the socket server");
    const rawCookies = socket.handshake.headers.cookie;
    const parsedCookies = cookie.parse(rawCookies || "");

    const publicKey = socket.handshake.auth.publicKey;
    console.log("Public Key:", publicKey);
    let currentUser = null;
    try {
      currentUser = parsedCookies.CurrentUser
        ? JSON.parse(parsedCookies.CurrentUser)
        : null;
    } catch (error) {
      console.error("Error parsing CurrentUser cookie:", error);
      // will be emmited only to the socket that is trying conenction rn
     socket.emit("unauthorized", { reason: "Missing user authentication" });
      return;
    }
    if (!currentUser || !currentUser._id) {
    console.warn("No valid CurrentUser or userId. Disconnecting...");
    socket.emit("unauthorized", { reason: "Missing user authentication" });
    return;
  }

    const username = currentUser?.name || "Guest";
    const userId = currentUser?._id;

    const redisKey = `user:${userId}`;
    const existingUser = await Redisclient.json.get(redisKey);
    
if (!existingUser || existingUser.socketId !== socket.id) {
  await Redisclient.json.set(redisKey, '.', {
    socketId: socket.id,
    name: username,
    userId,
    groups: [],
    publicKey:publicKey
  });

  await Redisclient.sAdd('connectedUsers', userId);
  console.log(`Registered/updated socket for user: ${username} (ID: ${socket.id})`);
} else {
  console.log(`[INFO] User ${username} already connected with same socket ID.`);
}

    await Redisclient.json.set(redisKey, '.', {
      socketId: socket.id,
      name: username,
      userId,
      groups: [],
      publicKey: publicKey
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

    socket.on("Send-peer2peer", async ({messageId, timestamps, sender, reciever,encrypted }) => {
      console.log(`Peer-to-peer message from ${sender} to ${reciever}: ,${JSON.stringify(encrypted)}`);
      const recieverData = await Redisclient.json.get(`user:${reciever}`);
      const targetSocketId = recieverData?.socketId;

      if (targetSocketId) {
        io.to(targetSocketId).emit("Recieve-peer2peer", {

          messageId,
          timestamps,
          sender,
          encrypted:encrypted
        });
      } else {
        console.log(`Receiver ${reciever} not found or offline.`);
      }
    });

    socket.on("edit-group-message",async({messageId,newMessage,receiver,type})=>{
      console.log(`Edit message request from ${receiver} for message ID ${messageId}: ${newMessage}`);
     socket.to(receiver).emit("edited-group-message", {
        messageId,
        newMessage,
        group: receiver,
      });
    })

    socket.on("edit-message",async({messageId,encrynewMessage,receiver})=>{
      console.log(`Edit message request from ${receiver} for message ID ${messageId}: ${JSON.stringify(encrynewMessage)}`);
        const recieverData = await Redisclient.json.get(`user:${receiver}`);
      const targetSocketId = recieverData?.socketId;
      if(targetSocketId){
        console.log(`Emitting delete message to socket ID ${targetSocketId}`);
        io.to(targetSocketId).emit("edited-message", {
          messageId,
         encrynewMessage,
         "sender": currentUser.name
        });
      }
    })

    socket.on("delete-message",async({messageId,receiver})=>{
      const recieverData = await Redisclient.json.get(`user:${receiver}`);
      const targetSocketId = recieverData?.socketId;
      if(targetSocketId){
        console.log(`Emitting delete message to socket ID ${targetSocketId}`);
        io.to(targetSocketId).emit("deleted-message", {
          messageId,
         receiver,
         sender: currentUser._id
        });
      }
    })

    socket.on("delete-group-message",({messageId,groupId})=>{
      console.log(`Delete group message request for message ID ${messageId} in group ${groupId}`);
      socket.to(groupId).emit("deleted-group-message", {
        messageId,
        groupId,
        sender: currentUser.name
      });
    })

    socket.on("call-user", ({ offer, to }) => {
      console.log(`Call from ${socket.id} to ${to}`);
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

  if (!redisKey || typeof redisKey !== 'string') {
    console.warn(`Invalid redisKey on disconnect:`, redisKey);
    return;
  }

  const userData = await Redisclient.json.get(redisKey);
  const userGroups = userData?.groups || [];

  for (const group of userGroups) {
    socket.to(group).emit("user-left-group", {
      user: username,
      id: socket.id,
      group,
    });
  }

  await Redisclient.del(redisKey).catch(err => {
    console.error("Error deleting Redis key on disconnect:", err);
  });

  await Redisclient.sRem('connectedUsers', userId);

  io.emit("user-disconnected", { id: socket.id, user: username });
});
  });
}

export { SocketConnection,GetUsers };
