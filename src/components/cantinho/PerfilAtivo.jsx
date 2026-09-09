"use client";

import { useRouter } from "next/navigation";
import { limparCriancaSelecionada } from "@/lib/cantinho";

// Selinho com quem está usando o Cantinho nesse aparelho — aparece em
// toda tela (não só na principal), porque o localStorage lembra a
// última criança escolhida e, num tablet compartilhado entre irmãos,
// precisa ser fácil trocar de qualquer lugar, não só voltando pro menu.
export default function PerfilAtivo({ crianca, posicao = "top-2" }) {
  const router = useRouter();

  function trocar() {
    limparCriancaSelecionada();
    router.push("/cantinho");
  }

  if (!crianca) return null;

  return (
    <button
      onClick={trocar}
      className={`fixed ${posicao} right-2 z-40 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs shadow-md`}
      style={{ background: "var(--helo-surface)", color: "var(--helo-ink)" }}
    >
      <span aria-hidden>{crianca.avatar_emoji}</span>
      {crianca.nome}
      <span className="opacity-50">· trocar</span>
    </button>
  );
}
