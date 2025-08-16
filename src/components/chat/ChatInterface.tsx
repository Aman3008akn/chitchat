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
import * as pdfjsLib from 'pdfjs-dist';
import { AlertCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';

// Set up the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { MobileHeader } from './MobileHeader';
import { useUIConfig } from '@/hooks/useUIConfig';
import { Skeleton } from '../ui/skeleton';

export const ChatInterface: React.FC = () => {
  const { config, isLoading: isConfigLoading } = useUIConfig();
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

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSendMessage = async (content: string, file?: File) => {
    let conversationId = currentConversationId;

    // Create new conversation if none selected
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    let fileContent = '';
    let attachment;

    if (file) {
      try {
        const fileUrl = await readFileAsBase64(file);
        attachment = { name: file.name, type: file.type, url: fileUrl };

        if (file.type.startsWith('image/')) {
          const worker = await createWorker('eng');
          const { data: { text } } = await worker.recognize(fileUrl);
          fileContent = `[Image Content: ${text}]`;
          await worker.terminate();
        } else if (file.type === 'application/pdf') {
          const fileBuffer = await readFileAsArrayBuffer(file);
          const pdf = await pdfjsLib.getDocument(fileBuffer).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => (item as any).str).join(' ');
          }
          fileContent = `[PDF Content: ${text}]`;
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast({
          title: "File Error",
          description: "Could not process the attached file.",
          variant: "destructive",
        });
        return;
      }
    }

    const fullContent = content + (fileContent ? `\n\n${fileContent}` : '');

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: content,
      role: 'user',
      timestamp: new Date(),
      attachment,
    };
    addMessage(conversationId, userMessage);

    // Custom response for owner/creator questions
    const ownerKeywords = [
      'who made you', 'who created you', 'who built you', 'who developed you', 'who owns you',
      'your founder', 'your creator', 'your developer', 'your owner', 'made by who', 'created by who',
      'built by who', 'kisne banaya', 'kisne create kiya', 'kisne develop kiya', 'kisne banayi',
      'kisne design kiya', 'tumhe kisne banaya', 'tumhare malik kaun hai', 'kisne banaya tumhe'
    ];
    if (ownerKeywords.some(keyword => fullContent.trim().toLowerCase().includes(keyword))) {
      const customResponse = "👉 “I am a large language model, created by Aman Shukla and some engineers.”";
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
      for await (const chunk of chatService.sendMessageStream(fullContent, history)) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        fullResponse += chunk;
        updateMessage(conversationId, aiMessageId, replaceGoogleWithAmanShukla(fullResponse));
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

  // Function to replace "Google" with "Aman Shukla" in AI responses
  const replaceGoogleWithAmanShukla = (text: string): string => {
    return text.replace(/Google/gi, 'Aman Shukla');
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
        updateMessage(currentConversationId, aiMessageId, replaceGoogleWithAmanShukla(fullResponse));
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

  if (isConfigLoading) {
    return (
      <div className="flex h-screen bg-chat-background">
        <div className="w-80 border-r border-sidebar-border p-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-16 w-1/2 self-end" />
            <Skeleton className="h-24 w-3/4" />
            <Skeleton className="h-16 w-1/2 self-end" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-chat-background" style={{
      backgroundColor: 'var(--config-background)',
      color: 'var(--config-text)',
    }}>
      {/* Sidebar */}
      <div className={cn(
        "border-r",
        isMobile && "hidden"
      )} style={{
        width: 'var(--config-sidebar-width)',
        borderColor: 'var(--config-border)',
      }}>
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
        <MobileHeader
          conversations={conversations}
          currentConversationId={currentConversationId}
          createNewConversation={createNewConversation}
          setCurrentConversation={setCurrentConversation}
          deleteConversation={deleteConversation}
        />
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
              <div className="border-t bg-destructive/10 px-6 py-3" style={{
                borderColor: 'var(--config-border)',
                backgroundColor: 'var(--config-error-bg)',
                color: 'var(--config-error)',
              }}>
                <div className="flex items-center gap-2">
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
