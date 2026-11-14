export interface RiskPoint {
  title: string;
  description: string;
  severity: 'alta' | 'media' | 'baixa';
}

export interface Verdict {
  rating: string;
  explanation: string;
}

export interface AnalysisResult {
  resumoExecutivo: string;
  pontosAtencao: RiskPoint[];
  veredito: Verdict;
}

const SYSTEM_PROMPT = `Você é um advogado especialista em análise de contratos com decades de experiência. Sua tarefa é analisar contratos e termos jurídicos em português brasileiro.

Analise o documento fornecido e retorne EXCLUSIVAMENTE um objeto JSON válido (sem markdown, sem texto adicional, sem \`\`\`json) com a seguinte estrutura exata:

{
  "resumoExecutivo": "Um parágrafo claro e objetivo (3-5 frases) resumindo o contrato: qual é o objeto, as partes envolvidas, obrigações principais, prazo e contraprestação.",
  "pontosAtencao": [
    {
      "title": "Título curto do risco (máx 8 palavras)",
      "description": "Explicação detalhada do risco jurídico, cláusula abusiva, obrigação desproporcional, ambiguidade ou ponto de atenção (2-4 frases). Referencie a cláusula quando possível.",
      "severity": "alta | media | baixa"
    },
    {
      "title": "...",
      "description": "...",
      "severity": "alta | media | baixa"
    },
    {
      "title": "...",
      "description": "...",
      "severity": "alta | media | baixa"
    }
  ],
  "veredito": {
    "rating": "Uma classificação curta como: 'Favorável', 'Cautela Recomendada', 'Risco Elevado', 'Desfavorável'",
    "explanation": "Justificativa do veredito em 2-3 frases, explicando o motivo da classificação."
  }
}

Regras:
- Identifique exatamente 3 pontos de atenção ou riscos jurídicos mais relevantes.
- A severidade deve refletir o impacto jurídico/financeiro real para quem assina.
- Seja imparcial, técnico e preciso.
- Retorne SOMENTE o JSON, nada mais.`;

export async function analyzeContract(
  apiKey: string,
  documentText: string,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Analise o seguinte documento:\n\n${documentText}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Erro ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {
      // keep default message
    }

    if (response.status === 400 && message.toLowerCase().includes('api key')) {
      throw new Error('Sua API Key do Google Gemini parece ser inválida. Verifique a chave e tente novamente.');
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições atingido na API do Gemini. Aguarde alguns instantes e tente novamente.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('A API não retornou conteúdo. O documento pode estar vazio ou muito curto para análise.');
  }

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to extract JSON from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Não foi possível interpretar a resposta da IA. Tente novamente.');
    }
  }

  if (!parsed.resumoExecutivo || !Array.isArray(parsed.pontosAtencao) || !parsed.veredito) {
    throw new Error('A resposta da IA não contém todos os campos esperados. Tente novamente.');
  }

  return parsed;
}
