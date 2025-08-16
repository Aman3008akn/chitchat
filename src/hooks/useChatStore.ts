import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message, ChatState } from '@/types/chat';

const STORAGE_KEY = 'chitchat-store';

// Renamed ChatState to remove apiKey and use activeChatId
interface PersistentChatState {
  conversations: Conversation[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useChatStore = () => {
  const [state, setState] = useState<PersistentChatState>({
    conversations: [],
    activeChatId: null,
    isLoading: false,
    error: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          conversations: parsed.conversations?.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })) || []
          })) || [],
          activeChatId: parsed.activeChatId || null,
        }));
      } catch (error) {
        console.error('Failed to load chat store from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      conversations: state.conversations,
      activeChatId: state.activeChatId,
    }));
  }, [state.conversations, state.activeChatId]);

  const createNewConversation = (title: string = 'New Chat'): string => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      conversations: [newConversation, ...prev.conversations],
      activeChatId: newConversation.id,
    }));

    return newConversation.id;
  };

  const addMessage = (conversationId: string, message: Message) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
              title: conv.messages.length === 0 && message.role === 'user' 
                ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                : conv.title
            }
          : conv
      ),
    }));
  };

  const updateMessage = (conversationId: string, messageId: string, content: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId ? { ...msg, content } : msg
              ),
              updatedAt: new Date(),
            }
          : conv
      ),
    }));
  };

  const deleteConversation = (conversationId: string) => {
    setState(prev => {
      const remainingConversations = prev.conversations.filter(conv => conv.id !== conversationId);
      let newActiveId = prev.activeChatId;
      if (newActiveId === conversationId) {
        newActiveId = remainingConversations.length > 0 ? remainingConversations[0].id : null;
      }
      return {
        ...prev,
        conversations: remainingConversations,
        activeChatId: newActiveId,
      };
    });
  };

  const setActiveChatId = (conversationId: string | null) => {
    setState(prev => ({ ...prev, activeChatId: conversationId }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const getCurrentConversation = (): Conversation | null => {
    if (!state.activeChatId) return null;
    return state.conversations.find(conv => conv.id === state.activeChatId) || null;
  };

  return {
    ...state,
    // Renamed for clarity
    currentConversationId: state.activeChatId, 
    setCurrentConversation: setActiveChatId,
    createNewConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    setLoading,
    setError,
    getCurrentConversation,
  };
};
