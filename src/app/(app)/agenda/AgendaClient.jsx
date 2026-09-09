"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga, diasNoMes, NOMES_MES, NOMES_DIA_SEMANA } from "@/lib/date";
import { TIPOS_AGENDA, tipoAgendaPorId } from "@/lib/constants";

function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function AgendaClient() {
  const searchParams = useSearchParams();
  const { agenda, adicionarAgenda, removerAgenda } = useStore();
  const [formAberto, setFormAberto] = useState(searchParams.get("novo") === "1");
  const [referencia, setReferencia] = useState(() => {
    const [ano, mes] = hoje().split("-");
    return { ano: Number(ano), mes: Number(mes) - 1 };
  });
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const eventosPorDia = useMemo(() => {
    const mapa = {};
    for (const e of agenda) {
      (mapa[e.data] ||= []).push(e);
    }
    return mapa;
  }, [agenda]);

  const lembreteAmanha = agenda.filter((e) => e.data === amanha());

  const listados = diaSelecionado
    ? (eventosPorDia[diaSelecionado] || [])
    : agenda.filter((e) => e.data >= hoje()).slice(0, 20);

  function mudarMes(delta) {
    setReferencia((r) => {
      let mes = r.mes + delta;
      let ano = r.ano;
      if (mes < 0) { mes = 11; ano -= 1; }
      if (mes > 11) { mes = 0; ano += 1; }
      return { ano, mes };
    });
    setDiaSelecionado(null);
  }

  const totalDias = diasNoMes(referencia.ano, referencia.mes);
  const primeiroDiaSemana = new Date(referencia.ano, referencia.mes, 1).getDay();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Agenda 📅</h1>
          <p className="text-sm text-muted">Consultas, exames e compromissos, tudo num só lugar.</p>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
          >
            <Plus size={16} /> Novo compromisso
          </button>
        )}
      </header>

      {lembreteAmanha.length > 0 && (
        <Card className="bg-gold-soft border-gold">
          {lembreteAmanha.map((e) => {
            const info = tipoAgendaPorId(e.tipo);
            return (
              <p key={e.id} className="text-sm text-ink">
                <span aria-hidden>{info.emoji}</span> {e.descricao || info.label} amanhã
                {e.horario ? ` às ${e.horario}` : ""}.
              </p>
            );
          })}
        </Card>
      )}

      {formAberto && (
        <FormularioAgenda onFechar={() => setFormAberto(false)} onSalvar={adicionarAgenda} />
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="text-muted">
            <ChevronLeft size={18} />
          </button>
          <p className="font-medium text-ink">
            {NOMES_MES[referencia.mes]} {referencia.ano}
          </p>
          <button onClick={() => mudarMes(1)} aria-label="Próximo mês" className="text-muted">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted mb-1">
          {NOMES_DIA_SEMANA.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`vazio-${i}`} />)}
          {Array.from({ length: totalDias }).map((_, i) => {
            const dia = i + 1;
            const iso = `${referencia.ano}-${String(referencia.mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const temEventos = !!eventosPorDia[iso];
            const selecionado = diaSelecionado === iso;
            const ehHoje = iso === hoje();
            return (
              <button
                key={iso}
                onClick={() => setDiaSelecionado(selecionado ? null : iso)}
                className={`aspect-square rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 ${
                  selecionado
                    ? "bg-burnt text-white"
                    : ehHoje
                      ? "bg-blush-soft text-burnt font-medium"
                      : "text-ink hover:bg-cream"
                }`}
              >
                {dia}
                {temEventos && <span className={`w-1 h-1 rounded-full ${selecionado ? "bg-white" : "bg-burnt"}`} />}
              </button>
            );
          })}
        </div>
      </Card>

      <div>
        <p className="text-sm text-muted mb-3">
          {diaSelecionado ? formatarDataLonga(diaSelecionado) : "Próximos compromissos"}
        </p>
        {listados.length === 0 ? (
          <Card>
            <EmptyState titulo="Nada por aqui" emoji="📅" />
          </Card>
        ) : (
          <div className="space-y-3">
            {listados.map((e) => {
              const info = tipoAgendaPorId(e.tipo);
              return (
                <Card key={e.id} className="!p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden>{info.emoji}</span>
                    <div>
                      <p className="font-medium text-ink">{e.descricao || info.label}</p>
                      <p className="text-xs text-muted">
                        {formatarDataLonga(e.data)}{e.horario ? ` às ${e.horario}` : ""}
                        {e.local ? ` · ${e.local}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removerAgenda(e.id)}
                    aria-label="Remover"
                    className="text-muted hover:text-burnt"
                  >
                    <Trash2 size={16} />
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FormularioAgenda({ onFechar, onSalvar }) {
  const [tipo, setTipo] = useState(TIPOS_AGENDA[0].id);
  const [data, setData] = useState(hoje());
  const [horario, setHorario] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ tipo, data, horario, local, descricao });
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
          <p className="font-medium text-ink">Novo compromisso</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Tipo</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIPOS_AGENDA.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                  tipo === t.id ? "bg-blush-soft border-burnt" : "bg-cream border-transparent"
                }`}
              >
                <span aria-hidden>{t.emoji}</span> {t.label}
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
          <label className="block text-sm text-muted mb-1">Local</label>
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Descrição</label>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
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
