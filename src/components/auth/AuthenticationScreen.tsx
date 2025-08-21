import React from 'react';
import { motion } from 'framer-motion';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Sparkles, Shield, Users, Zap, Github, ShieldCheck } from 'lucide-react';

export function AuthenticationScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md p-8">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and title */}
          <div className="space-y-4">
            <motion.div
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">Oracle</h1>
              <p className="text-muted-foreground mt-2">
                Assistente de Processos Internos
              </p>
            </div>
          </div>

          {/* Features */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Acesso seguro e personalizado</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>Respostas instantâneas sobre processos</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>Suporte completo para equipes</span>
              </div>
            </div>
          </motion.div>

          {/* Authentication buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <SignInButton mode="modal">
              <Button className="w-full" size="lg">
                Fazer Login
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button variant="outline" className="w-full" size="lg">
                Criar Conta
              </Button>
            </SignUpButton>
          </motion.div>

          <motion.p
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Ao continuar, você concorda com nossos termos de serviço.
          </motion.p>
          <motion.p className='text-xs text-muted-foreground' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Developed by <span className='text-primary'>pierrerrrr</span>
          </motion.p>
          <motion.p className='text-xs text-muted-foreground flex justify-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <a href="https://github.com/pierrerrrr" target='_blank'><Github /></a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
