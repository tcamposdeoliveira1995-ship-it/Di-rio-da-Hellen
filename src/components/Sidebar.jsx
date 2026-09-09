"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="no-print hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-line bg-surface px-4 py-6">
      <div className="px-2 mb-8 shrink-0">
        <p className="font-display text-lg text-burnt">🌻 Minha Jornada</p>
        <p className="text-xs text-muted">Diário da Hellen</p>
      </div>

      {/* min-h-0 é o que deixa esse nav encolher dentro do flex column e
          rolar por conta própria — sem ele, com muitos itens de menu, a
          lista simplesmente vaza pra fora da tela em telas mais baixas. */}
      <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-1">
        {NAV_ITEMS.map((item) => {
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                ativo
                  ? "bg-blush-soft text-burnt font-medium"
                  : "text-ink hover:bg-cream"
              }`}
            >
              <span aria-hidden>{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={sair}
        className="shrink-0 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted hover:bg-cream hover:text-ink transition-colors"
      >
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}
