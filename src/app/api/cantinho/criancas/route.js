import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Lista pública (sem login) das crianças autorizadas — só o essencial
// pra montar a telinha de "quem é você?": nome e avatar. Nada sensível.
export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("criancas")
      .select("id, nome, avatar_emoji, pode_desenhar, pode_enviar_recado")
      .eq("ativo", true)
      .order("nome");
    if (error) throw error;
    return NextResponse.json({ criancas: data });
  } catch (err) {
    console.error("Erro ao listar crianças do Cantinho da Helô:", err);
    return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
  }
}
