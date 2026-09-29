import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const sendLinoMessage = async (
  sessionId: string,
  message: string,
  userId?: string,
) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/lino/chat`, {
      sessionId,
      message,
      userId, // undefined for guests, string for logged-in users
    });
    return response.data; // { reply: string, products: any[] }
  } catch (error) {
    console.error('Error communicating with Lino:', error);
    throw new Error('Lino is currently unavailable. Please try again later.');
  }
};

export const fetchLinoHistory = async (sessionId: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/lino/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Lino history:', error);
    return null;
  }
};

/** Fetches all past sessions for the currently authenticated user (for the side panel). */
export const fetchUserChats = async (token: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/lino/user/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as Array<{
      sessionId: string;
      title: string | null;
      updatedAt: string;
      createdAt: string;
      messages: Array<{ content: string; role: string }>;
    }>;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return [];
  }
};
