import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Process {
  id: string;
  titulo: string;
  categoria: string;
  tags: string[];
  pergunta: string;
  resposta: string;
}

interface ProcessData {
  processos: Process[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(text1: string, text2: string): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');

  let matches = 0;
  const totalWords = Math.max(words1.length, words2.length);

  words1.forEach(word => {
    if (word.length > 2 && words2.includes(word)) {
      matches++;
    }
  });

  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    matches += 2;
  }

  return matches / totalWords;
}

function findBestMatch(query: string, processos: Process[]): Process | null {
  let bestMatch: Process | null = null;
  let bestScore = 0;
  const minScore = 0.2; // score pra validar a resposta

  processos.forEach(processo => {
    const questionScore = calculateSimilarity(query, processo.pergunta);

    const tagsText = processo.tags.join(' ');
    const tagsScore = calculateSimilarity(query, tagsText) * 0.8;

    const titleScore = calculateSimilarity(query, processo.titulo) * 0.9;

    const finalScore = Math.max(questionScore, tagsScore, titleScore);

    if (finalScore > bestScore && finalScore > minScore) {
      bestScore = finalScore;
      bestMatch = processo;
    }
  });

  return bestMatch;
}

function loadProcess(): ProcessData {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'processos.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao carregar processos:', error);
    return { processos: [] };
  }
}

async function generateAIResponse(userMessage: string, processosContext: Process[]): Promise<string> {
  try {
    const contextMarkdown = processosContext.map(p => 
      `## ${p.titulo} [${p.categoria}]
      **Tags:** ${p.tags.join(', ')}
      **P:** ${p.pergunta}
      **R:** ${p.resposta}
      ---`
    ).join('\n\n');

    const systemPrompt = `Você é um assistente virtual especializado em processos internos de uma empresa. Sua missão é ajudar funcionários com dúvidas sobre procedimentos, ferramentas e processos da empresa.

    🏢 **CONTEXTO DA EMPRESA:**
    Você tem acesso à base de conhecimento completa da empresa com ${processosContext.length} processos documentados, incluindo:
    - Processos de Arte e Design
    - Marketing Digital  
    - Analytics
    - Tecnologia da Informação
    - Recursos Humanos
    - Financeiro
    - Comunicação Interna
    - Ferramentas e Softwares
    - Suporte e Atendimento

    📚 **BASE DE CONHECIMENTO:**

    ${contextMarkdown}

    🎯 **INSTRUÇÕES:**
    1. Analise a pergunta do usuário e encontre informações relevantes na base de conhecimento
    2. Responda de forma humanizada, clara e objetiva
    3. Use um tom amigável e profissional
    4. Se a informação estiver na base, forneça uma resposta completa e estruturada
    5. Se a informação não estiver na base, seja honesto e sugira tópicos relacionados que estão disponíveis
    6. Use emojis moderadamente para tornar a resposta mais amigável
    7. Sempre formate a resposta de forma organizada (use listas, tópicos, etc.)
    8. Se relevante, mencione prazos, SLAs ou informações importantes destacadas

    ⚠️ **IMPORTANTE:** Baseie suas respostas APENAS nas informações fornecidas na base de conhecimento. Não invente informações que não estão documentadas.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta no momento.';
  } catch (error) {
    console.error('Erro ao gerar resposta da IA:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        error: 'Mensagem é obrigatória',
        answer: 'Por favor, digite uma pergunta válida.'
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'API Key não configurada',
        answer: 'Desculpe, o serviço de IA não está configurado. Entre em contato com o suporte técnico.'
      }, { status: 500 });
    }

    const { processos } = loadProcess();

    if (processos.length === 0) {
      return NextResponse.json({
        error: 'Dados não disponíveis',
        answer: 'Desculpe, não consegui acessar a base de conhecimento no momento. Tente novamente em alguns instantes.'
      }, { status: 500 });
    }

    try {
      const aiResponse = await generateAIResponse(message.trim(), processos);

      return NextResponse.json({
        answer: aiResponse,
        categoria: 'Resposta Inteligente',
        titulo: 'Assistente Virtual',
        source: 'ai'
      });

    } catch (aiError) {
      console.error('Erro na IA, usando busca por similaridade como fallback:', aiError);

      const bestMatch = findBestMatch(message.trim(), processos);

      if (bestMatch) {
        return NextResponse.json({
          answer: bestMatch.resposta,
          categoria: bestMatch.categoria,
          titulo: bestMatch.titulo,
          source: 'similarity'
        });
      } else {
        const defaultResponse = `Não encontrei uma resposta específica para sua pergunta sobre "${message}". 

        Aqui estão alguns tópicos que posso ajudar:
        • Como criar tarefa de alteração de arte
        • Prazos de produção de e-mail marketing  
        • Solicitar acesso ao Google Analytics (GA4)
        • Abrir chamados no suporte de TI
        • Solicitar férias
        • Configurar acesso VPN

        Você pode reformular sua pergunta ou perguntar sobre algum desses tópicos específicos.`;

        return NextResponse.json({
          answer: defaultResponse,
          categoria: 'Ajuda Geral',
          titulo: 'Tópicos Disponíveis',
          source: 'fallback'
        });
      }
    }

  } catch (error) {
    console.error('Erro no endpoint assistant:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      answer: 'Desculpe, ocorreu um erro interno. Nossa equipe técnica foi notificada e está trabalhando para resolver o problema.'
    }, { status: 500 });
  }
}