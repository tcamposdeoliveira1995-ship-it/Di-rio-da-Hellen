"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { lerCriancaSelecionada, salvarCriancaSelecionada, limparCriancaSelecionada } from "@/lib/cantinho";

export default function CantinhoPage() {
  const [crianca, setCrianca] = useState(undefined); // undefined = ainda não checou
  const [criancas, setCriancas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // queueMicrotask só pra não chamar setState direto e sincronamente
    // no corpo do efeito (lint) — lerCriancaSelecionada() só pode rodar
    // no navegador mesmo, então isso continua acontecendo assim que a
    // página monta.
    queueMicrotask(() => setCrianca(lerCriancaSelecionada()));
    fetch("/api/cantinho/criancas")
      .then((r) => r.json())
      .then((d) => setCriancas(d.criancas || []))
      .finally(() => setCarregando(false));
  }, []);

  function escolher(c) {
    salvarCriancaSelecionada(c);
    setCrianca(c);
  }

  if (crianca === undefined || carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: "var(--helo-rosa)" }} size={32} />
      </div>
    );
  }

  if (!crianca) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div>
          <p className="text-4xl mb-2">🎨🌈💗</p>
          <h1 className="text-2xl font-bold">Quem é você?</h1>
        </div>

        {criancas.length === 0 ? (
          <p className="max-w-xs text-sm opacity-80">
            Ainda não tem ninguém autorizado aqui. Peça pra Hellen te adicionar em
            &ldquo;Carinhos&rdquo;, no painel dela. 💗
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {criancas.map((c) => (
              <button
                key={c.id}
                onClick={() => escolher(c)}
                className="flex flex-col items-center gap-2 rounded-3xl p-6 shadow-md active:scale-95 transition-transform"
                style={{ background: "var(--helo-surface)" }}
              >
                <span className="text-5xl">{c.avatar_emoji}</span>
                <span className="font-bold">{c.nome}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 text-center">
      <p className="text-4xl mb-3">{crianca.avatar_emoji}</p>
      <h1 className="text-2xl font-bold mb-1">Oi, {crianca.nome}! 💗</h1>
      <p className="opacity-80 mb-10">Vamos fazer um carinho para a Hellen hoje?</p>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <CartaoMenu href="/cantinho/desenhar" emoji="🎨" titulo="Fazer um desenho" cor="var(--helo-rosa)" />
        <CartaoMenu href="/cantinho/recado" emoji="💌" titulo="Escrever um recadinho" cor="var(--helo-lilas)" />
        <CartaoMenu href="/cantinho/meus-desenhos" emoji="🖼️" titulo="Meus desenhos" cor="var(--helo-azul)" />
      </div>

      <button
        onClick={() => {
          limparCriancaSelecionada();
          setCrianca(null);
        }}
        className="mt-10 text-sm underline opacity-70"
      >
        Não sou eu
      </button>
    </div>
  );
}

function CartaoMenu({ href, emoji, titulo, cor }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-3xl p-5 shadow-md active:scale-95 transition-transform text-left"
      style={{ background: cor }}
    >
      <span className="text-4xl">{emoji}</span>
      <span className="text-lg font-bold">{titulo}</span>
    </Link>
  );
}
