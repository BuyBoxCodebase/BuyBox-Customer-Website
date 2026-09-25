import axios from 'axios';

// Assuming the backend is running on port 3000 locally
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const sendLinoMessage = async (sessionId: string, message: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/lino/chat`, {
      sessionId,
      message,
    });
    
    return response.data; // { reply: string, products: any[] }
  } catch (error) {
    console.error("Error communicating with Lino:", error);
    throw new Error("Lino is currently unavailable. Please try again later.");
  }
};

export const fetchLinoHistory = async (sessionId: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/lino/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Lino history:", error);
    return null;
  }
};
