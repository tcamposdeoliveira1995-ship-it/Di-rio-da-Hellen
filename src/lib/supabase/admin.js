// Cliente Supabase com a chave secreta (service role) — ignora todo o
// RLS. Usado só em rotas de servidor que realmente precisam: deixar a
// Helô (que não tem login) mandar carinho pra Hellen, e excluir a conta
// de alguém que a admin recusou (RLS não tem policy de delete em
// "perfis" de propósito, então isso não dá pra fazer só pelo cliente).
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

// Quem recebe os carinhos é sempre a admin (a Hellen) — mesmo agora que
// existem vários usuários de verdade (ela + família aprovada como
// visualizadores), só tem uma "admin" no sistema. Busca direto na
// tabela de perfis (com a chave secreta, ignora RLS) em vez de supor
// "o primeiro usuário criado", que quebraria assim que mais gente se
// cadastrasse.
export async function buscarUserIdDaHellen(admin) {
  const { data, error } = await admin
    .from("perfis")
    .select("id")
    .eq("papel", "admin")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Nenhuma admin encontrada.");
  return data.id;
}
