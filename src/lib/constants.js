// Listas fixas usadas em vários lugares do diário — mantidas juntas para
// não repetir emoji/rótulo em cada componente.

export const HUMORES = [
  { id: "bem", emoji: "😊", label: "Bem" },
  { id: "indo", emoji: "🙂", label: "Estou indo" },
  { id: "maisOuMenos", emoji: "😐", label: "Mais ou menos" },
  { id: "dificil", emoji: "😔", label: "Dia difícil" },
  { id: "muitoDificil", emoji: "😣", label: "Muito difícil" },
];

export function humorPorId(id) {
  return HUMORES.find((h) => h.id === id) || null;
}

// Escala numérica pra plotar o humor num gráfico (1 = muito difícil,
// 5 = bem) — a ordem em HUMORES já vai do melhor pro pior, então é só
// inverter a posição.
export function humorParaNumero(id) {
  const indice = HUMORES.findIndex((h) => h.id === id);
  return indice === -1 ? null : HUMORES.length - indice;
}

export const SINTOMAS_DISPONIVEIS = [
  { id: "cansaco", emoji: "😴", label: "Cansaço" },
  { id: "nausea", emoji: "🤢", label: "Náusea" },
  { id: "dor", emoji: "🤕", label: "Dor" },
  { id: "dorDeCabeca", emoji: "🤯", label: "Dor de cabeça" },
  { id: "faltaApetite", emoji: "🍽", label: "Falta de apetite" },
  { id: "tontura", emoji: "😵", label: "Tontura" },
  { id: "febre", emoji: "🌡", label: "Febre" },
  { id: "alteracaoSono", emoji: "😴", label: "Alteração no sono" },
  { id: "alteracaoIntestinal", emoji: "💧", label: "Alterações intestinais" },
  { id: "outros", emoji: "❤️", label: "Outros" },
];

export const NIVEIS_INTENSIDADE = [
  { valor: 0, label: "Nenhum" },
  { valor: 1, label: "Leve" },
  { valor: 2, label: "Leve/moderado" },
  { valor: 3, label: "Moderado" },
  { valor: 4, label: "Forte" },
  { valor: 5, label: "Muito forte" },
];

export function nivelIntensidadePorValor(valor) {
  return NIVEIS_INTENSIDADE.find((n) => n.valor === valor) || NIVEIS_INTENSIDADE[0];
}

export const CATEGORIAS_EXAME = [
  { id: "laboratoriais", emoji: "🩸", label: "Exames laboratoriais" },
  { id: "tomografia", emoji: "🖥", label: "Tomografia" },
  { id: "ressonancia", emoji: "🧲", label: "Ressonância" },
  { id: "cardiacos", emoji: "🫀", label: "Exames cardíacos" },
  { id: "biopsia", emoji: "🧬", label: "Biópsia" },
  { id: "laudos", emoji: "📄", label: "Laudos" },
  { id: "outros", emoji: "🧪", label: "Outros" },
];

export const TIPOS_AGENDA = [
  { id: "consulta", emoji: "🩺", label: "Consulta" },
  { id: "exame", emoji: "🧪", label: "Exame" },
  { id: "tratamento", emoji: "💊", label: "Tratamento" },
  { id: "internacao", emoji: "🏥", label: "Internação" },
  { id: "retorno", emoji: "📋", label: "Retorno" },
  { id: "medicacao", emoji: "💉", label: "Medicação" },
  { id: "pessoal", emoji: "🌻", label: "Compromisso pessoal" },
];

export function tipoAgendaPorId(id) {
  return TIPOS_AGENDA.find((t) => t.id === id) || TIPOS_AGENDA[6];
}

export const CATEGORIAS_JORNADA = [
  { id: "consulta", emoji: "🩺", label: "Consulta" },
  { id: "exame", emoji: "🧪", label: "Exame" },
  { id: "tratamento", emoji: "💊", label: "Tratamento" },
  { id: "internacao", emoji: "🏥", label: "Internação" },
  { id: "diagnostico", emoji: "📋", label: "Diagnóstico" },
  { id: "pessoal", emoji: "🌻", label: "Momento pessoal" },
  { id: "conquista", emoji: "🏆", label: "Conquista" },
];

export function categoriaJornadaPorId(id) {
  return CATEGORIAS_JORNADA.find((c) => c.id === id) || CATEGORIAS_JORNADA[5];
}

export const STATUS_CICLO = [
  { id: "concluido", emoji: "✅", label: "Concluído" },
  { id: "em_andamento", emoji: "🟡", label: "Em andamento" },
  { id: "aguardando", emoji: "⚪", label: "Aguardando" },
];

export function statusCicloPorId(id) {
  return STATUS_CICLO.find((s) => s.id === id) || STATUS_CICLO[2];
}

export const STATUS_DUVIDA = [
  { id: "quero_perguntar", emoji: "🟡", label: "Quero perguntar" },
  { id: "respondida", emoji: "🟢", label: "Respondida" },
];

export function statusDuvidaPorId(id) {
  return STATUS_DUVIDA.find((s) => s.id === id) || STATUS_DUVIDA[0];
}

export const CATEGORIAS_DOCUMENTO = [
  { id: "laudos", emoji: "📄", label: "Laudos" },
  { id: "exames", emoji: "🧪", label: "Exames" },
  { id: "relatorios", emoji: "📋", label: "Relatórios" },
  { id: "hospitalares", emoji: "🏥", label: "Documentos hospitalares" },
  { id: "receitas", emoji: "💊", label: "Receitas" },
  { id: "autorizacoes", emoji: "📑", label: "Autorizações" },
  { id: "outros", emoji: "📎", label: "Outros" },
];

export function categoriaDocumentoPorId(id) {
  return CATEGORIAS_DOCUMENTO.find((c) => c.id === id) || CATEGORIAS_DOCUMENTO[6];
}

export const PERIODOS_RESUMO = [
  { id: "7", label: "Últimos 7 dias", dias: 7 },
  { id: "15", label: "Últimos 15 dias", dias: 15 },
  { id: "30", label: "Últimos 30 dias", dias: 30 },
];

export const FRASES_DO_DIA = [
  "Um dia de cada vez.",
  "Hoje também faz parte da sua história.",
  "Você chegou até aqui.",
  "Mais um capítulo registrado.",
  "Pequenos passos também são caminho.",
  "Hoje não precisa ser perfeito. Só precisa ser vivido.",
];
