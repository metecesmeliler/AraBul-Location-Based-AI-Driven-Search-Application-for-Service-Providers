import { ChatRequest, ChatResponse } from './types';

const BASE_URL = 'http://10.144.228.195:8000'; // Use 10.0.2.2 for Android emulator
// const BASE_URL = 'http://localhost:8000'; // Use for iOS simulator

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
          city: parsedData.city
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};
