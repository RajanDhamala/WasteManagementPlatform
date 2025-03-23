const SocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    
    socket.emit('qr-data', {
      data: 'http://localhost:8000/path-to-qr-code-image', 
      encryptedData: 'some-hashed-data',
    });

    socket.on('send-message', (data) => {
      console.log('Message from', socket.id, data);
      io.emit('message', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export default SocketConnection;
