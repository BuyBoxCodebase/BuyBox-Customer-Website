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
  isOpen: boolean;
  sessionId: string;
  messages: LinoMessage[];
  isLoading: boolean;
  userChats: LinoChat[];

  openLino: () => void;
  closeLino: () => void;
  addMessage: (message: Omit<LinoMessage, 'id'>) => void;
  updateLastMessage: (updates: Partial<LinoMessage>) => void;
  setMessages: (messages: LinoMessage[]) => void;
  setSessionId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearHistory: () => void;
  /** Generates a fresh UUID, clears messages, and returns the new sessionId */
  startNewChat: () => string;
  setUserChats: (chats: LinoChat[]) => void;
}

export const useLinoStore = create<LinoStore>((set) => ({
  isOpen: false,
  // Ephemeral — NOT persisted to localStorage
  sessionId: uuidv4(),
  messages: [],
  isLoading: false,
  userChats: [],

  openLino: () => set({ isOpen: true }),
  closeLino: () => set({ isOpen: false }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: uuidv4() }],
    })),

  updateLastMessage: (updates) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        ...updates,
      };
      return { messages: newMessages };
    }),

  setMessages: (messages) => set({ messages }),
  setSessionId: (sessionId) => set({ sessionId }),
  setLoading: (isLoading) => set({ isLoading }),

  clearHistory: () => set({ messages: [], sessionId: uuidv4() }),

  startNewChat: () => {
    const newId = uuidv4();
    set({ messages: [], sessionId: newId });
    return newId;
  },

  setUserChats: (userChats) => set({ userChats }),
}));
