const Relatorio = require('../models/relatorio');
const IARelatorioService = require('../services/iaRelatorioService');

class RelatorioController {
  async criarRelatorio(req, res) {
    try {
      const { casoId } = req.params;
      const { responsavelId } = req.body; // Ou pegue do token JWT

      // Gerar relatório com IA
      const { titulo, descricao, promptUsado } = await IARelatorioService.gerarRelatorio(casoId, responsavelId);

      // Salvar no banco de dados
      const novoRelatorio = await Relatorio.create({
        caso: casoId,
        titulo,
        descricao,
        responsavel: responsavelId,
        geradoPorIA: true,
        promptUsado,
        status: 'rascunho'
      });

      res.status(201).json(novoRelatorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

// Listar todos os relatórios de um caso específico
exports.listarRelatoriosPorCaso = async (req, res) => {
  try {
    const { casoId } = req.params;

    // Verifica se o caso existe
    const caso = await Caso.findById(casoId);
    if (!caso) {
      return res.status(404).json({ message: 'Caso não encontrado' });
    }

    // Busca todos os relatórios relacionados ao caso
    const relatorios = await Relatorio.find({ caso: casoId })
      .populate('responsavel', 'nome') // Popula o campo "responsavel" com o nome do usuário
      .populate('caso', 'titulo'); // Popula o campo "caso" com o título do caso

    res.status(200).json({ relatorios });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar relatórios', error: error.message });
  }
};

// Atualizar um relatório
exports.atualizarRelatorio = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, observacoes } = req.body;

    // Atualiza o relatório
    const relatorioAtualizado = await Relatorio.findByIdAndUpdate(
      id,
      { titulo, descricao, status, observacoes },
      { new: true, runValidators: true }
    );

    if (!relatorioAtualizado) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }

    res.status(200).json({ message: 'Relatório atualizado com sucesso', relatorio: relatorioAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar relatório', error: error.message });
  }
};

// Deletar um relatório
exports.deletarRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    // Deleta o relatório
    const relatorioDeletado = await Relatorio.findByIdAndDelete(id);

    if (!relatorioDeletado) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }

    res.status(200).json({ message: 'Relatório deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar relatório', error: error.message });
  }
};
