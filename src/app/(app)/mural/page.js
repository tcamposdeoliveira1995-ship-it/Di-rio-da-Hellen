"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FotoPrivada from "@/components/FotoPrivada";
import CampoArquivo from "@/components/CampoArquivo";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";

export default function MuralPage() {
  const { mural, adicionarMural } = useStore();
  const [formAberto, setFormAberto] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Mural da Hellen 💌</h1>
          <p className="text-sm text-muted">Mensagens de quem está na sua torcida.</p>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Nova mensagem
          </button>
        )}
      </header>

      {formAberto && (
        <FormularioMural onFechar={() => setFormAberto(false)} onSalvar={adicionarMural} />
      )}

      {mural.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhuma mensagem por aqui ainda" emoji="💌" />
        </Card>
      ) : (
        <div className="space-y-4">
          {mural.map((m) => (
            <Card key={m.id}>
              <p className="text-sm text-muted">{formatarDataLonga(m.data)}</p>
              <p className="font-medium text-ink mt-0.5">De: {m.autor} 💗</p>
              <p className="text-sm text-ink mt-2">&ldquo;{m.mensagem}&rdquo;</p>
              {m.foto_path && (
                <FotoPrivada caminho={m.foto_path} alt={`Foto de ${m.autor}`} className="mt-3 w-full max-h-64" />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FormularioMural({ onFechar, onSalvar }) {
  const [autor, setAutor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [data, setData] = useState(hoje());
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ autor, mensagem, data }, foto);
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
          <p className="font-medium text-ink">Nova mensagem</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted bg-cream rounded-xl px-3 py-2">
          Como só a Hellen tem login por enquanto, quem quiser mandar uma mensagem passa pra ela
          (ou pra quem estiver ajudando) registrar aqui em nome de quem escreveu.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-muted mb-1">De</label>
            <input
              required
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ex: Tita"
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Mensagem</label>
          <textarea
            required
            rows={3}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm resize-none"
          />
        </div>

        <CampoArquivo label="Foto (opcional)" arquivo={foto} onSelecionar={setFoto} />

        {erro && <p className="text-sm text-burnt">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar mensagem
        </button>
      </form>
    </Card>
  );
}
