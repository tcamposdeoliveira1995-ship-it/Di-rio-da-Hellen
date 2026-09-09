"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { urlAssinada } from "@/lib/supabase/storage";

// O bucket é privado, então toda foto/arquivo precisa de uma URL assinada
// (temporária) gerada sob demanda — não dá pra simplesmente usar o caminho
// salvo no banco como <img src>.
export default function FotoPrivada({ caminho, alt = "", className = "" }) {
  const [url, setUrl] = useState(null);

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

  if (!caminho || !url) {
    return <div className={`bg-blush-soft animate-pulse rounded-2xl ${className}`} />;
  }

  // eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária, não vale a pena passar pelo otimizador de imagem do Next.
  return <img src={url} alt={alt} className={`object-cover rounded-2xl ${className}`} />;
}
