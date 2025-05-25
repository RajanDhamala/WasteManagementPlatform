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

    connectedUsers[socket.id] = {
      id: socket.id,
      user: username,
      groups: new Set(),
    };

    console.log(`New client connected: ${username} (ID: ${socket.id})`);

    const joinedEvents = await CacheJoinedEvent(userId);
    joinedEvents.forEach((event, index) => {
      const eventId = event._id?.toString?.() || event.id?.toString?.();
      if (eventId) {
        socket.join(eventId);
        connectedUsers[socket.id].groups.add(eventId);
        console.log(`📌 ${event.title} (Event ${index}) - Joined room: ${eventId}`);
      }
    });

    console.log("🔗 Joined groups:", Array.from(connectedUsers[socket.id].groups));



    
    socket.on('Send-group-Message',async({message,sender,group,messageId})=>{
      console.log('Msg:',message,'to',group,'by',sender,messageId);
      socket.to(group).emit('Group-Message', {message,sender, group,timestamp: new Date().toISOString(),messageId
});

  socket.on('Is-Typing',async({isTyping,sender,group})=>{
    console.log(sender,'isTyping',isTyping,'to',group)
    socket.to(group).emit('Group-Typing',{isTyping,sender,group})
  })

    })

    
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id} (${username})`);

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

export {
  SocketConnection,
  GetUsers
}