import cookie from "cookie";

const connectedUsers = {};

export function GetUsers() {
  return Object.values(connectedUsers);
}

const SocketConnection = (io) => {
  io.on("connection", (socket) => {
    const rawCookies = socket.handshake.headers.cookie;
    if (!rawCookies) {
      console.warn("⚠️ No cookies found for socket:", socket.id);
    }

    const parsedCookies = cookie.parse(rawCookies || "");

    let currentUser = null;
    if (parsedCookies.CurrentUser) {
      try {
        currentUser = JSON.parse(parsedCookies.CurrentUser);
      } catch (error) {
        console.error("❌ Error parsing CurrentUser cookie:", error);
      }
    }

 
    const username = currentUser?.name || "Guest";
    connectedUsers[socket.id] = {
      id: socket.id,
      user: username,
      group: null,
    };

    console.log(`✅ New client connected: ${username} (ID: ${socket.id})`);

    socket.emit("connected-users", GetUsers());

 
    socket.on("join-group", (groupName) => {
      if (connectedUsers[socket.id]) {
        if (connectedUsers[socket.id].group) {
          socket.leave(connectedUsers[socket.id].group);
          console.log(`${username} left group: ${connectedUsers[socket.id].group}`);
        }

        connectedUsers[socket.id].group = groupName;
        socket.join(groupName);

        console.log(`${username} joined group: ${groupName}`);
        socket.emit("group-joined", { group: groupName });
      }
    });

 
    socket.on("send-group-message", ({ group, message }) => {
      if (!group) {
        console.error("❌ No group specified for message");
        return;
      }

      console.log(`📩 Message from ${username} in ${group}:`, message);
      socket.to(group).emit("group-message", { sender: username, message });
    });

    socket.on("leave-group", () => {
      const userGroup = connectedUsers[socket.id]?.group;
      if (userGroup) {
        socket.leave(userGroup);
        console.log(`${username} left group: ${userGroup}`);
        connectedUsers[socket.id].group = null;
        socket.emit("group-left");
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id} (${username})`);
      delete connectedUsers[socket.id];
      io.emit("user-disconnected", { id: socket.id });
    });
  });
};

export default SocketConnection;
