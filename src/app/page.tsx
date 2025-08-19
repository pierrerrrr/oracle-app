'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AuthenticationScreen } from '@/components/auth/AuthenticationScreen';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function AnimatedAIChat() {
  return (
    <>
      <SignedOut>
        <AuthenticationScreen />
      </SignedOut>
      <SignedIn>
        <ChatInterface />
      </SignedIn>
    </>
  );
}
