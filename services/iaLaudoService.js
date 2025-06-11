const OpenAI = require('openai');
const Evidencia = require('../models/Evidencia');

class IALaudoService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  async gerarLaudo(evidenciaId, tipoLaudo = 'odontológico') {
    try {
      // Buscar evidência com caso populado
      const evidencia = await Evidencia.findById(evidenciaId).populate('caso');

      if (!evidencia) {
        throw new Error('Evidência não encontrada');
      }

      // Montar prompt com base no model real
      const prompt = this.criarPrompt(evidencia, tipoLaudo);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [
          {
            role: "system",
            content: `Você é um perito forense especializado em ${tipoLaudo}. Gere laudos técnicos completos, objetivos, com introdução, metodologia, análise e conclusão.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const resultado = response.choices[0].message.content;
      const [conteudo, conclusao] = this.processarRespostaIA(resultado);

      return {
        conteudo,
        conclusao,
        promptUsado: prompt,
        tipoLaudo
      };
    } catch (error) {
      console.error('Erro ao gerar laudo por IA:', error);
      throw error;
    }
  }

  criarPrompt(evidencia, tipoLaudo) {
    return `
Gere um laudo técnico do tipo ${tipoLaudo} com base nas informações a seguir:

## Dados da Evidência:
- Nome: ${evidencia.nome}
- Tipo: ${evidencia.tipo}
- Descrição: ${evidencia.descricao}
- Arquivo: ${evidencia.imagem}

## Dados do Caso:
- Número do Caso: ${evidencia.caso.numeroCaso}
- Título: ${evidencia.caso.titulo}
- Descrição: ${evidencia.caso.descricao}
- Data de Ocorrência: ${evidencia.caso.dataOcorrido ? evidencia.caso.dataOcorrido.toLocaleDateString() : 'Não informado'}
- Local: ${evidencia.caso.local}

## Instruções:
- Estruture em: Introdução, Metodologia, Análise, Conclusão.
- Use terminologia técnica.
- Não invente dados não fornecidos.
- Seja objetivo e claro.
`;
  }

  processarRespostaIA(resposta) {
    const conclusaoIndex = resposta.lastIndexOf('Conclusão:');
    if (conclusaoIndex !== -1) {
      return [
        resposta.substring(0, conclusaoIndex).trim(),
        resposta.substring(conclusaoIndex + 10).trim()
      ];
    }
    return [resposta, 'Conclusão não identificada na resposta da IA'];
  }
}

module.exports = IALaudoService;
