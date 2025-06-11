const OpenAI = require('openai');
const Caso = require('../models/Caso');
const Usuario = require('../models/Usuario');

class IARelatorioService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async gerarRelatorio(casoId) {
    try {
      const caso = await Caso.findById(casoId).populate('evidencias');

      if (!caso) {
        throw new Error('Caso não encontrado');
      }

      const prompt = this.criarPrompt(caso);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um perito forense. Gere um relatório técnico detalhado, com base nas informações abaixo."
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

      return {
        titulo: `Relatório Técnico - Caso ${caso.numeroCaso}`,
        descricao: resultado,
        promptUsado: prompt
      };
    } catch (error) {
      console.error('Erro ao gerar relatório por IA:', error);
      throw error;
    }
  }

  criarPrompt(caso) {
    let evidenciasTexto = caso.evidencias.map(e => `- ${e.nome}: ${e.descricao} (${e.tipo})`).join('\n');

    return `
Gere um relatório forense preliminar com base nos dados:

- Número do Caso: ${caso.numeroCaso}
- Título: ${caso.titulo}
- Descrição: ${caso.descricao}
- Data da Ocorrência: ${caso.dataOcorrido ? caso.dataOcorrido.toLocaleDateString() : 'Não informado'}
- Local: ${caso.local}

Evidências Coletadas:
${evidenciasTexto}

Instruções:
- Apresente análise preliminar com base apenas nestes dados.
- Não invente informações.
- Estruture em Introdução, Descrição dos Fatos, Análise, e Recomendações Finais.
- Seja técnico, objetivo e direto.
`;
  }
}

module.exports = IARelatorioService;
