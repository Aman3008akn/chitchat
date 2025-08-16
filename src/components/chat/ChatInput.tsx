import React from 'react';
import { Send, Square, Image, Camera, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUIConfig } from '@/hooks/useUIConfig';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
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
  const { config } = useUIConfig();
  const [message, setMessage] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isLoading || disabled) return;
    
    onSendMessage(message.trim(), selectedFile || undefined);
    setMessage('');
    setSelectedFile(null);
    
    // Reset file inputs
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleStop = () => {
    onStopGeneration?.();
  };

  return (
    <div className="border-t bg-chat-background p-4" style={{
      borderColor: 'var(--config-border)',
      backgroundColor: 'var(--config-background)',
    }}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          <input type="file" ref={pdfInputRef} accept=".pdf" className="hidden" onChange={handleFileChange} />

          {selectedFile && (
            <div className="absolute bottom-full left-0 right-0 bg-background/70 backdrop-blur-sm p-2 rounded-t-lg border-t border-x border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate px-2">Attached: {selectedFile.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="h-auto p-1">Remove</Button>
              </div>
            </div>
          )}

          <div className="relative flex items-end gap-2 glassmorphism p-2 rounded-xl border border-white/20 focus-within:border-primary transition-smooth">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              onClick={() => imageInputRef.current?.click()}
              title="Upload Image"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              onClick={() => cameraInputRef.current?.click()}
              title="Use Camera"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              onClick={() => pdfInputRef.current?.click()}
              title="Upload PDF"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
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
                disabled={(!message.trim() && !selectedFile) || disabled}
                className={cn(
                  "flex-shrink-0 h-8 w-8 p-0 transition-smooth",
                  (message.trim() || selectedFile) && !disabled
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
