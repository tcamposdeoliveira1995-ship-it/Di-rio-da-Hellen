"use client";

import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export default function LoadingGate({ children }) {
  const { carregando, erro, souPendente } = useStore();
  const router = useRouter();

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[60vh] text-sm text-muted">
        <Loader2 size={22} className="animate-spin text-burnt" />
        Carregando seu diário...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-[60vh] text-center px-6">
        <AlertTriangle className="text-burnt" size={24} />
        <p className="text-sm text-ink max-w-sm">{erro}</p>
      </div>
    );
  }

  if (souPendente) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[70vh] text-center px-6">
        <Clock className="text-burnt" size={28} />
        <p className="font-medium text-ink">Seu acesso ainda não foi aprovado</p>
        <p className="text-sm text-muted max-w-sm">
          Sua conta foi criada, mas só a Hellen consegue liberar o acesso. Peça pra ela
          aprovar você em <strong>Pessoas</strong>, no painel dela.
        </p>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className="mt-2 text-sm text-burnt underline"
        >
          Sair
        </button>
      </div>
    );
  }

  return children;
}
