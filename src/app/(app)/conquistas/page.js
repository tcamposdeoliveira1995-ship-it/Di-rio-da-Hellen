"use client";

import { useMemo } from "react";
import Card from "@/components/Card";
import { useStore } from "@/lib/store";
import { calcularConquistas } from "@/lib/conquistas";
import { formatarDataLonga } from "@/lib/date";

export default function ConquistasPage() {
  const { diario, ciclos, exames, tratamentoInfo } = useStore();

  const conquistas = useMemo(
    () => calcularConquistas({ diario, ciclos, exames, tratamentoInfo }),
    [diario, ciclos, exames, tratamentoInfo]
  );

  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">Conquistas 🏆</h1>
        <p className="text-sm text-muted">
          {desbloqueadas} de {conquistas.length} conquistadas até agora.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {conquistas.map((c) => (
          <Card
            key={c.id}
            className={`text-center transition-opacity ${c.desbloqueada ? "" : "opacity-40"}`}
          >
            <span className="text-4xl" aria-hidden>{c.desbloqueada ? c.emoji : "🔒"}</span>
            <p className="font-medium text-ink mt-2">{c.titulo}</p>
            <p className="text-xs text-muted mt-1">{c.descricao}</p>
            {c.desbloqueada && c.data && (
              <p className="text-[11px] text-burnt mt-2">{formatarDataLonga(c.data)}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
