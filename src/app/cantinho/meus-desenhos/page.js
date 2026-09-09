"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { lerCriancaSelecionada } from "@/lib/cantinho";
import { formatarDataLonga } from "@/lib/date";
import PerfilAtivo from "@/components/cantinho/PerfilAtivo";

export default function MeusDesenhosPage() {
  const router = useRouter();
  const [crianca, setCrianca] = useState(null);
  const [carinhos, setCarinhos] = useState(null);

  useEffect(() => {
    const c = lerCriancaSelecionada();
    if (!c) {
      router.replace("/cantinho");
      return;
    }
    queueMicrotask(() => setCrianca(c));
    fetch(`/api/cantinho/meus-desenhos?crianca_id=${c.id}`)
      .then((r) => r.json())
      .then((d) => setCarinhos(d.carinhos || []));
  }, [router]);

  if (!crianca) return null;

  return (
    <div className="min-h-screen px-6 py-8">
      <PerfilAtivo crianca={crianca} />
      <h1 className="text-2xl font-bold text-center mb-6">Meus desenhos 🖼️</h1>

      {carinhos === null ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : carinhos.length === 0 ? (
        <p className="text-center opacity-70">Você ainda não mandou nenhum carinho pra Hellen.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {carinhos.map((c) => (
            <div key={c.id} className="rounded-3xl overflow-hidden shadow-md" style={{ background: "var(--helo-surface)" }}>
              {c.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária, gerada pelo servidor.
                <img src={c.url} alt="Meu desenho" className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 flex items-center justify-center text-4xl" style={{ background: "var(--helo-bg)" }}>
                  💌
                </div>
              )}
              <div className="p-2 text-center">
                <p className="text-xs opacity-70">{formatarDataLonga(c.created_at?.slice(0, 10))}</p>
                {c.reacao === "amei" ? (
                  <p className="text-sm font-bold mt-1">❤️ Hellen amou!</p>
                ) : (
                  <p className="text-xs opacity-60 mt-1">Ainda não visto</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
