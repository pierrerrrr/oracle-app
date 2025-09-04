# Oracle - AI Assistant for Internal Processes

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk" />
</div>

## 📋 Sobre o Projeto

Oracle é um assistente de IA desenvolvido para automatizar e facilitar o acesso a processos e procedimentos internos da empresa. A aplicação utiliza algoritmos de similaridade textual para encontrar as melhores respostas baseadas em uma base de conhecimento estruturada.

### ✨ Funcionalidades Principais

- 🤖 **Assistente Inteligente**: Responde perguntas sobre processos internos usando algoritmos de similaridade
- 🔐 **Autenticação Segura**: Integração com Clerk para autenticação de usuários
- 🎨 **Interface Moderna**: Design responsivo com modo escuro/claro
- 📱 **Progressive Web App**: Experiência otimizada para desktop e mobile
- ⚡ **Respostas Rápidas**: Sugestões de comandos para agilizar consultas
- 🔍 **Busca Inteligente**: Busca por tags, títulos e similaridade de texto

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações e transições
- **Radix UI** - Componentes acessíveis e customizáveis

### Autenticação & Segurança
- **Clerk** - Plataforma de autenticação completa
- **Next.js API Routes** - Endpoints seguros para o backend

### Ferramentas de Desenvolvimento
- **ESLint** - Linting e qualidade de código
- **PostCSS** - Processamento de CSS

## 🚀 Começando

### Pré-requisitos

- Node.js 18.0 ou superior
- npm, yarn, pnpm ou bun
- Conta no Clerk para autenticação

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/oracle-app.git
cd oracle-app/frontend
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Adicione suas chaves do Clerk:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

5. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── api/
│   │   │   └── assistant/      # API do assistente IA
│   │   ├── globals.css         # Estilos globais
│   │   ├── layout.tsx          # Layout raiz
│   │   └── page.tsx            # Página principal
│   ├── components/             # Componentes React
│   │   ├── auth/               # Componentes de autenticação
│   │   ├── chat/               # Componentes do chat
│   │   └── ui/                 # Componentes de interface
│   ├── data/
│   │   └── processos.json      # Base de conhecimento
│   └── lib/                    # Utilitários e configurações
├── public/                     # Arquivos estáticos
├── tailwind.config.ts          # Configuração do Tailwind
└── next.config.js              # Configuração do Next.js
```

## 🤖 Como Funciona o Assistente

O Oracle utiliza um algoritmo de similaridade textual para encontrar as melhores respostas:

1. **Normalização de Texto**: Remove acentos, converte para minúsculas e limpa caracteres especiais
2. **Cálculo de Similaridade**: Compara a pergunta com títulos, tags e perguntas da base de conhecimento
3. **Pontuação Ponderada**: Aplica pesos diferentes para títulos (0.9), tags (0.8) e perguntas (1.0)
4. **Filtro de Qualidade**: Só retorna respostas com score mínimo de 0.2

### Exemplo de Uso

```typescript
// Pergunta do usuário
"Como solicitar acesso ao GA4?"

// O sistema encontra correspondência em:
// - Tags: ["ga4", "google analytics", "acesso"]
// - Título: "Solicitar acesso ao Google Analytics 4"
// - Retorna: Processo completo com instruções
```

## 📊 Base de Conhecimento

A aplicação inclui processos para:

- **Marketing Digital**: E-mail marketing, alterações de arte
- **Analytics**: Acesso ao Google Analytics 4
- **TI**: Suporte técnico, configuração VPN
- **RH**: Solicitação de férias, reembolsos
- **Comunicação**: Agendamento de reuniões
- **Ferramentas**: Softwares utilizados na empresa

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção

# Qualidade de código
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint automaticamente
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Deploy automático via GitHub**
```bash
# Conecte seu repositório no painel da Vercel
# Configure as variáveis de ambiente
# Deploy automático a cada push
```

2. **Deploy via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Outras Plataformas

A aplicação é compatível com qualquer plataforma que suporte Node.js e Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔐 Segurança

- ✅ Autenticação obrigatória via Clerk
- ✅ Validação de entrada nas APIs
- ✅ Rate limiting implícito
- ✅ Sanitização de dados
- ✅ Headers de segurança configurados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Sistema de feedback para respostas
- [ ] Aprendizado automático com novas perguntas
- [ ] Integração com Slack/Teams
- [ ] Dashboard administrativo
- [ ] Analytics de uso
- [ ] Suporte a múltiplos idiomas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido por **pierrerrrr**

- GitHub: [@pierrerrrr](https://github.com/pierrerrrr)

---

<div align="center">
  <strong>Oracle AI Assistant</strong> - Facilitando o acesso ao conhecimento interno da empresa
</div>
