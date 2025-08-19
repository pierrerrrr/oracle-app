import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-card/80 border border-border/50 rounded-2xl rounded-tl-md p-4 max-w-[80%] backdrop-blur-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </motion.div>
  );
}
