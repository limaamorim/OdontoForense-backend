const Relatorio = require('../models/Relatorio');
const Caso = require('../models/Caso'); // você esqueceu de importar o Caso
const IARelatorioService = require('../services/iaRelatorioService');

class RelatorioController {
  async criarRelatorio(req, res) {
    try {
      const { casoId } = req.params;
      const { responsavelId } = req.body; // Ou pegue do token JWT

      const { titulo, descricao, promptUsado } = await IARelatorioService.gerarRelatorio(casoId, responsavelId);

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

  async listarRelatoriosPorCaso(req, res) {
    try {
      const { casoId } = req.params;

      const caso = await Caso.findById(casoId);
      if (!caso) {
        return res.status(404).json({ message: 'Caso não encontrado' });
      }

      const relatorios = await Relatorio.find({ caso: casoId })
        .populate('responsavel', 'nome')
        .populate('caso', 'titulo');

      res.status(200).json({ relatorios });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar relatórios', error: error.message });
    }
  }

  async atualizarRelatorio(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descricao, status, observacoes } = req.body;

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
  }

  async deletarRelatorio(req, res) {
    try {
      const { id } = req.params;

      const relatorioDeletado = await Relatorio.findByIdAndDelete(id);

      if (!relatorioDeletado) {
        return res.status(404).json({ message: 'Relatório não encontrado' });
      }

      res.status(200).json({ message: 'Relatório deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar relatório', error: error.message });
    }
  }
}

module.exports = new RelatorioController();
