import { use } from 'react';
import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  groups: {},
  activeGroupId: null,

  setActiveGroup: (groupId) => {
    set({ activeGroupId: groupId });
  },

  addMessage: (groupId, message) => {
    const existingMessages = get().groups[groupId]?.messages || [];
    set((state) => ({
      groups: {
        ...state.groups,
        [groupId]: {
          messages: [...existingMessages, message],
        },
      },
    }));
  },

  replaceAllGroups: (data) => {
    set({ groups: data });
  },
}));

export default {
  useChatStore
}