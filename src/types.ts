export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  BusinessList: { jsonData: string };
};

export interface ChatRequest {
  query: string;
  city: string;
}

export interface SearchResult {
  code: string;
  description: string;
  distance?: number;
  city: string;
}

export interface ChatResponse {
  data: any;
  results: SearchResult[];
  original_query: string;
  city: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}