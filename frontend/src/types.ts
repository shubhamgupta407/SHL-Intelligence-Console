export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Recommendation {
  name: string;
  url: string;
  test_type: string;
  duration?: string;
  languages?: string[];
  reasoning?: string;
}

export interface AgentResponse {
  reply: string;
  recommendations: Recommendation[] | null;
  end_of_conversation: boolean;
}

export interface ChatRequest {
  messages: Message[];
}
