"use client";

import { useState } from "react";
import { PERIODOS_RESUMO } from "@/lib/constants";
import { hoje } from "@/lib/date";

// Compartilhado pela Evolução e pelo Resumo para Consulta. Chama
// onMudar({ tipo: 'preset', dias } | { tipo: 'personalizado', inicio, fim })
// sempre que a seleção muda.
export default function SeletorPeriodo({ onMudar }) {
  const [selecionado, setSelecionado] = useState(PERIODOS_RESUMO[0].id);
  const [inicio, setInicio] = useState(hoje());
  const [fim, setFim] = useState(hoje());

  function escolher(id) {
    setSelecionado(id);
    if (id === "personalizado") {
      onMudar({ tipo: "personalizado", inicio, fim });
    } else {
      onMudar({ tipo: "preset", dias: PERIODOS_RESUMO.find((p) => p.id === id).dias });
    }
  }

  function aoMudarPersonalizado(novoInicio, novoFim) {
    setInicio(novoInicio);
    setFim(novoFim);
    onMudar({ tipo: "personalizado", inicio: novoInicio, fim: novoFim });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODOS_RESUMO.map((p) => (
        <button
          key={p.id}
          onClick={() => escolher(p.id)}
          className={`rounded-full px-3 py-1.5 text-xs border whitespace-nowrap ${
            selecionado === p.id ? "bg-burnt text-white border-burnt" : "bg-surface border-line text-ink"
          }`}
        >
          {p.label}
        </button>
      ))}
      <button
        onClick={() => escolher("personalizado")}
        className={`rounded-full px-3 py-1.5 text-xs border whitespace-nowrap ${
          selecionado === "personalizado" ? "bg-burnt text-white border-burnt" : "bg-surface border-line text-ink"
        }`}
      >
        Personalizado
      </button>

      {selecionado === "personalizado" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={inicio}
            max={fim}
            onChange={(e) => aoMudarPersonalizado(e.target.value, fim)}
            className="rounded-xl border border-line bg-cream px-2 py-1 text-xs"
          />
          <span className="text-xs text-muted">até</span>
          <input
            type="date"
            value={fim}
            min={inicio}
            max={hoje()}
            onChange={(e) => aoMudarPersonalizado(inicio, e.target.value)}
            className="rounded-xl border border-line bg-cream px-2 py-1 text-xs"
          />
        </div>
      )}
    </div>
  );
}
