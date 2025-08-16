import React from 'react';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { SettingsContent } from './SettingsContent';
import { Conversation } from '@/types/chat';
import { useUIConfig } from '@/hooks/useUIConfig';

interface ChatSidebarProps {
  className?: string;
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => void;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  className,
  conversations,
  currentConversationId,
  createNewConversation,
  setCurrentConversation,
  deleteConversation,
}) => {
  const { config } = useUIConfig();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleNewChat = () => {
    createNewConversation();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "bg-sidebar flex flex-col h-full",
      className
    )} style={{
      backgroundColor: 'var(--config-surface)',
      borderColor: 'var(--config-border)',
    }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--config-border)' }}>
        <Button
          onClick={handleNewChat}
          className="w-full justify-start glassmorphism hover:bg-white/10 text-foreground border-white/20 transition-smooth"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-smooth hover:bg-sidebar-surface-hover",
                currentConversationId === conversation.id && "bg-sidebar-surface"
              )}
              onClick={() => setCurrentConversation(conversation.id)}
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {conversation.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(conversation.updatedAt)}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <ThemeToggle />
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-sidebar-surface-hover"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-chat-surface border-sidebar-border">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <SettingsContent />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
