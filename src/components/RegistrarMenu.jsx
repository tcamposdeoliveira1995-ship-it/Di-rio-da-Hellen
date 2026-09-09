"use client";

import Link from "next/link";
import { X } from "lucide-react";

const OPCOES = [
  { href: "/diario/novo", emoji: "📖", label: "Registrar dia" },
  { href: "/sintomas?novo=1", emoji: "🩺", label: "Registrar sintoma" },
  { href: "/tratamento?novo=1", emoji: "💊", label: "Registrar tratamento" },
  { href: "/exames?novo=1", emoji: "🧪", label: "Adicionar exame" },
];

export default function RegistrarMenu({ aberto, onFechar }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-ink/30"
        onClick={onFechar}
      />
      <div className="absolute bottom-20 left-4 right-4 rounded-3xl bg-surface border border-line shadow-lg p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="font-medium text-ink">O que você quer registrar?</p>
          <button onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {OPCOES.map((op) => (
            <Link
              key={op.href}
              href={op.href}
              onClick={onFechar}
              className="flex flex-col items-center gap-1 rounded-2xl bg-cream px-3 py-4 text-center hover:bg-blush-soft transition-colors"
            >
              <span className="text-2xl" aria-hidden>{op.emoji}</span>
              <span className="text-xs text-ink">{op.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
