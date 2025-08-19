import React from 'react';
import { motion } from 'framer-motion';
import { CommandSuggestion } from '@/types/chat';
import { 
  ImageIcon, 
  Figma, 
  MonitorIcon, 
  User 
} from 'lucide-react';

interface CommandSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function CommandSuggestions({ onSuggestionClick }: CommandSuggestionsProps) {
  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: 'Como criar a tarefa de alteração de arte?',
      description: 'Processo para solicitar alterações em materiais visuais',
      prefix: '/arte',
    },
    {
      icon: <Figma className="h-4 w-4" />,
      label: 'Quantos dias o e-mail marketing leva para ser produzido?',
      description: 'Prazos e etapas da produção de campanhas de email',
      prefix: '/email',
    },
    {
      icon: <MonitorIcon className="h-4 w-4" />,
      label: 'Como solicitar acesso ao GA4?',
      description: 'Processo para obter permissões no Google Analytics',
      prefix: '/ga4',
    },
    {
      icon: <MonitorIcon className="h-4 w-4" />,
      label: 'Como abrir chamado no suporte de TI?',
      description: 'Procedimentos para solicitar suporte técnico',
      prefix: '/ti',
    },
    {
      icon: <User className="h-4 w-4" />,
      label: 'Como solicitar férias?',
      description: 'Processo para requisitar período de descanso',
      prefix: '/ferias',
    },
    {
      icon: <MonitorIcon className="h-4 w-4" />,
      label: 'Como configurar acesso VPN?',
      description: 'Instruções para trabalho remoto via VPN',
      prefix: '/vpn',
    },
  ];

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      {commandSuggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          onClick={() => onSuggestionClick(suggestion.label)}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 text-left transition-all duration-300 hover:bg-card/50 hover:border-border"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              {suggestion.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{suggestion.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {suggestion.description}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
