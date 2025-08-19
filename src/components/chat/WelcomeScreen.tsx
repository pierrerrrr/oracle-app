import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { CommandSuggestions } from './CommandSuggestions';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const { user } = useUser();
  const userName = user?.firstName || user?.username || 'Usuário';

  return (
    <motion.div
      className="relative z-10 space-y-8 flex-1 flex flex-col justify-center p-6 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="space-y-3 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-regular"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Olá,{' '}
          <span className="tracking-tight bg-gradient-to-r from-[#d97757] via-[#d97757]/90 to-[#d97757]/70 bg-clip-text text-transparent">
            {userName}!
          </span>{' '}
          <br />
        </motion.h1>
        <motion.p
          className="text-3xl text-muted-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Como posso ajudar você hoje?
        </motion.p>
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Tire suas dúvidas sobre processos e procedimentos internos.
        </motion.p>
      </div>

      <CommandSuggestions onSuggestionClick={onSuggestionClick} />
    </motion.div>
  );
}
