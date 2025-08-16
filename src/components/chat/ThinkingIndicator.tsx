import React from 'react';
import { Bot } from 'lucide-react';

interface ThinkingIndicatorProps {
  message?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
  message = "AI is thinking..." 
}) => {
  return (
    <div className="group flex gap-4 p-6 transition-smooth">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-chat-surface border border-sidebar-border">
        <Bot className="h-5 w-5" />
      </div>

      {/* Thinking Content */}
      <div className="flex-1 min-w-0">
        <div className="text-md font-semibold font-display text-foreground mb-2">
          ChitChat AI
        </div>
        
        {/* Thinking animation */}
        <div className="flex items-center gap-3 glassmorphism p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-wave"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-muted-foreground">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
