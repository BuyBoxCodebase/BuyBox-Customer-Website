import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface LinoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[]; // To store the returned products from the AI
}

interface LinoStore {
  isOpen: boolean;
  sessionId: string;
  messages: LinoMessage[];
  isLoading: boolean;
  
  openLino: () => void;
  closeLino: () => void;
  addMessage: (message: Omit<LinoMessage, 'id'>) => void;
  updateLastMessage: (updates: Partial<LinoMessage>) => void;
  setMessages: (messages: LinoMessage[]) => void;
  setSessionId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearHistory: () => void;
}

export const useLinoStore = create<LinoStore>((set) => ({
  isOpen: false,
  sessionId: '', // Initialized by the client component
  messages: [],
  isLoading: false,

  openLino: () => set({ isOpen: true }),
  closeLino: () => set({ isOpen: false }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { ...message, id: uuidv4() }] 
  })),
  updateLastMessage: (updates) => set((state) => {
    if (state.messages.length === 0) return state;
    const newMessages = [...state.messages];
    newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], ...updates };
    return { messages: newMessages };
  }),
  setMessages: (messages) => set({ messages }),
  setSessionId: (sessionId) => set({ sessionId }),
  setLoading: (isLoading) => set({ isLoading }),
  clearHistory: () => {
    const newSessionId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem('lino-session-id', newSessionId);
    }
    set({ messages: [], sessionId: newSessionId });
  },
}));
