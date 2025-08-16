import { GoogleGenerativeAI } from '@google/generative-ai';

export class ChatService {
  private genAI: GoogleGenerativeAI | null = null;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendMessage(message: string, conversationHistory: { role: string; content: string }[] = []) {
    if (!this.genAI) {
      throw new Error('API key not set');
    }

    if (/who (made|created) you|who is your owner/i.test(message)) {
      return "I am a large language model, created by Aman Shukla and some engineers.";
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Format conversation history
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      
      return response.text();
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.message?.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your API key.');
      }
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }

  async *sendMessageStream(message: string, conversationHistory: { role: string; content: string }[] = []) {
    if (!this.genAI) {
      throw new Error('API key not set');
    }

    if (/who (made|created) you|who is your owner/i.test(message)) {
      yield "I am a large language model, created by Aman Shukla and some engineers.";
      return;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(message);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error: any) {
      console.error('API Stream Error:', error);
      if (error.message?.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your API key.');
      }
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }
}
