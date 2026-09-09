"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MobileMenu from "./MobileMenu";

export default function MobileHeader() {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <MobileMenu aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
      <header className="no-print md:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-surface">
        <button onClick={() => setMenuAberto(true)} aria-label="Abrir menu" className="text-ink">
          <Menu size={22} />
        </button>
        <p className="font-display text-burnt">🌻 Minha Jornada</p>
        <button onClick={sair} aria-label="Sair" className="text-muted">
          <LogOut size={18} />
        </button>
      </header>
    </>
  );
}
