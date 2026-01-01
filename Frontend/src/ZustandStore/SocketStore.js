import { create } from 'zustand';
import { io } from 'socket.io-client';

const useSocket = create((set, get) => ({
  socket: null,
  socketId: null,
  isConnecting: false,
  VideoCall: null,

  connect: (url) => {
    const { socket, isConnecting } = get();
    if (socket || isConnecting) return; // 🧠 Guard

    set({ isConnecting: true });

    const newSocket = io(url, {
      withCredentials: true,
        reconnection: false,
  reconnectionAttempts: 3,       
  reconnectionDelay: 2000,       
  reconnectionDelayMax: 5000, 
      transports: ['websocket'], 
    });

    newSocket.on('connect', () => {
      set({ socket: newSocket, socketId: newSocket.id, isConnecting: false });
      console.log("✅ Connected:", newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log("Disconnected:", reason);
      set({ socket: null, socketId: null, isConnecting: false });
    });

    newSocket.on('connect_error', (err) => {
      console.log("Connect error:", err);
      set({ isConnecting: false });
    });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, socketId: null, isConnecting: false });
    }
  },

  setVideoCall: (videoCall) => set({ VideoCall: videoCall }),
  removeVideoCall: () => set({ VideoCall: null }),
}));

export default useSocket;
