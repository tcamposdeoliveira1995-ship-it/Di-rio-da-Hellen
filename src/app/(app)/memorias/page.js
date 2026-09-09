"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FotoPrivada from "@/components/FotoPrivada";
import CampoArquivo from "@/components/CampoArquivo";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";

export default function MemoriasPage() {
  const { memorias, adicionarMemoria, souAdmin } = useStore();
  const [formAberto, setFormAberto] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Memórias 📸</h1>
          <p className="text-sm text-muted">
            Nem tudo precisa ser sobre tratamento — os passeios, as risadas, os dias bons.
          </p>
        </div>
        {souAdmin && !formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Adicionar memória
          </button>
        )}
      </header>

      {souAdmin && formAberto && (
        <FormularioMemoria onFechar={() => setFormAberto(false)} onSalvar={adicionarMemoria} />
      )}

      {memorias.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhuma memória guardada ainda" emoji="📸" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {memorias.map((m) => (
            <div key={m.id} className="rounded-2xl overflow-hidden bg-surface border border-line">
              <FotoPrivada caminho={m.foto_path} alt={m.legenda || "Memória"} className="w-full h-36" />
              <div className="p-2.5">
                {m.data && <p className="text-[11px] text-muted">{formatarDataLonga(m.data)}</p>}
                {m.legenda && <p className="text-sm text-ink font-medium truncate">{m.legenda}</p>}
                {m.descricao && <p className="text-xs text-muted mt-0.5 line-clamp-2">{m.descricao}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormularioMemoria({ onFechar, onSalvar }) {
  const [foto, setFoto] = useState(null);
  const [data, setData] = useState(hoje());
  const [legenda, setLegenda] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    if (!foto) {
      setErro("Escolha uma foto pra essa memória.");
      return;
    }
    setSalvando(true);
    try {
      await onSalvar({ data, legenda, descricao }, foto);
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
          <p className="font-medium text-ink">Nova memória</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <CampoArquivo label="Foto" arquivo={foto} onSelecionar={setFoto} />

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
          <label className="block text-sm text-muted mb-1">Legenda</label>
          <input
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
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
          Salvar memória
        </button>
      </form>
    </Card>
  );
}
