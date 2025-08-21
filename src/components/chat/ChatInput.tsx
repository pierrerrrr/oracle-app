import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CommandSuggestion } from '@/types/chat';
import {
  SendIcon,
  LoaderIcon,
  Sun,
  Moon,
  ImageIcon,
  Figma,
  MonitorIcon,
  User,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((reset: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  return { textareaRef, adjustHeight };
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm',
            'transition-all duration-200 ease-in-out',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            'border-0 bg-transparent',
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isTyping: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onResetChat: () => void;
  inputFocused: boolean;
  onInputFocus: (focused: boolean) => void;
  mousePosition: { x: number; y: number };
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isTyping,
  isDarkMode,
  onToggleTheme,
  onResetChat,
  inputFocused,
  onInputFocus,
  mousePosition,
}: ChatInputProps) {
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value),
      );

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector('[data-command-button]');

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1,
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          onChange(selectedCommand.prefix + ' ');
          setShowCommandPalette(false);

          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    onChange(selectedCommand.prefix + ' ');
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className="relative">
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-10 p-4 border-t border-border/50 backdrop-blur-sm bg-background/80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="border-border bg-card/80 relative rounded-2xl border shadow-2xl backdrop-blur-2xl">
            <div className="relative flex items-end gap-3 p-4">
              {/* Command Palette */}
              <AnimatePresence>
                {showCommandPalette && (
                  <motion.div
                    ref={commandPaletteRef}
                    className="border-border bg-card/95 absolute bottom-full left-0 right-0 mb-2 rounded-lg border shadow-lg backdrop-blur-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="p-2">
                      {commandSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          onClick={() => selectCommandSuggestion(index)}
                          className={cn(
                            'hover:bg-accent w-full rounded-md p-3 text-left transition-colors',
                            activeSuggestion === index && 'bg-accent',
                          )}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-primary">{suggestion.icon}</div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {suggestion.label}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {suggestion.description}
                              </div>
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {suggestion.prefix}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => onInputFocus(true)}
                  onBlur={() => onInputFocus(false)}
                  placeholder="Tire sua dúvida..."
                  className="min-h-[40px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  containerClassName="flex-1"
                  showRing={false}
                />
              </div>

              <div className="flex items-end gap-2">
                <motion.button
                  onClick={onResetChat}
                  className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RotateCw className="h-4 w-4" />
                </motion.button>

                <motion.button
                  onClick={onToggleTheme}
                  className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={{ rotate: isDarkMode ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </motion.div>
                </motion.button>

                <motion.button
                  onClick={onSend}
                  disabled={!value.trim() || isTyping}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed"
                  whileHover={{ scale: value.trim() ? 1.1 : 1 }}
                  whileTap={{ scale: value.trim() ? 0.9 : 1 }}
                >
                  {isTyping ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {recentCommand && (
                <motion.div
                  className="bg-accent text-accent-foreground mt-2 rounded-md px-3 py-1 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  Comando aplicado: {recentCommand}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {inputFocused && (
          <motion.div
            className="from-primary via-primary/80 to-secondary pointer-events-none fixed z-0 h-[50rem] w-[50rem] rounded-full bg-gradient-to-r opacity-[0.02] blur-[96px]"
            animate={{
              x: mousePosition.x - 400,
              y: mousePosition.y - 400,
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 150,
              mass: 0.5,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}