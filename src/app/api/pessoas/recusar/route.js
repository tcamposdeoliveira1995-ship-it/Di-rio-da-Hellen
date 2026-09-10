import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Recusar uma pessoa (normalmente um cadastro pendente que nunca devia
// virar acesso, tipo spam de bot) exclui a conta de verdade — não dá
// pra fazer isso só com RLS (não existe policy de "delete" em perfis,
// de propósito, pra ninguém apagar a própria conta e sumir do sistema
// sem querer). Por isso passa pela chave secreta aqui, mas só depois de
// confirmar, com o cliente normal, que quem está pedindo é a admin.
export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Faltou dizer quem recusar." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
    }

    const { data: meuPerfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
    if (meuPerfil?.papel !== "admin") {
      return NextResponse.json({ error: "Só a admin pode recusar alguém." }, { status: 403 });
    }
    if (id === user.id) {
      return NextResponse.json({ error: "Você não pode recusar a própria conta." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao recusar pessoa:", err);
    return NextResponse.json({ error: "Não foi possível recusar." }, { status: 500 });
  }
}
