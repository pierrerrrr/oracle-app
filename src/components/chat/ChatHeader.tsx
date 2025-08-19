import React from 'react';
import { motion } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  isTyping: boolean;
}

export function ChatHeader({ isTyping }: ChatHeaderProps) {
  return (
    <>
      <div className="absolute top-4 right-4 z-20">
        <UserButton />
      </div>

      <motion.div
        className="fixed top-0 left-0 right-0 z-10 p-4 border-b border-border/50 backdrop-blur-sm bg-background/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-medium">Assistente Oracle</h2>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? 'Digitando...' : 'Online'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
