import { create } from 'zustand';
import { io } from 'socket.io-client';

const useSocket = create((set, get) => ({
  socket: null,
  socketId: null, 
  VideoCall: null,

  connect: (url) => {
    if (get().socket) return;
    const socket = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      set({ socket, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      set({ socket: null, socketId: null });
    });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, socketId: null });
    }
  },
  setVideoCall: (videoCall) => {
    set({ VideoCall: videoCall });
  },

  removeVideoCall: () => {
    set({ VideoCall: null });
  }
}));

export default useSocket;
