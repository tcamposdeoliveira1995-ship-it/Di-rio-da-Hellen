"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FotoPrivada from "@/components/FotoPrivada";
import CampoFotos from "@/components/CampoFotos";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";

export default function MinhaHistoriaPage() {
  const { minhaHistoria, adicionarHistoria, souAdmin } = useStore();
  const [formAberto, setFormAberto] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Minha História 📜</h1>
          <p className="text-sm text-muted">
            Os capítulos maiores da caminhada — como foi o diagnóstico, e o que mais quiser
            contar com calma, não só uma linha na Jornada.
          </p>
        </div>
        {souAdmin && !formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90 shrink-0"
          >
            <Plus size={16} /> Adicionar capítulo
          </button>
        )}
      </header>

      {souAdmin && formAberto && (
        <FormularioHistoria onFechar={() => setFormAberto(false)} onSalvar={adicionarHistoria} />
      )}

      {minhaHistoria.length === 0 ? (
        <Card>
          <EmptyState
            titulo="Nenhum capítulo escrito ainda"
            descricao="Quando quiser, conte como foi o começo dessa jornada."
            emoji="📜"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {minhaHistoria.map((capitulo) => (
            <Card key={capitulo.id}>
              {capitulo.data && <p className="text-xs text-muted">{formatarDataLonga(capitulo.data)}</p>}
              <h2 className="font-display text-lg text-ink mt-0.5">{capitulo.titulo}</h2>
              {capitulo.texto && (
                <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{capitulo.texto}</p>
              )}
              {capitulo.fotos_paths?.length > 0 && (
                <div
                  className={`mt-3 grid gap-2 ${
                    capitulo.fotos_paths.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {capitulo.fotos_paths.map((caminho) => (
                    <FotoPrivada
                      key={caminho}
                      caminho={caminho}
                      alt={capitulo.titulo}
                      className={capitulo.fotos_paths.length === 1 ? "w-full max-h-72" : "w-full h-32"}
                    />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FormularioHistoria({ onFechar, onSalvar }) {
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState(hoje());
  const [texto, setTexto] = useState("");
  const [fotosNovas, setFotosNovas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ titulo, data: data || null, texto }, fotosNovas);
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
          <p className="font-medium text-ink">Novo capítulo</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Título</label>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Como foi o diagnóstico"
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Data (opcional)</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Como foi</label>
          <textarea
            rows={8}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Conte com o tempo que precisar..."
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm resize-none"
          />
        </div>

        <CampoFotos
          label="Fotos (opcional)"
          fotosExistentes={[]}
          fotosNovas={fotosNovas}
          onAdicionar={(arquivos) => setFotosNovas((atual) => [...atual, ...arquivos])}
          onRemoverExistente={() => {}}
          onRemoverNova={(indice) => setFotosNovas((atual) => atual.filter((_, i) => i !== indice))}
        />

        {erro && <p className="text-sm text-burnt">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar capítulo
        </button>
      </form>
    </Card>
  );
}
