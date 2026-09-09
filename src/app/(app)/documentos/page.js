"use client";

import { useState } from "react";
import { Plus, X, Loader2, FileText } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FotoPrivada from "@/components/FotoPrivada";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";
import { CATEGORIAS_DOCUMENTO } from "@/lib/constants";

export default function DocumentosPage() {
  const { documentos, adicionarDocumento } = useStore();
  const [formAberto, setFormAberto] = useState(false);
  const [filtro, setFiltro] = useState("todos");

  const listados = filtro === "todos" ? documentos : documentos.filter((d) => d.categoria === filtro);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Documentos 📂</h1>
          <p className="text-sm text-muted">Pasta digital pra tudo que não é exame.</p>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Adicionar documento
          </button>
        )}
      </header>

      {formAberto && (
        <FormularioDocumento onFechar={() => setFormAberto(false)} onSalvar={adicionarDocumento} />
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <BotaoFiltro ativo={filtro === "todos"} onClick={() => setFiltro("todos")} label="Todos" />
        {CATEGORIAS_DOCUMENTO.map((c) => (
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
          <EmptyState titulo="Nenhum documento por aqui ainda" emoji="📂" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listados.map((doc) => {
            const categoria = CATEGORIAS_DOCUMENTO.find((c) => c.id === doc.categoria);
            return (
              <Card key={doc.id}>
                <p className="text-sm text-muted flex items-center gap-1.5">
                  <span aria-hidden>{categoria?.emoji || "📎"}</span> {categoria?.label || doc.categoria}
                </p>
                <p className="font-medium text-ink mt-1">{doc.nome}</p>
                {doc.data && <p className="text-sm text-muted">{formatarDataLonga(doc.data)}</p>}
                {doc.observacao && <p className="text-sm text-ink mt-2">{doc.observacao}</p>}
                {doc.arquivo_path && (
                  doc.arquivo_path.match(/\.(png|jpe?g|webp)$/i) ? (
                    <FotoPrivada caminho={doc.arquivo_path} alt={doc.nome} className="mt-3 w-full max-h-48" />
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

function FormularioDocumento({ onFechar, onSalvar }) {
  const [categoria, setCategoria] = useState(CATEGORIAS_DOCUMENTO[0].id);
  const [nome, setNome] = useState("");
  const [data, setData] = useState(hoje());
  const [observacao, setObservacao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ categoria, nome, data, observacao }, arquivo);
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
          <p className="font-medium text-ink">Novo documento</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Categoria</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIAS_DOCUMENTO.map((c) => (
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

        <div>
          <label className="block text-sm text-muted mb-1">Nome do documento</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
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
          <label className="block text-sm text-muted mb-1">Observação</label>
          <textarea
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1" htmlFor="arquivo-documento">
            Arquivo (PDF, foto ou imagem)
          </label>
          <input
            id="arquivo-documento"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            className="text-sm text-muted"
          />
        </div>

        {erro && <p className="text-sm text-burnt">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar documento
        </button>
      </form>
    </Card>
  );
}
