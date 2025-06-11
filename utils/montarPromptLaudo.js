function montarPromptLaudo(evidencia, tipoLaudo = 'odontológico') {
  const caso = evidencia.caso || {};
  const dataColeta = evidencia.dataColeta 
    ? new Date(evidencia.dataColeta).toLocaleDateString()
    : 'Não informada';

  return `
Você é um perito forense especializado em ${tipoLaudo}. Com base nos dados abaixo, elabore um laudo técnico completo, com introdução, análise e conclusão. Use linguagem técnica, clara e objetiva. Não invente informações.

📁 DADOS DO CASO:
- Número do Caso: ${caso.numeroCaso || 'Não informado'}
- Título: ${caso.titulo || 'Sem título'}
- Descrição do Caso: ${caso.descricao || 'Sem descrição'}
- Data de Registro: ${caso.dataRegistro 
    ? new Date(caso.dataRegistro).toLocaleDateString()
    : 'Não informada'}

🧾 EVIDÊNCIA:
- Tipo: ${evidencia.tipo || 'Não especificado'}
- Descrição: ${evidencia.descricao || 'Sem descrição'}
- Local de Coleta: ${evidencia.local || 'Desconhecido'}
- Data da Coleta: ${dataColeta}

📌 OBJETIVO:
Gerar um laudo técnico pericial do tipo "${tipoLaudo}", com foco na evidência apresentada. A estrutura do laudo deve conter:

1. Introdução
2. Metodologia (se aplicável)
3. Análise Técnica
4. Conclusão

Finalize com um parágrafo conclusivo que resuma os achados.
`;
}
