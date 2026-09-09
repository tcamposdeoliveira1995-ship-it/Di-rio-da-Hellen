"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, X, Loader2, FileText } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FotoPrivada from "@/components/FotoPrivada";
import CampoArquivo from "@/components/CampoArquivo";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";
import { CATEGORIAS_EXAME } from "@/lib/constants";

export default function ExamesClient() {
  const searchParams = useSearchParams();
  const { exames, adicionarExame, souAdmin } = useStore();
  const [formAberto, setFormAberto] = useState(souAdmin && searchParams.get("novo") === "1");
  const [filtro, setFiltro] = useState("todos");

  const listados = filtro === "todos" ? exames : exames.filter((e) => e.tipo === filtro);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Exames 🧪</h1>
          <p className="text-sm text-muted">Biblioteca organizada dos seus exames.</p>
        </div>
        {souAdmin && !formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Adicionar exame
          </button>
        )}
      </header>

      {souAdmin && formAberto && <FormularioExame onFechar={() => setFormAberto(false)} onSalvar={adicionarExame} />}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <BotaoFiltro ativo={filtro === "todos"} onClick={() => setFiltro("todos")} label="Todos" />
        {CATEGORIAS_EXAME.map((c) => (
          <BotaoFiltro
            key={c.id}
            ativo={filtro === c.id}
            onClick={() => setFiltro(c.id)}
            label={`${c.emoji} ${c.label}`}
          />
        ))}
      </div>

      {listados.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhum exame por aqui ainda" emoji="🧪" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listados.map((exame) => {
            const categoria = CATEGORIAS_EXAME.find((c) => c.id === exame.tipo);
            return (
              <Card key={exame.id}>
                <p className="text-sm text-muted flex items-center gap-1.5">
                  <span aria-hidden>{categoria?.emoji || "🧪"}</span> {categoria?.label || exame.tipo}
                </p>
                <p className="font-medium text-ink mt-1">{formatarDataLonga(exame.data)}</p>
                {exame.local && <p className="text-sm text-muted mt-1">{exame.local}</p>}
                {exame.medico_solicitante && (
                  <p className="text-sm text-muted">Solicitado por {exame.medico_solicitante}</p>
                )}
                {exame.observacao && <p className="text-sm text-ink mt-2">{exame.observacao}</p>}
                {exame.arquivo_path && (
                  exame.arquivo_path.match(/\.(png|jpe?g|webp)$/i) ? (
                    <FotoPrivada caminho={exame.arquivo_path} alt="Arquivo do exame" className="mt-3 w-full max-h-48" />
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-burnt">
                      <FileText size={16} /> Arquivo anexado
                    </p>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BotaoFiltro({ ativo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs border whitespace-nowrap ${
        ativo ? "bg-burnt text-white border-burnt" : "bg-surface border-line text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function FormularioExame({ onFechar, onSalvar }) {
  const [tipo, setTipo] = useState(CATEGORIAS_EXAME[0].id);
  const [data, setData] = useState(hoje());
  const [local, setLocal] = useState("");
  const [medicoSolicitante, setMedicoSolicitante] = useState("");
  const [observacao, setObservacao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar(
        { tipo, data, local, medico_solicitante: medicoSolicitante, observacao },
        arquivo
      );
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
          <p className="font-medium text-ink">Novo exame</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Tipo do exame</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIAS_EXAME.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setTipo(c.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                  tipo === c.id ? "bg-blush-soft border-burnt" : "bg-cream border-transparent"
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
            <label className="block text-sm text-muted mb-1">Local</label>
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Médico solicitante</label>
          <input
            value={medicoSolicitante}
            onChange={(e) => setMedicoSolicitante(e.target.value)}
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

        <CampoArquivo
          label="Arquivo (PDF, foto ou imagem)"
          arquivo={arquivo}
          onSelecionar={setArquivo}
          aceitarPdf
        />

        {erro && <p className="text-sm text-burnt">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar exame
        </button>
      </form>
    </Card>
  );
}
