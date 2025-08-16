import React from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  disabled = false,
}) => {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleStop = () => {
    onStopGeneration?.();
  };

  return (
    <div className="border-t border-sidebar-border bg-chat-background p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2 glassmorphism p-2 rounded-xl border border-white/20 focus-within:border-primary transition-smooth">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Enter your API key in settings to start chatting..." : "Message ChitChat AI..."}
              disabled={disabled || isLoading}
              className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] max-h-[200px] text-sm placeholder:text-muted-foreground"
              rows={1}
            />
            
            {isLoading ? (
              <Button
                type="button"
                size="sm"
                onClick={handleStop}
                className="flex-shrink-0 h-8 w-8 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || disabled}
                className={cn(
                  "flex-shrink-0 h-8 w-8 p-0 transition-smooth",
                  message.trim() && !disabled
                    ? "bg-primary hover:bg-primary-glow text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};
