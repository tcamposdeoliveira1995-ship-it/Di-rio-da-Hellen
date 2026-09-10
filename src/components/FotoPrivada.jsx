"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { urlAssinada } from "@/lib/supabase/storage";

// O bucket é privado, então toda foto/arquivo precisa de uma URL assinada
// (temporária) gerada sob demanda — não dá pra simplesmente usar o caminho
// salvo no banco como <img src>.
//
// A miniatura continua exatamente do tamanho/corte que cada tela já
// pedia (className) — só ganhou um clique que abre a foto inteira, sem
// cortar, por cima de tudo.
export default function FotoPrivada({ caminho, alt = "", className = "" }) {
  const [url, setUrl] = useState(null);
  const [ampliada, setAmpliada] = useState(false);

  useEffect(() => {
    if (!caminho) return;
    let cancelado = false;
    const supabase = createClient();
    urlAssinada(supabase, caminho).then((link) => {
      if (!cancelado) setUrl(link);
    });
    return () => {
      cancelado = true;
    };
  }, [caminho]);

  useEffect(() => {
    if (!ampliada) return;
    function aoTeclar(e) {
      if (e.key === "Escape") setAmpliada(false);
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ampliada]);

  if (!caminho || !url) {
    return <div className={`bg-blush-soft animate-pulse rounded-2xl ${className}`} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        aria-label="Ver foto inteira"
        className="block p-0 border-0 bg-transparent rounded-2xl cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-burnt"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária, não vale a pena passar pelo otimizador de imagem do Next. */}
        <img src={url} alt={alt} className={`object-cover rounded-2xl ${className}`} />
      </button>

      {ampliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Foto ampliada"}
          onClick={() => setAmpliada(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface text-ink shadow-lg"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária, não vale a pena passar pelo otimizador de imagem do Next. */}
          <img
            src={url}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        </div>
      )}
    </>
  );
}
