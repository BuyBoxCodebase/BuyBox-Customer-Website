import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface LinoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  status?: string; // what Lino is doing while the reply streams in, e.g. "Searching catalog..."
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

  /** Adds a message and returns its id */
  addMessage: (message: Omit<LinoMessage, 'id'>) => string;
  updateMessage: (id: string, update: (message: LinoMessage) => Partial<LinoMessage>) => void;
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

  addMessage: (message) => {
    const id = uuidv4();
    set((state) => ({ messages: [...state.messages, { ...message, id }] }));
    return id;
  },

  updateMessage: (id, update) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === id ? { ...message, ...update(message) } : message)),
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
