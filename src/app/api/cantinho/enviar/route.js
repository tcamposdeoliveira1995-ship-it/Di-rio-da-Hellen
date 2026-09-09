import { NextResponse } from "next/server";
import { createAdminClient, buscarUserIdDaHellen } from "@/lib/supabase/admin";

const BUCKET = "hellen-arquivos";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const criancaId = formData.get("crianca_id");
    const tipo = formData.get("tipo"); // desenho | recado
    const mensagem = formData.get("mensagem") || null;
    const imagem = formData.get("imagem"); // File, opcional (obrigatório se tipo = desenho)

    if (!criancaId || (tipo !== "desenho" && tipo !== "recado")) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: crianca, error: erroCrianca } = await admin
      .from("criancas")
      .select("id, ativo, pode_desenhar, pode_enviar_recado")
      .eq("id", criancaId)
      .maybeSingle();
    if (erroCrianca) throw erroCrianca;
    if (!crianca || !crianca.ativo) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }
    if (tipo === "desenho" && !crianca.pode_desenhar) {
      return NextResponse.json({ error: "Sem permissão para desenhar." }, { status: 403 });
    }
    if (tipo === "recado" && !crianca.pode_enviar_recado) {
      return NextResponse.json({ error: "Sem permissão para mandar recado." }, { status: 403 });
    }
    if (tipo === "desenho" && !imagem) {
      return NextResponse.json({ error: "Faltou o desenho." }, { status: 400 });
    }

    const hellenUserId = await buscarUserIdDaHellen(admin);

    let arquivo_path = null;
    if (imagem && typeof imagem !== "string") {
      const caminho = `${hellenUserId}/carinhos/${Date.now()}-${crypto.randomUUID()}.png`;
      const { error: erroUpload } = await admin.storage
        .from(BUCKET)
        .upload(caminho, imagem, { contentType: imagem.type || "image/png" });
      if (erroUpload) throw erroUpload;
      arquivo_path = caminho;
    }

    const { error: erroInsert } = await admin.from("carinhos").insert({
      destinatario_user_id: hellenUserId,
      crianca_id: criancaId,
      tipo,
      mensagem,
      arquivo_path,
    });
    if (erroInsert) throw erroInsert;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar carinho:", err);
    return NextResponse.json({ error: "Não foi possível enviar. Tenta de novo?" }, { status: 500 });
  }
}
