// Cliente Supabase com a chave secreta (service role) — ignora todo o
// RLS. Só existe pra uma coisa: deixar a Helô (que não tem login)
// mandar um carinho pra Hellen através de uma rota de servidor.
//
// NUNCA importe este arquivo de um componente "use client" — ele
// precisa de SUPABASE_SECRET_KEY, uma variável só de servidor (sem
// prefixo NEXT_PUBLIC_), e que também nunca deve ganhar um valor padrão
// aqui no código como as outras — ela é secreta de verdade.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

export function createAdminClient() {
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!chave) {
    throw new Error(
      "SUPABASE_SECRET_KEY não configurada. Sem ela, o Cantinho da Helô não consegue salvar nada."
    );
  }
  return createClient(SUPABASE_URL, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Hoje só existe um usuário de verdade no sistema (a Hellen) — então
// "quem recebe os carinhos" é sempre essa única conta. Quando o acesso
// familiar multiusuário existir (Etapa 4), isso precisa virar uma
// escolha real em vez de "o único usuário que existe".
export async function buscarUserIdDaHellen(admin) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  const usuario = data.users[0];
  if (!usuario) throw new Error("Nenhum usuário encontrado.");
  return usuario.id;
}
