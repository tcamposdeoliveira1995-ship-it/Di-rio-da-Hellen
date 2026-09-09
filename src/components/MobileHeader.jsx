"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function MobileHeader() {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-surface">
      <p className="font-display text-burnt">🌷 Minha Jornada</p>
      <button onClick={sair} aria-label="Sair" className="text-muted">
        <LogOut size={18} />
      </button>
    </header>
  );
}
