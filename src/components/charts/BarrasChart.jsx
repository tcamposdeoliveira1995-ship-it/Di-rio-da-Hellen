"use client";

// Barras verticais pra magnitude (contagem) por categoria — uma cor só,
// já que a identidade de cada barra vem do rótulo no eixo, não da cor.
import { useState } from "react";

const ALTURA = 160;

export default function BarrasChart({ barras, cor }) {
  const [indiceHover, setIndiceHover] = useState(null);

  if (barras.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">Sem sintomas registrados neste período.</p>;
  }

  const max = Math.max(...barras.map((b) => b.valor), 1);

  return (
    <div className="flex items-end gap-3" style={{ height: ALTURA }}>
      {barras.map((b, i) => {
        const alturaBarra = Math.max((b.valor / max) * (ALTURA - 32), b.valor > 0 ? 4 : 0);
        return (
          <div
            key={b.rotulo}
            className="flex-1 flex flex-col items-center justify-end h-full relative"
            onMouseEnter={() => setIndiceHover(i)}
            onMouseLeave={() => setIndiceHover(null)}
          >
            {indiceHover === i && (
              <div className="absolute -top-2 -translate-y-full bg-ink text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                {b.valor} {b.valor === 1 ? "vez" : "vezes"}
              </div>
            )}
            <span className="text-xs text-muted mb-1">{b.valor > 0 ? b.valor : ""}</span>
            <div
              className="w-full rounded-t-md transition-opacity"
              style={{
                height: alturaBarra,
                background: cor,
                opacity: indiceHover === null || indiceHover === i ? 1 : 0.6,
              }}
            />
            <span className="text-lg mt-1.5" aria-hidden>{b.emoji}</span>
            <span className="text-[10px] text-muted text-center leading-tight mt-0.5">{b.rotulo}</span>
          </div>
        );
      })}
    </div>
  );
}
