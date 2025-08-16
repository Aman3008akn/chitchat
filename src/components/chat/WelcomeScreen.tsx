import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Code, BookOpen, Lightbulb, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
}

const allPrompts = [
  { icon: Code, title: "Help with coding", prompt: "Can you help me debug this JavaScript function?", description: "Get assistance with programming problems" },
  { icon: BookOpen, title: "Explain concepts", prompt: "Explain quantum computing like I'm 5", description: "Break down complex topics simply" },
  { icon: Sparkles, title: "Brainstorm ideas", prompt: "Give me 10 innovative app ideas for productivity", description: "Generate ideas and solutions" },
  { icon: Lightbulb, title: "Draft an email", prompt: "Draft a professional email to a client about a project delay.", description: "Get help with writing" },
  { icon: Code, title: "Write a SQL query", prompt: "Write a SQL query to find all users who signed up in the last 30 days.", description: "Database and data analysis" },
  { icon: BookOpen, title: "Summarize an article", prompt: "Summarize the main points of this article for me: [paste article link]", description: "Get quick summaries" },
  { icon: Sparkles, title: "Plan a trip", prompt: "Plan a 3-day itinerary for a trip to Paris.", description: "Travel and planning" },
];

const permanentPrompt = {
  icon: User,
  title: "Who created this ChitChat?",
  prompt: "Who created ChitChat?",
  description: "Discover who designed your AI assistant."
};

const shuffleAndPick = (arr: any[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSendMessage,
  onNewChat
}) => {
  const [prompts, setPrompts] = useState(() => shuffleAndPick(allPrompts, 3));

  useEffect(() => {
    const interval = setInterval(() => {
      setPrompts(shuffleAndPick(allPrompts, 3));
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => clearInterval(interval);
  }, []);

  const examplePrompts = [permanentPrompt, ...prompts];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-glow">
            <MessageSquare className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to ChitChat
          </h1>
          <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
            Your intelligent AI assistant.
          </p>
          <p className="text-sm font-sans text-muted-foreground mb-8">
            (Designed By Aman Shukla)
          </p>
        </div>

        {/* Example Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {examplePrompts.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-6 text-left glassmorphism hover:bg-white/10 border-white/20 transition-smooth group animate-fade-in-slide"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                onNewChat();
                setTimeout(() => onSendMessage(example.prompt), 100);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-smooth">
                  <example.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display text-foreground mb-1">
                    {example.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {example.description}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    "{example.prompt}"
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onNewChat}
            size="lg"
            className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-glow px-8 py-3"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Start New Chat
          </Button>
        </div>

        {/* Features List */}
        <div className="mt-12 pt-8 border-t border-sidebar-border">
          <p className="text-sm text-muted-foreground mb-4">
            What can I help you with?
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="bg-muted px-3 py-1 rounded-full">Code debugging</span>
            <span className="bg-muted px-3 py-1 rounded-full">Content writing</span>
            <span className="bg-muted px-3 py-1 rounded-full">Data analysis</span>
            <span className="bg-muted px-3 py-1 rounded-full">Learning concepts</span>
            <span className="bg-muted px-3 py-1 rounded-full">Creative projects</span>
          </div>
        </div>
      </div>
    </div>
  );
};
