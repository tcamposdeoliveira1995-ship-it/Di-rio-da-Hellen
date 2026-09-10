"use client";

import { Loader2, ShieldCheck, Eye, Clock, X, Trash2 } from "lucide-react";
import { useState } from "react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { formatarDataLonga } from "@/lib/date";

const ROTULO_PAPEL = {
  admin: { emoji: "👑", label: "Admin (edita tudo)" },
  visualizador: { emoji: "👀", label: "Visualizador (só vê)" },
  pendente: { emoji: "⏳", label: "Pendente" },
};

export default function PessoasPage() {
  const { perfis, souAdmin, definirPapel, recusarPessoa, userId } = useStore();

  if (!souAdmin) {
    return (
      <Card>
        <EmptyState
          emoji="🔒"
          titulo="Só a Hellen acessa essa tela"
          descricao="Aqui é onde se aprova quem pode ver o painel."
        />
      </Card>
    );
  }

  const pendentes = perfis.filter((p) => p.papel === "pendente");
  const aprovados = perfis.filter((p) => p.papel !== "pendente");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">Pessoas 👪</h1>
        <p className="text-sm text-muted">
          Quem pode ver o painel — e quem ainda está esperando você aprovar.
        </p>
      </header>

      {pendentes.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
            <Clock size={18} /> Esperando aprovação
          </h2>
          <div className="space-y-3">
            {pendentes.map((p) => (
              <PessoaCard
                key={p.id}
                pessoa={p}
                onDefinirPapel={definirPapel}
                onRecusar={recusarPessoa}
                ehVoce={p.id === userId}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Aprovadas</h2>
        {aprovados.length === 0 ? (
          <Card>
            <EmptyState titulo="Ninguém aprovado ainda" emoji="👪" />
          </Card>
        ) : (
          <div className="space-y-3">
            {aprovados.map((p) => (
              <PessoaCard
                key={p.id}
                pessoa={p}
                onDefinirPapel={definirPapel}
                onRecusar={recusarPessoa}
                ehVoce={p.id === userId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PessoaCard({ pessoa, onDefinirPapel, onRecusar, ehVoce }) {
  const [carregando, setCarregando] = useState(null); // qual ação está em andamento
  const [erro, setErro] = useState("");

  const papelInfo = ROTULO_PAPEL[pessoa.papel] || ROTULO_PAPEL.pendente;

  async function mudarPapel(papel) {
    setErro("");
    setCarregando(papel);
    try {
      await onDefinirPapel(pessoa.id, papel);
    } catch (err) {
      setErro(err.message || "Não foi possível atualizar.");
    } finally {
      setCarregando(null);
    }
  }

  async function recusar() {
    if (!window.confirm(`Recusar e excluir a conta de "${pessoa.nome || "essa pessoa"}"? Não dá pra desfazer.`)) {
      return;
    }
    setErro("");
    setCarregando("recusar");
    try {
      await onRecusar(pessoa.id);
    } catch (err) {
      setErro(err.message || "Não foi possível recusar.");
      setCarregando(null);
    }
  }

  return (
    <Card className="!p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-medium text-ink">
            {pessoa.nome || "(sem nome)"} {ehVoce && <span className="text-xs text-muted">(você)</span>}
          </p>
          <p className="text-xs text-muted">
            {pessoa.telefone && `${pessoa.telefone} · `}
            {papelInfo.emoji} {papelInfo.label} · desde {formatarDataLonga(pessoa.created_at?.slice(0, 10))}
          </p>
        </div>

        {!ehVoce && (
          <div className="flex gap-2 flex-wrap">
            {pessoa.papel !== "visualizador" && (
              <BotaoAcao
                onClick={() => mudarPapel("visualizador")}
                carregando={carregando === "visualizador"}
                icone={<Eye size={14} />}
                label={pessoa.papel === "pendente" ? "Aprovar" : "Tornar visualizador"}
                destaque
              />
            )}
            {pessoa.papel !== "admin" && (
              <BotaoAcao
                onClick={() => mudarPapel("admin")}
                carregando={carregando === "admin"}
                icone={<ShieldCheck size={14} />}
                label="Tornar admin"
              />
            )}
            {pessoa.papel !== "pendente" && (
              <BotaoAcao
                onClick={() => mudarPapel("pendente")}
                carregando={carregando === "pendente"}
                icone={<X size={14} />}
                label="Revogar acesso"
              />
            )}
            <BotaoAcao
              onClick={recusar}
              carregando={carregando === "recusar"}
              icone={<Trash2 size={14} />}
              label="Recusar"
              perigo
            />
          </div>
        )}
      </div>
      {erro && <p className="text-xs text-burnt mt-2">{erro}</p>}
    </Card>
  );
}

function BotaoAcao({ onClick, carregando, icone, label, destaque, perigo }) {
  return (
    <button
      onClick={onClick}
      disabled={carregando}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs disabled:opacity-60 ${
        destaque ? "bg-burnt text-white" : perigo ? "bg-transparent text-burnt border border-burnt/40" : "bg-cream text-ink"
      }`}
    >
      {carregando ? <Loader2 size={14} className="animate-spin" /> : icone}
      {label}
    </button>
  );
}
