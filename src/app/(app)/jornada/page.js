"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga, diaDaJornada } from "@/lib/date";
import { CATEGORIAS_JORNADA, categoriaJornadaPorId } from "@/lib/constants";

export default function JornadaPage() {
  const { tratamentoInfo, eventosJornada, adicionarEventoJornada } = useStore();
  const [formAberto, setFormAberto] = useState(false);

  const dataInicioJornada = tratamentoInfo?.jornada_data_inicio || tratamentoInfo?.data_inicio;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Minha Jornada 🌱</h1>
          <p className="text-sm text-muted">
            {dataInicioJornada ? `Dia ${diaDaJornada(dataInicioJornada)} da caminhada.` : "Sua caminhada, um passo por vez."}
          </p>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Adicionar evento
          </button>
        )}
      </header>

      {formAberto && (
        <FormularioEvento onFechar={() => setFormAberto(false)} onSalvar={adicionarEventoJornada} />
      )}

      {eventosJornada.length === 0 ? (
        <Card>
          <EmptyState titulo="Sua linha do tempo está vazia" descricao="Comece registrando o primeiro passo dessa caminhada." emoji="🌱" />
        </Card>
      ) : (
        <ol className="relative border-l-2 border-blush pl-6 space-y-6 ml-2">
          {eventosJornada.map((evento) => {
            const categoria = categoriaJornadaPorId(evento.categoria);
            const futuro = evento.data > hoje();
            return (
              <li key={evento.id} className="relative">
                <span
                  className={`absolute -left-[34px] top-1 w-4 h-4 rounded-full border-2 ${
                    futuro ? "bg-cream border-burnt" : "bg-burnt border-burnt"
                  }`}
                />
                <Card className="!p-4">
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <span aria-hidden>{categoria.emoji}</span> {formatarDataLonga(evento.data)}
                  </p>
                  <p className="font-medium text-ink mt-0.5">{evento.titulo}</p>
                  {evento.descricao && <p className="text-sm text-muted mt-1">{evento.descricao}</p>}
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function FormularioEvento({ onFechar, onSalvar }) {
  const [data, setData] = useState(hoje());
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_JORNADA[0].id);
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ data, titulo, categoria, descricao });
      onFechar();
    } catch (err) {
      setErro(err.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <form onSubmit={aoSalvar} className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-ink">Novo evento na jornada</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Categoria</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIAS_JORNADA.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                  categoria === c.id ? "bg-blush-soft border-burnt" : "bg-cream border-transparent"
                }`}
              >
                <span aria-hidden>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-muted mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Título</label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Descrição</label>
          <textarea
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm resize-none"
          />
        </div>

        {erro && <p className="text-sm text-burnt">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </form>
    </Card>
  );
}
