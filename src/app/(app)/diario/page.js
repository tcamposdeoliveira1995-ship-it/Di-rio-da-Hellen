"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FotoPrivada from "@/components/FotoPrivada";
import { useStore } from "@/lib/store";
import { formatarDataLonga } from "@/lib/date";
import { humorPorId } from "@/lib/constants";

export default function DiarioPage() {
  const { diario, souAdmin } = useStore();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Meu Diário 📖</h1>
          <p className="text-sm text-muted">Cada dia é um capítulo da sua história.</p>
        </div>
        {souAdmin && (
          <Link
            href="/diario/novo"
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Registrar meu dia
          </Link>
        )}
      </header>

      {diario.length === 0 ? (
        <Card>
          <EmptyState
            titulo="Nenhum registro ainda"
            descricao="Que tal contar como foi o seu dia hoje?"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {diario.map((entrada) => {
            const humor = humorPorId(entrada.humor);
            return (
              <Card key={entrada.id}>
                <div className="flex items-start gap-4">
                  {humor && <span className="text-3xl" aria-hidden>{humor.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-ink">{formatarDataLonga(entrada.data)}</p>
                      {souAdmin && (
                        <Link
                          href={`/diario/novo?data=${entrada.data}`}
                          className="text-xs text-burnt hover:underline whitespace-nowrap"
                        >
                          Editar
                        </Link>
                      )}
                    </div>
                    {entrada.energia && (
                      <p className="text-xs text-muted mt-0.5">Energia: {entrada.energia}/5</p>
                    )}
                    {entrada.texto && <p className="text-sm text-ink mt-2">{entrada.texto}</p>}
                    {entrada.algo_bom && (
                      <p className="text-sm text-muted mt-2">
                        <span aria-hidden>🌟</span> {entrada.algo_bom}
                      </p>
                    )}
                    {entrada.foto_path && (
                      <FotoPrivada
                        caminho={entrada.foto_path}
                        alt="Foto do dia"
                        className="mt-3 w-full max-h-64"
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
