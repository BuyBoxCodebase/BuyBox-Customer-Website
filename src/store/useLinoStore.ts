import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface LinoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

export interface LinoChat {
  sessionId: string;
  title: string | null;
  updatedAt: string;
  createdAt: string;
  messages: Array<{ content: string; role: string }>;
}

interface LinoStore {
  sessionId: string;
  messages: LinoMessage[];
  isLoading: boolean;
  userChats: LinoChat[];

  addMessage: (message: Omit<LinoMessage, 'id'>) => void;
  setMessages: (messages: LinoMessage[]) => void;
  setSessionId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  /** Generates a fresh UUID, clears messages, and returns the new sessionId */
  startNewChat: () => string;
  setUserChats: (chats: LinoChat[]) => void;
}

export const useLinoStore = create<LinoStore>((set) => ({
  // Ephemeral — NOT persisted to localStorage
  sessionId: uuidv4(),
  messages: [],
  isLoading: false,
  userChats: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: uuidv4() }],
    })),

  setMessages: (messages) => set({ messages }),
  setSessionId: (sessionId) => set({ sessionId }),
  setLoading: (isLoading) => set({ isLoading }),

  startNewChat: () => {
    const newId = uuidv4();
    set({ messages: [], sessionId: newId });
    return newId;
  },

  setUserChats: (userChats) => set({ userChats }),
}));
