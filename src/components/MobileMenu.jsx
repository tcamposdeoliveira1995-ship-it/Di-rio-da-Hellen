"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";

// Todas as telas do app, num painel deslizante — o menu inferior do
// celular só tem espaço pra 4 atalhos fixos + o botão de registro
// rápido, então o resto (Tratamento, Dúvidas, Evolução, Memórias,
// Conquistas, Mural, Documentos, Rede de Apoio...) só é alcançável por
// aqui no mobile.
export default function MobileMenu({ aberto, onFechar }) {
  const pathname = usePathname();

  if (!aberto) return null;

  return (
    <div className="no-print fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button aria-label="Fechar" className="absolute inset-0 bg-ink/30" onClick={onFechar} />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-line shrink-0">
          <div>
            <p className="font-display text-burnt">🌻 Minha Jornada</p>
            <p className="text-xs text-muted">Diário da Hellen</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar menu" className="text-muted">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onFechar}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                  ativo ? "bg-blush-soft text-burnt font-medium" : "text-ink hover:bg-cream"
                }`}
              >
                <span aria-hidden>{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
