"use client";

import { HUMORES } from "@/lib/constants";

export default function MoodPicker({ valor, onChange, size = "md" }) {
  const tamanho = size === "lg" ? "text-3xl md:text-4xl" : "text-2xl";
  return (
    <div className="flex flex-wrap gap-2">
      {HUMORES.map((h) => {
        const selecionado = valor === h.id;
        return (
          <button
            key={h.id}
            type="button"
            onClick={() => onChange?.(h.id)}
            title={h.label}
            aria-pressed={selecionado}
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all border ${
              selecionado
                ? "bg-blush-soft border-burnt scale-105 shadow-sm"
                : "bg-cream border-transparent hover:border-line"
            }`}
          >
            <span className={tamanho} aria-hidden>{h.emoji}</span>
            <span className="text-[11px] text-muted whitespace-nowrap">{h.label}</span>
          </button>
        );
      })}
    </div>
  );
}
