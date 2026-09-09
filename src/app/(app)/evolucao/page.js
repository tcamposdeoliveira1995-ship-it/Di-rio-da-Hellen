"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import StatTile from "@/components/StatTile";
import SeletorPeriodo from "@/components/SeletorPeriodo";
import LinhaChart from "@/components/charts/LinhaChart";
import BarrasChart from "@/components/charts/BarrasChart";
import { useStore } from "@/lib/store";
import { calcularIntervalo, filtrarPorPeriodo } from "@/lib/periodo";
import { formatarData } from "@/lib/date";
import { humorParaNumero, SINTOMAS_DISPONIVEIS } from "@/lib/constants";

export default function EvolucaoPage() {
  const { diario, sintomas } = useStore();
  const [periodo, setPeriodo] = useState({ tipo: "preset", dias: 30 });
  // Memoizado pra ter identidade estável — senão calcularIntervalo(periodo)
  // criaria um objeto novo a cada render e invalidaria os useMemo abaixo
  // sempre, mesmo sem o período ter mudado de fato.
  const intervalo = useMemo(() => calcularIntervalo(periodo), [periodo]);

  const diarioPeriodo = useMemo(
    () => filtrarPorPeriodo(diario, intervalo).sort((a, b) => a.data.localeCompare(b.data)),
    [diario, intervalo]
  );
  const sintomasPeriodo = useMemo(
    () => filtrarPorPeriodo(sintomas, intervalo),
    [sintomas, intervalo]
  );

  const pontosHumor = diarioPeriodo.map((e) => ({
    rotulo: formatarData(e.data, { day: "2-digit", month: "2-digit" }),
    valor: humorParaNumero(e.humor),
  }));
  const pontosEnergia = diarioPeriodo.map((e) => ({
    rotulo: formatarData(e.data, { day: "2-digit", month: "2-digit" }),
    valor: e.energia ?? null,
  }));

  const contagemSintomas = {};
  for (const s of sintomasPeriodo) {
    contagemSintomas[s.sintoma] = (contagemSintomas[s.sintoma] || 0) + 1;
  }
  const barrasSintomas = SINTOMAS_DISPONIVEIS
    .map((s) => ({ rotulo: s.label, emoji: s.emoji, valor: contagemSintomas[s.id] || 0 }))
    .filter((b) => b.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const sonoRegistros = sintomasPeriodo.filter((s) => s.sintoma === "alteracaoSono");
  const apetiteRegistros = sintomasPeriodo.filter((s) => s.sintoma === "faltaApetite");
  const diasBons = diarioPeriodo.filter((e) => e.humor === "bem" || e.humor === "indo").length;

  function mediaIntensidade(lista) {
    if (lista.length === 0) return null;
    const soma = lista.reduce((acc, s) => acc + (s.intensidade || 0), 0);
    return (soma / lista.length).toFixed(1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">Minha Evolução 📈</h1>
        <p className="text-sm text-muted">Como as coisas mudaram ao longo do tempo.</p>
      </header>

      <SeletorPeriodo onMudar={setPeriodo} />

      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile
          emoji="😊"
          label="Dias bons"
          valor={diasBons}
          detalhe={`de ${diarioPeriodo.length} dias registrados`}
        />
        <StatTile
          emoji="😴"
          label="Alteração no sono"
          valor={sonoRegistros.length}
          detalhe={sonoRegistros.length ? `intensidade média ${mediaIntensidade(sonoRegistros)}` : "nenhum registro"}
        />
        <StatTile
          emoji="🍽"
          label="Falta de apetite"
          valor={apetiteRegistros.length}
          detalhe={apetiteRegistros.length ? `intensidade média ${mediaIntensidade(apetiteRegistros)}` : "nenhum registro"}
        />
      </div>

      <Card title="Humor" icon="🌻">
        <LinhaChart
          pontos={pontosHumor}
          cor="var(--chart-humor)"
          formatarValor={(v) => "★".repeat(Math.round(v))}
        />
      </Card>

      <Card title="Energia" icon="⚡">
        <LinhaChart pontos={pontosEnergia} cor="var(--chart-energia)" formatarValor={(v) => `${v}/5`} />
      </Card>

      <Card title="Sintomas no período" icon="🩺">
        <BarrasChart barras={barrasSintomas} cor="var(--chart-sintomas)" />
      </Card>
    </div>
  );
}
