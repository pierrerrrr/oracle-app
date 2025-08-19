import React, { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSendMessage = async () => {
    if (value.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: value.trim(),
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setHasStartedChat(true);
      const currentMessage = value.trim();
      setValue('');

      setIsTyping(true);

      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentMessage }),
        });

        const data = await response.json();

        if (response.ok) {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: data.answer,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, aiResponse]);
        } else {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: data.answer || 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, errorResponse]);
        }
      } catch (error) {
        console.error('Erro ao chamar API:', error);
        
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Desculpe, não consegui me conectar ao servidor. Verifique sua conexão e tente novamente.',
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    handleSendMessage();
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

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="text-foreground relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent">
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <div className="bg-primary/10 absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter" />
          <div className="bg-secondary/10 absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter delay-700" />
          <div className="bg-primary/10 absolute top-1/4 right-1/3 h-64 w-64 animate-pulse rounded-full mix-blend-normal blur-[96px] filter delay-1000" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl h-full flex flex-col">
          <ChatHeader isTyping={isTyping} />

          {!hasStartedChat ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <ChatMessages messages={messages} isTyping={isTyping} />
            </div>
          )}

          <ChatInput
            value={value}
            onChange={setValue}
            onSend={handleSendMessage}
            isTyping={isTyping}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            inputFocused={inputFocused}
            onInputFocus={setInputFocused}
            mousePosition={mousePosition}
          />
        </div>
      </div>
    </div>
  );
}
