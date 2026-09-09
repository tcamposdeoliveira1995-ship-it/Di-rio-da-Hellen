import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "hellen-arquivos";

export async function GET(request) {
  try {
    const criancaId = request.nextUrl.searchParams.get("crianca_id");
    if (!criancaId) {
      return NextResponse.json({ error: "Faltou dizer quem é." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("carinhos")
      .select("id, tipo, mensagem, arquivo_path, favorito, reacao, created_at")
      .eq("crianca_id", criancaId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const comUrl = await Promise.all(
      (data || []).map(async (item) => {
        if (!item.arquivo_path) return { ...item, url: null };
        const { data: assinada } = await admin.storage
          .from(BUCKET)
          .createSignedUrl(item.arquivo_path, 3600);
        return { ...item, url: assinada?.signedUrl || null };
      })
    );

    return NextResponse.json({ carinhos: comUrl });
  } catch (err) {
    console.error("Erro ao buscar os desenhos enviados:", err);
    return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
  }
}
