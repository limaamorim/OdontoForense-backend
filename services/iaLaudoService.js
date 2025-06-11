const OpenAI = require('openai');
const Evidencia = require('../models/Evidencia');

class IALaudoService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async gerarLaudo(evidenciaId, peritoId, tipoLaudo) {
    try {
      // Buscar evidência com detalhes
      const evidencia = await Evidencia.findById(evidenciaId)
        .populate('caso')


      if (!evidencia) {
        throw new Error('Evidência não encontrada');
      }

      // Criar prompt específico para tipo de laudo
      const prompt = this.criarPrompt(evidencia, tipoLaudo);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // ou gpt-4, se disponível para você
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(tipoLaudo)
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

  getSystemPrompt(tipoLaudo) {
    const prompts = {
      'odontologico': 'Você é um perito odontológico forense. Gere laudos técnicos detalhados com linguagem especializada.',
      'toxicológico': 'Você é um perito em toxicologia forense. Gere laudos com análises químicas precisas.',
      'documentoscopia': 'Você é um perito em análise documental. Gere laudos de autenticidade de documentos.',
      'default': 'Você é um perito forense. Gere laudos técnicos profissionais.'
    };

    return prompts[tipoLaudo] || prompts.default;
  }

  criarPrompt(evidencia, tipoLaudo) {
    return `
    Gere um laudo pericial do tipo ${tipoLaudo} com base nestes dados:

    ## Dados da Evidência:
    - Tipo: ${evidencia.tipo}
    - Descrição: ${evidencia.descricao}
    - Local de coleta: ${evidencia.localColeta}
    - Data de coleta: ${evidencia.dataColeta}
    - Método de coleta: ${evidencia.metodoColeta || 'Não informado'}
    - Responsável pela coleta: ${evidencia.uploadPor.nome}

    ## Dados do Caso Relacionado:
    - Número: ${evidencia.caso.numero || 'Não informado'}
    - Tipo: ${evidencia.caso.tipo}
    - Data: ${evidencia.caso.dataOcorrencia}

    ## Instruções:
    - Estruture em: Introdução, Metodologia, Análise, Conclusão
    - Use terminologia técnica apropriada
    - Seja conciso e objetivo
    - Inclua todas as observações relevantes
    - Destaque pontos importantes para investigação
    - Limite a 1000 palavras
    - Conclusão deve ser clara e fundamentada
    `;
  }

  processarRespostaIA(resposta) {
    // Separa conteúdo principal da conclusão
    const conclusaoIndex = resposta.lastIndexOf('CONCLUSÃO:');
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
