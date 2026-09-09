// Conquistas — gamificação delicada da jornada (seção 14 do escopo).
// Nenhuma tabela nova: cada conquista é derivada dos dados que já
// existem (diário, ciclos, exames), então ela "aparece" sozinha na hora
// certa, sem precisar de um botão de "desbloquear".

export function calcularConquistas({ diario, ciclos, exames, tratamentoInfo }) {
  const concluidos = ciclos.filter((c) => c.status === "concluido");
  const totalCiclos = tratamentoInfo?.quantidade_ciclos || ciclos.length;
  const etapaConcluida = ciclos.length > 0 && concluidos.length > 0 && concluidos.length === totalCiclos;

  function dataDoNesimo(lista, campoData, n) {
    // Data em que a lista atingiu N itens (ordenando pela própria data),
    // pra mostrar quando a conquista foi "batida" — aproximado, já que
    // os registros podem ter sido feitos fora de ordem.
    const ordenada = [...lista].map((x) => x[campoData]).filter(Boolean).sort();
    return ordenada[n - 1] || null;
  }

  return [
    {
      id: "primeiro_ciclo",
      emoji: "🏆",
      titulo: "Primeiro ciclo concluído",
      descricao: "Você completou o primeiro ciclo do tratamento.",
      desbloqueada: concluidos.length >= 1,
      data: concluidos[0]?.data || null,
    },
    {
      id: "primeira_semana",
      emoji: "🌻",
      titulo: "Primeira semana registrada",
      descricao: "7 dias registrados no diário.",
      desbloqueada: diario.length >= 7,
      data: dataDoNesimo(diario, "data", 7),
    },
    {
      id: "exame_realizado",
      emoji: "🧪",
      titulo: "Exame realizado",
      descricao: "Primeiro exame adicionado à biblioteca.",
      desbloqueada: exames.length >= 1,
      data: dataDoNesimo(exames, "data", 1),
    },
    {
      id: "dez_dias_diario",
      emoji: "💗",
      titulo: "10 dias de diário",
      descricao: "10 registros no seu diário pessoal.",
      desbloqueada: diario.length >= 10,
      data: dataDoNesimo(diario, "data", 10),
    },
    {
      id: "mais_um_ciclo",
      emoji: "💪",
      titulo: "Mais um ciclo vencido",
      descricao: "Já são 2 ciclos concluídos.",
      desbloqueada: concluidos.length >= 2,
      data: concluidos[1]?.data || null,
    },
    {
      id: "trinta_registros",
      emoji: "📖",
      titulo: "30 registros no diário",
      descricao: "30 dias registrados no seu diário.",
      desbloqueada: diario.length >= 30,
      data: dataDoNesimo(diario, "data", 30),
    },
    {
      id: "etapa_concluida",
      emoji: "🌟",
      titulo: "Etapa concluída",
      descricao: "Todos os ciclos do tratamento concluídos.",
      desbloqueada: etapaConcluida,
      data: etapaConcluida ? concluidos.at(-1)?.data : null,
    },
  ];
}
