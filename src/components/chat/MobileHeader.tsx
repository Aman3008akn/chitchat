import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatSidebar } from './ChatSidebar';
import { Conversation } from '@/types/chat';
import { useUIConfig } from '@/hooks/useUIConfig';

interface MobileHeaderProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => void;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  conversations,
  currentConversationId,
  createNewConversation,
  setCurrentConversation,
  deleteConversation,
}) => {
  const { config } = useUIConfig();

  return (
    <div className="flex items-center justify-between p-4 border-b md:hidden" style={{
      backgroundColor: 'var(--config-surface)',
      borderColor: 'var(--config-border)',
    }}>
      <h1 className="text-lg font-semibold">{config?.branding.appName || 'ChitChat'}</h1>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <ChatSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            createNewConversation={createNewConversation}
            setCurrentConversation={setCurrentConversation}
            deleteConversation={deleteConversation}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
