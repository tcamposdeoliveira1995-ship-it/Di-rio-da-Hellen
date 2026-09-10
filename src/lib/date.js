// Helpers de data — tudo em horário local do navegador e formatado em
// pt-BR, já que é um diário pessoal de uma única pessoa.

// Converte um Date pro formato YYYY-MM-DD usando o horário LOCAL do
// aparelho (getFullYear/getMonth/getDate), nunca toISOString() — esse
// método converte pra UTC antes de gerar a data, e horário de Brasília é
// UTC-3: das 21h à meia-noite, o "hoje" em UTC já virou amanhã. Foi
// exatamente esse bug que fazia a data mudar cedo demais à noite.
export function paraIso(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function hoje() {
  return paraIso(new Date());
}

export function formatarData(iso, opcoes) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(ano, (mes || 1) - 1, dia || 1);
  return data.toLocaleDateString("pt-BR", opcoes);
}

export function formatarDataLonga(iso) {
  return formatarData(iso, { day: "2-digit", month: "long", year: "numeric" });
}

export function formatarDataHora(iso, horario) {
  const data = formatarData(iso);
  return horario ? `${data} às ${horario}` : data;
}

// Dia N da jornada, contando a partir da data de início (inclusive).
export function diaDaJornada(dataInicioIso) {
  if (!dataInicioIso) return 1;
  const inicio = new Date(dataInicioIso + "T00:00:00");
  const agora = new Date();
  const hojeSemHora = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diffDias = Math.floor((hojeSemHora - inicio) / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDias + 1);
}

export function ehHojeOuFuturo(iso) {
  return iso >= hoje();
}

export function ordenarPorDataDesc(lista, campo = "data") {
  return [...lista].sort((a, b) => (b[campo] || "").localeCompare(a[campo] || ""));
}

export function ordenarPorDataAsc(lista, campo = "data") {
  return [...lista].sort((a, b) => (a[campo] || "").localeCompare(b[campo] || ""));
}

export function diasNoMes(ano, mes) {
  return new Date(ano, mes + 1, 0).getDate();
}

export const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const NOMES_DIA_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
