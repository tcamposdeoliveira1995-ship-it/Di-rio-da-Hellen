"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, X, AlertTriangle, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { hoje, formatarDataHora } from "@/lib/date";
import { SINTOMAS_DISPONIVEIS, NIVEIS_INTENSIDADE, nivelIntensidadePorValor } from "@/lib/constants";

function agora() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function SintomasClient() {
  const searchParams = useSearchParams();
  const { sintomas, adicionarSintoma, souAdmin } = useStore();
  const [formAberto, setFormAberto] = useState(souAdmin && searchParams.get("novo") === "1");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Sintomas 🩺</h1>
          <p className="text-sm text-muted">Registre como o corpo está reagindo, dia a dia.</p>
        </div>
        {souAdmin && !formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Registrar sintoma
          </button>
        )}
      </header>

      <Card className="bg-blush-soft border-blush">
        <p className="text-sm text-ink">
          Este espaço só registra informações — ele não diagnostica nem substitui a equipe
          médica. Em situações potencialmente urgentes, procure atendimento de emergência.
        </p>
      </Card>

      {souAdmin && formAberto && <FormularioSintoma onFechar={() => setFormAberto(false)} onSalvar={adicionarSintoma} />}

      {sintomas.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhum sintoma registrado ainda" emoji="🩺" />
        </Card>
      ) : (
        <div className="space-y-3">
          {sintomas.map((s) => {
            const info = SINTOMAS_DISPONIVEIS.find((x) => x.id === s.sintoma);
            const nivel = nivelIntensidadePorValor(s.intensidade);
            return (
              <Card key={s.id} className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{info?.emoji || "❤️"}</span>
                    <div>
                      <p className="font-medium text-ink">{info?.label || s.sintoma}</p>
                      <p className="text-xs text-muted">{formatarDataHora(s.data, s.horario)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-burnt bg-blush-soft rounded-full px-2.5 py-1 whitespace-nowrap">
                    {nivel.label}
                  </span>
                </div>
                {s.duracao && <p className="text-sm text-muted mt-2">Duração: {s.duracao}</p>}
                {s.observacao && <p className="text-sm text-ink mt-1">{s.observacao}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormularioSintoma({ onFechar, onSalvar }) {
  const [data, setData] = useState(hoje());
  const [horario, setHorario] = useState(agora());
  const [sintoma, setSintoma] = useState(SINTOMAS_DISPONIVEIS[0].id);
  const [intensidade, setIntensidade] = useState(1);
  const [duracao, setDuracao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ data, horario, sintoma, intensidade, duracao, observacao });
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
          <p className="font-medium text-ink">Novo registro</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
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
            <label className="block text-sm text-muted mb-1">Horário</label>
            <input
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Sintoma</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SINTOMAS_DISPONIVEIS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSintoma(s.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                  sintoma === s.id ? "bg-blush-soft border-burnt" : "bg-cream border-transparent"
                }`}
              >
                <span aria-hidden>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Intensidade</label>
          <div className="flex flex-wrap gap-2">
            {NIVEIS_INTENSIDADE.map((n) => (
              <button
                key={n.valor}
                type="button"
                onClick={() => setIntensidade(n.valor)}
                className={`rounded-full px-3 py-1.5 text-xs border ${
                  intensidade === n.valor ? "bg-burnt text-white border-burnt" : "bg-cream border-line text-ink"
                }`}
              >
                {n.valor} · {n.label}
              </button>
            ))}
          </div>
          {intensidade >= 4 && (
            <p className="mt-2 flex items-start gap-2 text-xs text-burnt">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Intensidade alta — considere avisar a equipe médica ou buscar atendimento.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Duração</label>
          <input
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            placeholder="Ex: manhã toda, alguns minutos..."
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Observação</label>
          <textarea
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
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
          Salvar sintoma
        </button>
      </form>
    </Card>
  );
}
