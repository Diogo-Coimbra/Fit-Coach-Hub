/**
 * Utilitários para processamento e interpretação resiliente de respostas de IA (Gemini).
 */

/**
 * Extrai e converte de forma resiliente blocos JSON devolvidos por LLMs.
 * Trata cercaduras de código markdown, texto circundante e vírgulas finais inválidas (trailing commas).
 */
export function extractAndParseJson<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Resposta de IA vazia ou inválida.');
  }

  // 1. Remover cercaduras de código markdown (```json ... ``` ou ``` ... ```)
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();

  // 2. Extrair o primeiro bloco JSON delimitado por { ... }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // 3. Tentar converter diretamente
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialErr) {
    // 4. Sanear vírgulas finais antes de fecho de chaves ou colchetes (erro comum em LLMs)
    try {
      const sanitized = cleaned.replace(/,\s*([\]}])/g, '$1');
      return JSON.parse(sanitized) as T;
    } catch (sanitizedErr) {
      console.error('❌ Falha ao converter JSON da IA. Texto bruto:', rawText);
      throw new Error('A resposta gerada pela IA não continha uma estrutura JSON válida.');
    }
  }
}
