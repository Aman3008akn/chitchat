import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { WelcomeScreen } from './WelcomeScreen';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useChatStore } from '@/hooks/useChatStore';
import { ChatService } from '@/services/chat';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const ChatInterface: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    isLoading,
    error,
    createNewConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    setLoading,
    setError,
    getCurrentConversation,
  } = useChatStore();

  const [streamingMessageId, setStreamingMessageId] = React.useState<string | null>(null);
  const [chatService] = React.useState(() => new ChatService("AIzaSyAnpnJN3GQXaWhpjYIF41x2uPGeUJCUOdE"));
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const { toast } = useToast();

  const currentConversation = getCurrentConversation();

  // No need to update API key, it's hardcoded now
  // React.useEffect(() => {
  //   if (apiKey) {
  //     chatService.setApiKey(apiKey);
  //   }
  // }, [apiKey, chatService]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, streamingMessageId]);

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;

    // Create new conversation if none selected
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    addMessage(conversationId, userMessage);

    // Custom response for "Who created ChitChat?"
    if (content.trim().toLowerCase() === "who created chitchat?") {
      const customResponse = "ChitChat is a large language model, meticulously crafted by Aman Shukla and a dedicated team of engineers. It's designed to be a helpful and creative AI assistant, ready to assist you with a wide range of tasks from coding to brainstorming.";
      const aiMessage: Message = {
        id: uuidv4(),
        content: customResponse,
        role: 'assistant',
        timestamp: new Date(),
      };
      addMessage(conversationId, aiMessage);
      return;
    }


    // Prepare AI response message
    const aiMessageId = uuidv4();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    addMessage(conversationId, aiMessage);

    setLoading(true);
    setError(null);
    setStreamingMessageId(aiMessageId);

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Get conversation history
      const conversation = getCurrentConversation();
      const history = conversation?.messages
        .filter(msg => msg.id !== aiMessageId)
        .map(msg => ({ role: msg.role, content: msg.content })) || [];

      // Stream response
      let fullResponse = '';
      for await (const chunk of chatService.sendMessageStream(content, history)) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        fullResponse += chunk;
        updateMessage(conversationId, aiMessageId, fullResponse);
      }

      toast({
        title: "Response Complete",
        description: "AI has finished responding to your message.",
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      setError(error.message);
      
      // Remove the failed AI message
      updateMessage(conversationId, aiMessageId, '❌ Failed to get response: ' + error.message);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setStreamingMessageId(null);
      
      toast({
        title: "Generation Stopped",
        description: "AI response generation has been stopped.",
      });
    }
  };

  const handleStartNewChat = () => {
    createNewConversation();
  };

  const handleRegenerate = async (messageId: string) => {
    if (!currentConversationId) return;

    const conversation = getCurrentConversation();
    if (!conversation) return;

    // Find the message and get the user message before it
    const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex <= 0) return;

    const userMessage = conversation.messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    // Remove all messages after the user message
    const messagesToKeep = conversation.messages.slice(0, messageIndex);
    
    // Create new AI message
    const aiMessageId = uuidv4();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };

    // Update conversation with only kept messages + new AI message
    conversation.messages = [...messagesToKeep, aiMessage];
    addMessage(currentConversationId, aiMessage);

    setLoading(true);
    setError(null);
    setStreamingMessageId(aiMessageId);

    try {
      abortControllerRef.current = new AbortController();

      // Get conversation history without the new empty message
      const history = messagesToKeep.map(msg => ({ role: msg.role, content: msg.content }));

      let fullResponse = '';
      for await (const chunk of chatService.sendMessageStream(userMessage.content, history)) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        fullResponse += chunk;
        updateMessage(currentConversationId, aiMessageId, fullResponse);
      }

      toast({
        title: "Response Regenerated",
        description: "AI has provided a new response to your message.",
      });

    } catch (error: any) {
      console.error('Regenerate error:', error);
      setError(error.message);
      updateMessage(currentConversationId, aiMessageId, '❌ Failed to regenerate response: ' + error.message);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Sidebar */}
      <div className={cn(
        "w-80 border-r border-sidebar-border",
        isMobile && "hidden"
      )}>
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          createNewConversation={createNewConversation}
          setCurrentConversation={setCurrentConversation}
          deleteConversation={deleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {currentConversation.messages.length === 0 ? (
                <WelcomeScreen 
                  onSendMessage={handleSendMessage}
                  onNewChat={handleStartNewChat}
                />
              ) : (
                <div className="max-w-4xl mx-auto w-full">
                  {currentConversation.messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isStreaming={streamingMessageId === message.id}
                      onRegenerate={handleRegenerate}
                      canRegenerate={!isLoading && message.role === 'assistant' && index === currentConversation.messages.length - 1}
                    />
                  ))}
                  {isLoading && streamingMessageId && (
                    <ThinkingIndicator message="Generating response..." />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="border-t border-sidebar-border bg-destructive/10 px-6 py-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onStopGeneration={handleStopGeneration}
              disabled={false} // API key is hardcoded, so it's always enabled
            />
          </>
        ) : (
          /* Welcome Screen */
          <WelcomeScreen 
            onSendMessage={handleSendMessage}
            onNewChat={handleStartNewChat}
          />
        )}
      </div>
    </div>
  );
};
