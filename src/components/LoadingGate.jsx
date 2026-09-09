"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";

export default function LoadingGate({ children }) {
  const { carregando, erro } = useStore();

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

  return children;
}
