import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn(
        'max-w-[80%] rounded-2xl p-4 backdrop-blur-sm border border-border/50',
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-md'
          : 'bg-card/80 rounded-tl-md'
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className={cn(
          'text-xs mt-2 opacity-70',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </motion.div>
  );
}
