import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

function loadProcessos(): ProcessData {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'processos.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao carregar processos:', error);
    return { processos: [] };
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
    
    const { processos } = loadProcessos();
    
    if (processos.length === 0) {
      return NextResponse.json({ 
        error: 'Dados não disponíveis',
        answer: 'Desculpe, não consegui acessar a base de conhecimento no momento. Tente novamente em alguns instantes.' 
      }, { status: 500 });
    }
    
    const bestMatch = findBestMatch(message.trim(), processos);
    
    if (bestMatch) {
      return NextResponse.json({
        answer: bestMatch.resposta,
        categoria: bestMatch.categoria,
        titulo: bestMatch.titulo
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
        titulo: 'Tópicos Disponíveis'
      });
    }
    
  } catch (error) {
    console.error('Erro no endpoint assistant:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      answer: 'Desculpe, ocorreu um erro interno. Nossa equipe técnica foi notificada e está trabalhando para resolver o problema.' 
    }, { status: 500 });
  }
}


// WIP: adicionar uma forma de toda pergunta que o assistente não souber responde, além de retornar uma mensagem padrão, ele adiciona em um arquivo new_processos.json e atualiza o arquivo processos.json com a nova pergunta e resposta
// isso pode ser feito com um endpoint separado ou dentro do mesmo endpoint, mas com uma flag
// que indica se é uma nova pergunta ou não. Assim, o assistente aprende com as novas perguntas e respostas.