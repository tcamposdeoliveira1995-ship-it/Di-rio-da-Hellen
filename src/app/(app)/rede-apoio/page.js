"use client";

import { useState } from "react";
import { Plus, X, Loader2, Phone, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { CATEGORIAS_CONTATO, TIPOS_CONTATO_UTIL } from "@/lib/constants";

export default function RedeApoioPage() {
  const { contatosApoio, adicionarContato, removerContato } = useStore();
  const [formAberto, setFormAberto] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Minha Rede de Apoio 🤍</h1>
          <p className="text-sm text-muted">As pessoas e contatos importantes da sua jornada.</p>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Adicionar contato
          </button>
        )}
      </header>

      {formAberto && (
        <FormularioContato onFechar={() => setFormAberto(false)} onSalvar={adicionarContato} />
      )}

      {CATEGORIAS_CONTATO.map((categoria) => {
        const contatos = contatosApoio.filter((c) => c.categoria === categoria.id);
        return (
          <div key={categoria.id}>
            <h2 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
              <span aria-hidden>{categoria.emoji}</span> {categoria.label}
            </h2>
            {contatos.length === 0 ? (
              <Card>
                <EmptyState titulo="Nenhum contato aqui ainda" emoji={categoria.emoji} />
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {contatos.map((c) => (
                  <ContatoCard key={c.id} contato={c} onRemover={removerContato} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContatoCard({ contato, onRemover }) {
  const tipoUtil = TIPOS_CONTATO_UTIL.find((t) => t.id === contato.tipo_util);
  return (
    <Card className="!p-4 flex items-start justify-between gap-3">
      <div>
        <p className="font-medium text-ink">{contato.nome}</p>
        {contato.relacao && <p className="text-xs text-muted">{contato.relacao}</p>}
        {contato.especialidade && <p className="text-xs text-muted">{contato.especialidade}</p>}
        {contato.hospital && <p className="text-xs text-muted">{contato.hospital}</p>}
        {tipoUtil && <p className="text-xs text-muted">{tipoUtil.emoji} {tipoUtil.label}</p>}
        {contato.telefone && (
          <p className="text-sm text-burnt flex items-center gap-1.5 mt-1">
            <Phone size={14} /> {contato.telefone}
          </p>
        )}
      </div>
      <button onClick={() => onRemover(contato.id)} aria-label="Remover" className="text-muted hover:text-burnt">
        <Trash2 size={16} />
      </button>
    </Card>
  );
}

function FormularioContato({ onFechar, onSalvar }) {
  const [categoria, setCategoria] = useState(CATEGORIAS_CONTATO[0].id);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [relacao, setRelacao] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [hospital, setHospital] = useState("");
  const [tipoUtil, setTipoUtil] = useState(TIPOS_CONTATO_UTIL[0].id);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({
        categoria,
        nome,
        telefone,
        relacao: categoria === "familia" ? relacao : null,
        especialidade: categoria === "equipe_medica" ? especialidade : null,
        hospital: categoria === "equipe_medica" ? hospital : null,
        tipo_util: categoria === "util" ? tipoUtil : null,
      });
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
          <p className="font-medium text-ink">Novo contato</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Categoria</label>
          <div className="flex gap-2">
            {CATEGORIAS_CONTATO.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm border ${
                  categoria === c.id ? "bg-blush-soft border-burnt" : "bg-cream border-transparent"
                }`}
              >
                <span aria-hidden>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {categoria === "util" && (
          <div>
            <label className="block text-sm text-muted mb-2">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_CONTATO_UTIL.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipoUtil(t.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm border ${
                    tipoUtil === t.id ? "bg-blush-soft border-burnt" : "bg-cream border-transparent"
                  }`}
                >
                  <span aria-hidden>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-muted mb-1">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Telefone</label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
        </div>

        {categoria === "familia" && (
          <div>
            <label className="block text-sm text-muted mb-1">Relação</label>
            <input
              value={relacao}
              onChange={(e) => setRelacao(e.target.value)}
              placeholder="Ex: Mãe, irmã, tia..."
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
            />
          </div>
        )}

        {categoria === "equipe_medica" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Especialidade</label>
              <input
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Hospital</label>
              <input
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {erro && <p className="text-sm text-burnt">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          Salvar contato
        </button>
      </form>
    </Card>
  );
}
