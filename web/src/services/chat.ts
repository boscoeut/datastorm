import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface GeminiProxyRequest {
  task: string;
  prompt: string;
  data?: Record<string, any>;
  expectedOutput?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<Record<string, any>>;
}

export interface GeminiProxyResponse {
  success: boolean;
  data?: {
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: string;
  timestamp: string;
  source: string;
}

export class ChatService {
  private static instance: ChatService;
  private messages: ChatMessage[] = [];

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(content: string): Promise<ChatMessage> {
    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    try {
      // Call gemini proxy function
      const response = await this.callGeminiProxy({
        task: 'chat',
        prompt: content,
        model: 'gemini-2.0-flash-exp',
        temperature: 0.7,
        maxTokens: 2048,
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: this.generateId(),
        content: response.success ? response.data?.text || 'No response received' : `Error: ${response.error}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      this.messages.push(assistantMessage);

      return assistantMessage;
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: this.generateId(),
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      this.messages.push(errorMessage);

      return errorMessage;
    }
  }

  private async callGeminiProxy(request: GeminiProxyRequest): Promise<GeminiProxyResponse> {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: request,
    });

    if (error) {
      throw new Error(`Failed to call gemini proxy: ${error.message}`);
    }

    return data as GeminiProxyResponse;
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const chatService = ChatService.getInstance();
