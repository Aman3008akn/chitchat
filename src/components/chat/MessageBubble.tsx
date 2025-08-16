import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Bot, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: (messageId: string) => void;
  canRegenerate?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isStreaming = false,
  onRegenerate,
  canRegenerate = false
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "group flex gap-4 p-6 transition-smooth animate-fade-in-slide"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-gradient-primary text-white shadow-glow" 
          : "bg-chat-surface border border-sidebar-border"
      )}>
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-md font-semibold font-display text-foreground">
            {isUser ? 'You' : 'ChitChat AI'}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canRegenerate && !isUser && onRegenerate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRegenerate(message.id)}
                className="p-1 h-auto"
                title="Regenerate response"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="p-1 h-auto"
              title="Copy message"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        <div className={cn(
          "prose prose-invert prose-sm max-w-none glassmorphism p-4 rounded-lg border border-white/10",
          isUser ? "bg-message-user/10" : "bg-message-ai/10",
          isStreaming && "animate-pulse"
        )}>
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const isInline = !className || !language;

                return !isInline ? (
                  <div className="relative">
                    <SyntaxHighlighter
                      style={oneDark as any}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !bg-chat-background !p-4 !m-0"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 p-1 h-auto opacity-70 hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(String(children))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                return <>{children}</>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    {children}
                  </blockquote>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 space-y-1">{children}</ol>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    className="text-primary underline hover:text-primary-glow transition-smooth"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400"></div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
