"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { lerCriancaSelecionada, CARTOES_RECADO } from "@/lib/cantinho";

export default function RecadoPage() {
  const router = useRouter();
  const [crianca, setCrianca] = useState(null);
  const [cartao, setCartao] = useState(CARTOES_RECADO[0]);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const c = lerCriancaSelecionada();
    if (!c) {
      router.replace("/cantinho");
      return;
    }
    queueMicrotask(() => setCrianca(c));
  }, [router]);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("crianca_id", crianca.id);
      formData.append("tipo", "recado");
      formData.append("mensagem", mensagem);

      const resposta = await fetch("/api/cantinho/enviar", { method: "POST", body: formData });
      if (!resposta.ok) throw new Error();
      setEnviado(true);
    } catch {
      setErro("Não consegui enviar. Tenta de novo?");
    } finally {
      setEnviando(false);
    }
  }

  if (!crianca) return null;

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-6xl">💗🌸⭐✨🌈</p>
        <h1 className="text-2xl font-bold">Carinho enviado!</h1>
        <p className="opacity-80">Seu recadinho foi enviado para a Hellen!</p>
        <button
          onClick={() => {
            setMensagem("");
            setEnviado(false);
          }}
          className="mt-6 rounded-full px-6 py-3 font-bold shadow-md"
          style={{ background: "var(--helo-lilas)" }}
        >
          💌 Escrever outro
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 gap-4">
      <h1 className="text-2xl font-bold">Escrever um recadinho 💌</h1>

      <div>
        <p className="text-sm text-center mb-2 opacity-80">Personalizar cartão</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {CARTOES_RECADO.map((c) => (
            <button
              key={c.id}
              onClick={() => setCartao(c)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium"
              style={{ background: cartao.id === c.id ? "var(--helo-amarelo)" : "var(--helo-surface)" }}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={enviar} className="w-full max-w-sm">
        <div
          className="rounded-3xl p-6 shadow-md text-center"
          style={{ background: "var(--helo-surface)", border: "3px dashed var(--helo-lilas)" }}
        >
          <p className="text-3xl mb-2">{cartao.emoji.repeat(3)}</p>
          <p className="font-bold mb-3">Para: Hellen 💗</p>
          <textarea
            required
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={6}
            placeholder="Escreve aqui o seu recadinho..."
            className="w-full rounded-2xl p-3 border-2 text-center"
            style={{ borderColor: "var(--helo-lilas)" }}
          />
          <p className="font-bold mt-3">De: {crianca.nome} {crianca.avatar_emoji}</p>
        </div>

        {erro && <p className="text-sm font-medium text-center mt-3" style={{ color: "#c0392b" }}>{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 mt-5 rounded-full px-6 py-3 font-bold shadow-md disabled:opacity-60"
          style={{ background: "var(--helo-rosa)" }}
        >
          {enviando && <Loader2 size={18} className="animate-spin" />}
          💗 Enviar meu recadinho
        </button>
      </form>
    </div>
  );
}
