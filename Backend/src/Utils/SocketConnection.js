import cookie from 'cookie';
import { CacheJoinedEvent } from '../Controller/EventController.js';

const connectedUsers = {};

function GetUsers() {
  return Object.values(connectedUsers);
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
      console.error("❌ Error parsing CurrentUser cookie:", error);
    }

    const username = currentUser?.name || "Guest";
    const userId = currentUser?._id;

    // === 👤 Register Connected User ===
    connectedUsers[socket.id] = {
      id: socket.id,
      user: username,
      groups: new Set(),
    };

    socket.emit("me", socket.id);
    console.log(`✅ New client connected: ${username} (ID: ${socket.id})`);

    // === 🏠 Join Previously Joined Event Groups (if any) ===
    // const joinedEvents = await CacheJoinedEvent(userId);
    // joinedEvents.forEach((event, index) => {
    //   const eventId = event._id?.toString?.() || event.id?.toString?.();
    //   if (eventId) {
    //     socket.join(eventId);
    //     connectedUsers[socket.id].groups.add(eventId);
    //     console.log(`${event.title} (Event ${index}) - Joined room: ${eventId}`);
    //   }
    // });

    // console.log("📂 Joined groups:", Array.from(connectedUsers[socket.id].groups));

    // === 📩 Group Chat Message ===
    socket.on("Send-group-Message", ({ message, sender, group, MessageId, senderId }) => {
      console.log("📨 Msg:", message, "to", group, "by", sender, MessageId, senderId);
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
      console.log("⌨️ Typing:", sender, isTyping, "in", group);
      socket.to(group).emit("Group-Typing", { isTyping, sender, group });
    });

    socket.on("Send-peer2peer",({message,messageId,timestamps,sender,reciever})=>{
      console.log(message,messageId,timestamps,sender,reciever)
      socket.to(reciever).emit("Recieve-peer2peer",{message,messageId,timestamps,sender,reciever})
    })

    socket.on("call-user", ({ offer, to }) => {
      console.log(`📞 Call from ${socket.id} to ${to}`);
      io.to(to).emit("call-made", {
        offer,
        socket: socket.id,
      });
    });

    socket.on("make-answer", ({ answer, to }) => {
      console.log(`✅ Answer from ${socket.id} to ${to}`);
      io.to(to).emit("answer-made", {
        answer,
        socket: socket.id,
      });
    });

    socket.on("Call-timeout",({reason,RejectedBy,RejectedOf})=>{
        console.log(`Call rejected by ${RejectedBy} of ${RejectedOf} cause ${reason}`)
        io.to(RejectedOf).emit("Call-expired",{reason,RejectedBy})
    })

    socket.on("ice-candidate", ({ candidate, to }) => {
      console.log(`🧊 ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit("ice-candidate", {
        candidate,
        socket: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.id} (${username})`);

      const userGroups = connectedUsers[socket.id]?.groups || new Set();
      for (const group of userGroups) {
        socket.to(group).emit("user-left-group", {
          user: username,
          id: socket.id,
          group,
        });
      }

      delete connectedUsers[socket.id];
      io.emit("user-disconnected", { id: socket.id, user: username });
    });
  });
}

export { SocketConnection, GetUsers };
