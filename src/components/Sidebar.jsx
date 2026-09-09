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
    <aside className="no-print hidden md:flex w-64 flex-col shrink-0 border-r border-line bg-surface px-4 py-6">
      <div className="px-2 mb-8">
        <p className="font-display text-lg text-burnt">🌻 Minha Jornada</p>
        <p className="text-xs text-muted">Diário da Hellen</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
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
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted hover:bg-cream hover:text-ink transition-colors"
      >
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}
