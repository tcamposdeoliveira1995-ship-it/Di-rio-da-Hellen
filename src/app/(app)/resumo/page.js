"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SeletorPeriodo from "@/components/SeletorPeriodo";
import { useStore } from "@/lib/store";
import { calcularIntervalo, filtrarPorPeriodo, dentroDoIntervalo } from "@/lib/periodo";
import { formatarDataLonga } from "@/lib/date";
import { humorParaNumero, HUMORES, SINTOMAS_DISPONIVEIS, statusCicloPorId } from "@/lib/constants";

export default function ResumoPage() {
  const { diario, sintomas, ciclos, duvidas, tratamentoInfo } = useStore();
  const [periodo, setPeriodo] = useState({ tipo: "preset", dias: 7 });
  // Memoizado pra ter identidade estável entre renders (ver comentário
  // equivalente em evolucao/page.js).
  const intervalo = useMemo(() => calcularIntervalo(periodo), [periodo]);

  const diarioPeriodo = useMemo(
    () => filtrarPorPeriodo(diario, intervalo).sort((a, b) => b.data.localeCompare(a.data)),
    [diario, intervalo]
  );
  const sintomasPeriodo = useMemo(
    () => filtrarPorPeriodo(sintomas, intervalo),
    [sintomas, intervalo]
  );
  const ciclosPeriodo = useMemo(
    () => (ciclos || []).filter((c) => c.data && dentroDoIntervalo(c.data, intervalo)),
    [ciclos, intervalo]
  );
  const duvidasAbertas = (duvidas || []).filter((d) => d.status !== "respondida");

  const humores = diarioPeriodo.map((e) => humorParaNumero(e.humor)).filter((v) => v !== null);
  const humorMedio = humores.length ? humores.reduce((a, b) => a + b, 0) / humores.length : null;
  const humorMedioLabel = humorMedio ? HUMORES[HUMORES.length - Math.round(humorMedio)]?.label : "sem registros";

  const energias = diarioPeriodo.map((e) => e.energia).filter((v) => v != null);
  const energiaMedia = energias.length ? (energias.reduce((a, b) => a + b, 0) / energias.length).toFixed(1) : null;

  const sonoRegistros = sintomasPeriodo.filter((s) => s.sintoma === "alteracaoSono");
  const apetiteRegistros = sintomasPeriodo.filter((s) => s.sintoma === "faltaApetite");

  const porSintoma = {};
  for (const s of sintomasPeriodo) {
    if (!porSintoma[s.sintoma]) porSintoma[s.sintoma] = [];
    porSintoma[s.sintoma].push(s);
  }
  const linhasSintomas = Object.entries(porSintoma).map(([id, lista]) => {
    const info = SINTOMAS_DISPONIVEIS.find((x) => x.id === id);
    const media = lista.reduce((acc, s) => acc + (s.intensidade || 0), 0) / lista.length;
    const ultimo = lista.map((s) => s.data).sort().at(-1);
    return { info, frequencia: lista.length, mediaIntensidade: media.toFixed(1), ultimo };
  });

  const medicamentos = [
    ...new Set(ciclosPeriodo.map((c) => c.medicamentos).filter(Boolean)),
  ];

  const observacoesDiario = diarioPeriodo.filter((e) => e.texto || e.algo_bom || e.dificuldade);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3 no-print">
        <div>
          <h1 className="font-display text-2xl text-ink">Resumo para Consulta 🩺📋</h1>
          <p className="text-sm text-muted">Tudo organizado pra levar (ou mostrar) na próxima consulta.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-full bg-burnt text-white text-sm px-4 py-2 hover:opacity-90"
        >
          <Printer size={16} /> Imprimir / Salvar PDF
        </button>
      </header>

      <div className="no-print">
        <SeletorPeriodo onMudar={setPeriodo} />
      </div>

      <div className="hidden print:block mb-2">
        <p className="font-display text-xl">Resumo para Consulta — Diário da Hellen 🌻</p>
        <p className="text-sm text-muted">
          Período: {formatarDataLonga(intervalo.inicio)} até {formatarDataLonga(intervalo.fim)}
        </p>
        {tratamentoInfo?.nome && <p className="text-sm text-muted">{tratamentoInfo.nome}</p>}
      </div>

      <Card title="Estado geral" icon="🌻">
        <dl className="grid sm:grid-cols-4 gap-3 text-sm">
          <Info label="Humor médio" valor={humorMedio ? `${humorMedioLabel}` : "sem registros"} />
          <Info label="Energia média" valor={energiaMedia ? `${energiaMedia}/5` : "sem registros"} />
          <Info label="Sono" valor={sonoRegistros.length ? `${sonoRegistros.length} registro(s)` : "sem alterações registradas"} />
          <Info label="Apetite" valor={apetiteRegistros.length ? `${apetiteRegistros.length} registro(s)` : "sem alterações registradas"} />
        </dl>
      </Card>

      <Card title="Sintomas registrados" icon="🩺">
        {linhasSintomas.length === 0 ? (
          <EmptyState titulo="Nenhum sintoma no período" emoji="🩺" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-line">
                  <th className="py-2 pr-4">Sintoma</th>
                  <th className="py-2 pr-4">Frequência</th>
                  <th className="py-2 pr-4">Intensidade média</th>
                  <th className="py-2">Último registro</th>
                </tr>
              </thead>
              <tbody>
                {linhasSintomas.map((l) => (
                  <tr key={l.info?.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4">{l.info?.emoji} {l.info?.label}</td>
                    <td className="py-2 pr-4">{l.frequencia}x</td>
                    <td className="py-2 pr-4">{l.mediaIntensidade}</td>
                    <td className="py-2">{formatarDataLonga(l.ultimo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Tratamentos realizados no período" icon="💊">
        {ciclosPeriodo.length === 0 ? (
          <EmptyState titulo="Nenhum ciclo neste período" emoji="💊" />
        ) : (
          <ul className="space-y-2 text-sm">
            {ciclosPeriodo.map((c) => {
              const status = statusCicloPorId(c.status);
              return (
                <li key={c.id}>
                  <span aria-hidden>{status.emoji}</span> Ciclo {c.numero} — {formatarDataLonga(c.data)}
                  {c.observacoes && <span className="text-muted"> — {c.observacoes}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Medicamentos registrados" icon="💊">
        {medicamentos.length === 0 ? (
          <EmptyState titulo="Nenhum medicamento informado no período" emoji="💊" />
        ) : (
          <ul className="list-disc list-inside text-sm space-y-1">
            {medicamentos.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
      </Card>

      <Card title="Dúvidas abertas" icon="❓">
        {duvidasAbertas.length === 0 ? (
          <EmptyState titulo="Nenhuma dúvida em aberto" emoji="❓" />
        ) : (
          <ul className="space-y-1 text-sm list-disc list-inside">
            {duvidasAbertas.map((d) => <li key={d.id}>{d.pergunta}</li>)}
          </ul>
        )}
      </Card>

      <Card title="Diário — principais observações" icon="📖">
        {observacoesDiario.length === 0 ? (
          <EmptyState titulo="Nenhuma observação no período" emoji="📖" />
        ) : (
          <ul className="space-y-3 text-sm">
            {observacoesDiario.map((e) => (
              <li key={e.id}>
                <p className="text-muted text-xs">{formatarDataLonga(e.data)}</p>
                {e.texto && <p>{e.texto}</p>}
                {e.algo_bom && <p className="text-muted">🌟 {e.algo_bom}</p>}
                {e.dificuldade && <p className="text-muted">💭 {e.dificuldade}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Info({ label, valor }) {
  return (
    <div>
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="text-ink font-medium">{valor}</dd>
    </div>
  );
}
