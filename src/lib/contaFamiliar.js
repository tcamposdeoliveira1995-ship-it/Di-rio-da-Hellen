// O Supabase Auth precisa de um e-mail pra cada conta — mas o cadastro
// da família pede só nome, telefone e senha (mais simples pra quem não
// tem o hábito de decorar e-mail/senha). Resolvemos isso convertendo o
// telefone num e-mail "de mentira" só pra servir de identificador —
// ninguém vê isso, ninguém recebe e-mail nesse endereço.
const DOMINIO_TELEFONE = "familia.diariodahellen.local";

export function telefoneParaEmail(telefone) {
  const digitos = (telefone || "").replace(/\D/g, "");
  return `${digitos}@${DOMINIO_TELEFONE}`;
}

// Login aceita e-mail OU telefone (a Hellen já tem uma conta com
// e-mail de verdade, criada antes desse recurso existir — então não dá
// pra assumir que todo mundo usa telefone).
export function identificadorParaEmail(valor) {
  const texto = (valor || "").trim();
  if (texto.includes("@")) return texto;
  return telefoneParaEmail(texto);
}
