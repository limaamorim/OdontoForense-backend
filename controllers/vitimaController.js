const Vitima = require('../models/Vitima');
const Caso = require('../models/Caso');

exports.criarVitima = async (req, res) => {
  try {
    const { casoId } = req.params;
    const caso = await Caso.findById(casoId);
    if (!caso) return res.status(404).json({ msg: 'Caso não encontrado' });

    const novaVitima = new Vitima({ ...req.body, caso: [casoId] });
    const vitimaSalva = await novaVitima.save();

    caso.vitimas.push(vitimaSalva._id);
    await caso.save();

    res.status(201).json(vitimaSalva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao criar vítima' });
  }
};

exports.listarVitimasPorCaso = async (req, res) => {
  try {
    const { casoId } = req.params;
    const vitimas = await Vitima.find({ caso: casoId });
    res.json(vitimas);
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao buscar vítimas' });
  }
};

exports.obterVitima = async (req, res) => {
  try {
    const vitima = await Vitima.findById(req.params.id);
    if (!vitima) return res.status(404).json({ msg: 'Vítima não encontrada' });
    res.json(vitima);
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao obter vítima' });
  }
};

exports.atualizarVitima = async (req, res) => {
  try {
    const vitima = await Vitima.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vitima) return res.status(404).json({ msg: 'Vítima não encontrada' });

    res.json(vitima);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao atualizar vítima' });
  }
};

exports.deletarVitima = async (req, res) => {
  try {
    const vitima = await Vitima.findByIdAndDelete(req.params.id);
    if (!vitima) return res.status(404).json({ msg: 'Vítima não encontrada' });

    await Caso.updateMany(
      { vitimas: vitima._id },
      { $pull: { vitimas: vitima._id } }
    );

    res.json({ msg: 'Vítima deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao deletar vítima' });
  }
};
