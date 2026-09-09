"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";
import { STATUS_DUVIDA, statusDuvidaPorId } from "@/lib/constants";

export default function DuvidasPage() {
  const { duvidas, adicionarDuvida, atualizarDuvida, souAdmin } = useStore();
  const [formAberto, setFormAberto] = useState(false);

  const abertas = duvidas.filter((d) => d.status !== "respondida");
  const respondidas = duvidas.filter((d) => d.status === "respondida");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Minhas Dúvidas ❓</h1>
          <p className="text-sm text-muted">Anote o que quiser perguntar na próxima consulta.</p>
        </div>
        {souAdmin && !formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Nova dúvida
          </button>
        )}
      </header>

      {souAdmin && formAberto && (
        <FormularioDuvida onFechar={() => setFormAberto(false)} onSalvar={adicionarDuvida} />
      )}

      {duvidas.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhuma dúvida registrada ainda" emoji="❓" />
        </Card>
      ) : (
        <div className="space-y-6">
          {abertas.length > 0 && (
            <Secao titulo="Quero perguntar">
              {abertas.map((d) => (
                <DuvidaCard key={d.id} duvida={d} onAtualizar={atualizarDuvida} souAdmin={souAdmin} />
              ))}
            </Secao>
          )}
          {respondidas.length > 0 && (
            <Secao titulo="Respondidas">
              {respondidas.map((d) => (
                <DuvidaCard key={d.id} duvida={d} onAtualizar={atualizarDuvida} souAdmin={souAdmin} />
              ))}
            </Secao>
          )}
        </div>
      )}
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">{titulo}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DuvidaCard({ duvida, onAtualizar, souAdmin }) {
  const [editando, setEditando] = useState(false);
  const [resposta, setResposta] = useState(duvida.resposta || "");
  const [salvando, setSalvando] = useState(false);
  const status = statusDuvidaPorId(duvida.status);

  async function marcarRespondida() {
    setSalvando(true);
    try {
      await onAtualizar(duvida.id, { status: "respondida", resposta });
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">{formatarDataLonga(duvida.data)}</p>
          <p className="font-medium text-ink mt-0.5">{duvida.pergunta}</p>
        </div>
        <span className="text-xs whitespace-nowrap flex items-center gap-1">
          <span aria-hidden>{status.emoji}</span> {status.label}
        </span>
      </div>

      {duvida.status === "respondida" && duvida.resposta && !editando && (
        <p className="text-sm text-ink mt-3 bg-cream rounded-xl px-3 py-2">{duvida.resposta}</p>
      )}

      {souAdmin && (duvida.status !== "respondida" || editando) && (
        <div className="mt-3 space-y-2">
          <textarea
            rows={2}
            placeholder="Resposta / orientação recebida"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm resize-none"
          />
          <button
            onClick={marcarRespondida}
            disabled={salvando}
            className="flex items-center gap-2 rounded-xl bg-burnt text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {salvando && <Loader2 size={14} className="animate-spin" />}
            Marcar como respondida
          </button>
        </div>
      )}

      {souAdmin && duvida.status === "respondida" && !editando && (
        <button onClick={() => setEditando(true)} className="text-xs text-burnt mt-2 hover:underline">
          Editar resposta
        </button>
      )}
    </Card>
  );
}

function FormularioDuvida({ onFechar, onSalvar }) {
  const [data, setData] = useState(hoje());
  const [pergunta, setPergunta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ data, pergunta, status: STATUS_DUVIDA[0].id, resposta: "" });
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
          <p className="font-medium text-ink">Nova dúvida</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Pergunta</label>
          <textarea
            required
            rows={2}
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Ex: Esse sintoma é esperado?"
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
