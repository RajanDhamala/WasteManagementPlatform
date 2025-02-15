// src/Utils/SocketConnection.js
const SocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // Custom event listener
    socket.on('customEvent', (data) => {
      console.log('📩 Received data:', data);
      socket.emit('responseEvent', { message: 'Hello from server!' });
    });

    // Disconnect event listener
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    socket.on('send-message',(data)=>{
      console.log('message',data,'from',socket.id);
      io.emit('message',data);
    })
  });
};

export default SocketConnection;
