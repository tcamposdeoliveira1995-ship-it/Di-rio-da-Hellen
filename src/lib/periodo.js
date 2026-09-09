import { hoje } from "./date";

// Calcula o intervalo [inicio, fim] (datas ISO, inclusive) a partir da
// seleção do <SeletorPeriodo/> — usado tanto na Evolução quanto no Resumo
// para Consulta, pra filtrar diário/sintomas/agenda pelo mesmo período.
export function calcularIntervalo(selecao) {
  const fim = hoje();
  if (selecao.tipo === "personalizado") {
    return { inicio: selecao.inicio || fim, fim: selecao.fim || fim };
  }
  const d = new Date();
  d.setDate(d.getDate() - (Number(selecao.dias) - 1));
  return { inicio: d.toISOString().slice(0, 10), fim };
}

export function dentroDoIntervalo(dataIso, intervalo) {
  return dataIso >= intervalo.inicio && dataIso <= intervalo.fim;
}

export function filtrarPorPeriodo(lista, intervalo, campo = "data") {
  return lista.filter((item) => item[campo] && dentroDoIntervalo(item[campo], intervalo));
}
