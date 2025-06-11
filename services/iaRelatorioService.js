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

  async gerarRelatorio(casoId, responsavelId) {
    try {
      const caso = await Caso.findById(casoId)
        .populate('vitimas')
        .populate('evidencias')
        .populate('envolvidos');

      const responsavel = await Usuario.findById(responsavelId);

      if (!caso) {
        throw new Error('Caso não encontrado');
      }

      const prompt = this.criarPrompt(caso, responsavel);

      const response = await this.openai.chat.completions.create({
        model: 'mistral',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em gerar relatórios forenses detalhados e profissionais.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const conteudoRelatorio = response.choices[0].message.content;

      return {
        titulo: `Relatório do Caso ${caso.numero || caso._id}`,
        descricao: conteudoRelatorio,
        promptUsado: prompt,
      };
    } catch (error) {
      console.error('Erro ao gerar relatório por IA:', error);
      throw error;
    }
  }

  criarPrompt(caso, responsavel) {
    return `
    Gere um relatório forense profissional com base nas seguintes informações:

    ## Dados do Caso:
    - Título: ${caso.titulo}
    - Descrição: ${caso.descricao}
    - Data do incidente: ${caso.dataIncidente}
    - Local: ${caso.local}
    - Status: ${caso.status}
    - Categoria: ${caso.categoria}

    ## Vítimas:
    ${caso.vitimas
      .map(
        (v) => `
      - Nome: ${v.nome}
      - Idade: ${v.idade}
      - Contato: ${v.contato}
      - Declaração: ${v.declaracao}
    `
      )
      .join('\n')}

    ## Evidências:
    ${caso.evidencias
      .map(
        (e) => `
      - Tipo: ${e.tipo}
      - Descrição: ${e.descricao}
      - Local de coleta: ${e.localColeta}
      - Data de coleta: ${e.dataColeta}
    `
      )
      .join('\n')}

    ## Envolvidos:
    ${caso.envolvidos
      .map(
        (e) => `
      - Nome: ${e.nome}
      - Papel: ${e.papel}
      - Declaração: ${e.declaracao}
    `
      )
      .join('\n')}

    ## Responsável pelo relatório:
    - Nome: ${responsavel.nome}
    - Cargo: ${responsavel.cargo}

    ## Instruções:
    - Formate como um documento profissional
    - Inclua um resumo executivo no início
    - Organize por seções lógicas
    - Use linguagem formal e técnica quando apropriado
    - Mantenha-se factual e objetivo
    - Destaque pontos importantes para investigação
    - Sugira próximos passos quando relevante
    - Limite a 1500 palavras
    `;
  }
}

module.exports = new IARelatorioService();
