// Constantes e pequenos helpers do Cantinho da Helô — o módulo infantil,
// separado do resto do painel (ver README).

export const CORES_PAINT = [
  "#E53935", // vermelho
  "#F57C00", // laranja
  "#FBC02D", // amarelo
  "#43A047", // verde
  "#1E88E5", // azul
  "#8E24AA", // roxo
  "#EC407A", // rosa
  "#6D4C41", // marrom
  "#212121", // preto
  "#FFFFFF", // branco
];

export const TAMANHOS = [
  { id: "p", label: "Pequeno", traco: 4, carimbo: 32, texto: 18 },
  { id: "m", label: "Médio", traco: 10, carimbo: 56, texto: 28 },
  { id: "g", label: "Grande", traco: 20, carimbo: 88, texto: 42 },
];

export const CARIMBOS = ["❤️", "⭐", "🌸", "🌈", "☀️", "🦋", "😊", "✨", "🎈", "💗"];

export const CARTOES_RECADO = [
  { id: "flores", emoji: "🌸", label: "Flores" },
  { id: "arcoiris", emoji: "🌈", label: "Arco-íris" },
  { id: "coracoes", emoji: "❤️", label: "Corações" },
  { id: "estrelas", emoji: "⭐", label: "Estrelas" },
  { id: "borboletas", emoji: "🦋", label: "Borboletas" },
  { id: "brilhinhos", emoji: "✨", label: "Brilhinhos" },
];

const CHAVE_CRIANCA = "cantinho-da-helo:crianca";

export function salvarCriancaSelecionada(crianca) {
  try {
    window.localStorage.setItem(CHAVE_CRIANCA, JSON.stringify(crianca));
  } catch {
    // sem localStorage, sem problema — só pede pra escolher de novo
  }
}

export function lerCriancaSelecionada() {
  try {
    const salvo = window.localStorage.getItem(CHAVE_CRIANCA);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function limparCriancaSelecionada() {
  try {
    window.localStorage.removeItem(CHAVE_CRIANCA);
  } catch {
    // nada a fazer
  }
}
