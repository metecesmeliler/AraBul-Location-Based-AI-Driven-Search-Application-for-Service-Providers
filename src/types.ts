export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  BusinessList: { jsonData: string };
};

export interface Message {
  id: string;
  text: string;
  sender: 'system' | 'user' | 'ai';
  timestamp: number;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  id: string;
  name: string;
  age: number;
  email: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  hobbies: string[];
}
