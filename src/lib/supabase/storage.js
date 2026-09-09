"use client";

// Fotos do diário e arquivos de exames ficam no bucket privado
// "hellen-arquivos", em uma pasta por usuário (<user_id>/...) — é assim
// que as policies de Storage do schema.sql concedem acesso só ao dono.
const BUCKET = "hellen-arquivos";

export async function enviarArquivo(supabase, userId, arquivo) {
  const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const caminho = `${userId}/${Date.now()}-${nomeSeguro}`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo);
  if (error) throw error;
  return caminho;
}

export async function urlAssinada(supabase, caminho, expiraEmSegundos = 3600) {
  if (!caminho) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(caminho, expiraEmSegundos);
  if (error) {
    console.error("Não foi possível gerar o link do arquivo:", error);
    return null;
  }
  return data.signedUrl;
}
