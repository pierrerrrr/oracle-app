'use client';

import { useEffect, useRef, useCallback, useTransition } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ImageIcon,
  Figma,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
  User,
  Bot,
  Moon,
  Sun,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

function MessageBubble({ message }: { message: Message }) {
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

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
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

export default function AnimatedAIChat(userName: string) {
  userName = 'Pierre';
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: 'Como criar a tarefa de alteração de arte?',
      description: 'Explique como criar uma tarefa de alteração de arte',
      prefix: '/alt',
    },
    {
      icon: <Figma className="h-4 w-4" />,
      label: 'Quantos dias o e-mail marketing leva para ser produzido?',
      description: 'Explique quantos dias leva para produzir um e-mail marketing',
      prefix: '/figma',
    },
    {
      icon: <MonitorIcon className="h-4 w-4" />,
      label: 'Acessos ao GA4',
      description: 'Informar para quem solciitar o acesso ao GA4',
      prefix: '/page',
    },
  ];

  // Inicializar tema do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPreference);

    setIsDarkMode(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Bloquear rolagem da página
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup: restaurar rolagem quando o componente for desmontado
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
          setValue(selectedCommand.prefix + ' ');
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
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (value.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: value.trim(),
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setHasStartedChat(true);
      setValue('');
      adjustHeight(true);

      // mock da resposta da IA - provisório
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(userMessage.content),
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000 + Math.random() * 1000);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    // resposta padrão mockada - provisório
    const responses = [
      "Entendi sua dúvida! Para criar uma tarefa de alteração de arte, você deve seguir os seguintes passos: 1) Acesse o sistema interno, 2) Navegue até a seção de solicitações, 3) Preencha o formulário com detalhes específicos da alteração necessária.",
      "O processo de produção de e-mail marketing normalmente leva entre 3 a 5 dias úteis, dependendo da complexidade do layout e da quantidade de revisões necessárias.",
      "Para acessar o GA4, você deve solicitar permissões ao time de Analytics através do email analytics@empresa.com, informando seu nome, departamento e justificativa de uso.",
      "Posso ajudar você com mais detalhes sobre esse processo. Existe algum aspecto específico que gostaria de saber mais?",
      "Baseado na sua pergunta, recomendo consultar também nossa documentação interna disponível no portal corporativo.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + ' ');
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // desce até a ultima mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="text-foreground relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent">
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <div className="bg-primary/10 absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter" />
          <div className="bg-secondary/10 absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter delay-700" />
          <div className="bg-primary/10 absolute top-1/4 right-1/3 h-64 w-64 animate-pulse rounded-full mix-blend-normal blur-[96px] filter delay-1000" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl h-full flex flex-col">
          {!hasStartedChat ? (
            <motion.div
              className="relative z-10 space-y-8 flex-1 flex flex-col justify-center p-6 overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="space-y-6 text-center">
                <motion.h1
                  className="text-4xl md:text-5xl font-regular tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Olá, {userName}!
                </motion.h1>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  Tire suas dúvidas sobre processos e procedimentos internos.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {commandSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setValue(suggestion.label);
                      handleSendMessage();
                    }}
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
            </motion.div>
          ) : (
            // Área de chat
            <div className="flex-1 flex flex-col h-full">
              {/* Header do chat */}
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

              {/* Área das mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-24 pb-32">
                <AnimatePresence>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>

                {/* Indicador de digitação */}
                {isTyping && (
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
                      <TypingDots />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input área */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-10 p-4 border-t border-border/50 backdrop-blur-sm bg-background/80"
            initial={hasStartedChat ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
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

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                      <motion.div
                        key={index}
                        className="bg-accent text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1 text-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Paperclip className="h-3 w-3" />
                        <span>{attachment}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="hover:text-destructive ml-1"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Textarea */}
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Tire sua dúvida..."
                    className="min-h-[40px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    containerClassName="flex-1"
                    showRing={false}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-end gap-2">
                  {/* <motion.button
                    onClick={handleAttachFile}
                    className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </motion.button> */}

                  <motion.button
                    onClick={toggleTheme}
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
                    onClick={handleSendMessage}
                    disabled={!value.trim() || isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed"
                    whileHover={{ scale: value.trim() ? 1.1 : 1 }}
                    whileTap={{ scale: value.trim() ? 0.9 : 1 }}
                  >
                    {isPending ? (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Recent command notification */}
            <AnimatePresence>
              {recentCommand && (
                <motion.div
                  className="bg-accent text-accent-foreground mt-2 rounded-md px-3 py-1 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Sparkles className="mr-2 inline h-3 w-3" />
                  Comando aplicado: {recentCommand}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>
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
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="ml-1 flex items-center">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="bg-primary mx-0.5 h-1.5 w-1.5 rounded-full"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
          }}
        />
      ))}
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = rippleKeyframes;
  document.head.appendChild(style);
}


// WIP: DEIXAR A TEXT AREA FIXED