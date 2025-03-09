import { ChatRequest, ChatResponse } from './types';

const BASE_URL = 'http://192.168.1.78:8000'; // Backend IP

export const chatService = {
  sendMessage: async (messageData: string): Promise<ChatResponse> => {
    try {
      // Parse the messageData string back into an object
      const parsedData = JSON.parse(messageData);

      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: parsedData.query,
          city: parsedData.city,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from backend:', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};
