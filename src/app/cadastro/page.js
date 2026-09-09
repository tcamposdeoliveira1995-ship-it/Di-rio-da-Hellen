import { Suspense } from "react";
import CadastroForm from "./CadastroForm";

export const metadata = { title: "Criar conta — Diário da Hellen 🌻" };

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-surface border border-line shadow-[0_2px_24px_-8px_rgba(74,58,61,0.2)] p-8">
        <div className="text-center mb-6">
          <p className="text-3xl mb-1" aria-hidden>🌻</p>
          <h1 className="font-display text-xl text-ink">Criar conta</h1>
          <p className="text-sm text-muted">Diário da Hellen</p>
        </div>

        <Suspense fallback={null}>
          <CadastroForm />
        </Suspense>
      </div>
    </div>
  );
}
