"use client";

import Link from "next/link";
import { useMemo } from "react";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import MoodPicker from "@/components/MoodPicker";
import { useStore } from "@/lib/store";
import { diaDaJornada, formatarDataLonga, hoje, ehHojeOuFuturo } from "@/lib/date";
import { FRASES_DO_DIA, tipoAgendaPorId } from "@/lib/constants";

const TIPOS_PROXIMOS_PASSOS = ["consulta", "exame", "tratamento"];

export default function HomePage() {
  const { tratamentoInfo, ciclos, diario, agenda, carinhos, criancas, atualizarHumorHoje, souAdmin, meuPerfil } =
    useStore();
  const primeiroNome = (meuPerfil?.nome || "Hellen").trim().split(" ")[0] || "Hellen";

  const carinhoNaoVisto = carinhos.find((c) => !c.visualizado);
  const autorCarinho = carinhoNaoVisto && criancas.find((c) => c.id === carinhoNaoVisto.crianca_id);

  const frase = useMemo(
    () => FRASES_DO_DIA[new Date().getDate() % FRASES_DO_DIA.length],
    []
  );

  const dataInicioJornada = tratamentoInfo?.jornada_data_inicio || tratamentoInfo?.data_inicio;
  const dia = diaDaJornada(dataInicioJornada);

  const entradaHoje = diario.find((e) => e.data === hoje());

  const proximosPassos = TIPOS_PROXIMOS_PASSOS.map((tipo) => {
    const proximo = agenda
      .filter((e) => e.tipo === tipo && ehHojeOuFuturo(e.data))
      .sort((a, b) => a.data.localeCompare(b.data))[0];
    return { tipo, evento: proximo };
  }).filter((p) => p.evento);

  const cicloAtual =
    ciclos.find((c) => c.status === "em_andamento") ||
    ciclos.find((c) => c.status === "aguardando") ||
    ciclos[ciclos.length - 1];
  const totalCiclos = tratamentoInfo?.quantidade_ciclos || ciclos.length;
  const percentualEtapa = cicloAtual && totalCiclos ? (cicloAtual.numero / totalCiclos) * 100 : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">Olá, {primeiroNome} 💗</h1>
        <p className="text-muted text-sm">
          {souAdmin ? frase : "Acompanhe essa trajetória com a Hellen."}
        </p>
        {dataInicioJornada && (
          <p className="mt-2 inline-block text-xs font-medium text-burnt bg-blush-soft rounded-full px-3 py-1">
            Dia {dia} d{souAdmin ? "a minha" : "a jornada da Hellen"}
          </p>
        )}
      </header>

      {carinhoNaoVisto && (
        <Link href="/carinhos" className="block">
          <Card className="bg-blush-soft border-burnt">
            <p className="text-sm font-medium text-ink">💌 Você recebeu um carinho!</p>
            <p className="text-sm text-muted mt-0.5">
              {autorCarinho ? `${autorCarinho.nome} fez` : "Alguém fez"}{" "}
              {carinhoNaoVisto.tipo === "desenho" ? "um desenho" : "um recadinho"} pra você 🎨
            </p>
          </Card>
        </Link>
      )}

      <Card title="Hoje" icon="🌻">
        <p className="text-sm text-muted mb-3">{formatarDataLonga(hoje())}</p>
        <p className="text-sm text-ink mb-2">Como estou hoje?</p>
        <MoodPicker valor={entradaHoje?.humor} onChange={souAdmin ? atualizarHumorHoje : undefined} size="lg" />
      </Card>

      {proximosPassos.length > 0 && (
        <Card title="Próximos passos" icon="🗓">
          <div className="grid gap-3 sm:grid-cols-3">
            {proximosPassos.map(({ tipo, evento }) => {
              const info = tipoAgendaPorId(tipo);
              return (
                <div key={tipo} className="rounded-2xl bg-cream px-4 py-3">
                  <p className="text-sm text-muted flex items-center gap-1.5">
                    <span aria-hidden>{info.emoji}</span>
                    Próxima {info.label.toLowerCase()}
                  </p>
                  <p className="font-medium text-ink">{formatarDataLonga(evento.data)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {cicloAtual && (
        <Card title="Status do tratamento" icon="💊">
          <p className="text-sm text-muted mb-1">{tratamentoInfo?.nome || "Tratamento atual"}</p>
          <p className="font-medium text-ink mb-3">
            Ciclo {cicloAtual.numero} de {totalCiclos}
          </p>
          <ProgressBar percentual={percentualEtapa} />
          <p className="text-xs text-muted mt-2">
            {Math.round(percentualEtapa)}% da etapa concluída
          </p>
        </Card>
      )}

      {souAdmin && (
        <Card title="Atalhos rápidos" icon="✨">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Atalho href="/diario/novo" emoji="📖" label="Registrar meu dia" />
            <Atalho href="/tratamento?novo=1" emoji="💊" label="Registrar tratamento" />
            <Atalho href="/sintomas?novo=1" emoji="🩺" label="Registrar sintomas" />
            <Atalho href="/exames?novo=1" emoji="🧪" label="Adicionar exame" />
          </div>
        </Card>
      )}
    </div>
  );
}

function Atalho({ href, emoji, label }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream px-3 py-4 text-center hover:bg-blush-soft transition-colors"
    >
      <span className="text-2xl" aria-hidden>{emoji}</span>
      <span className="text-xs text-ink">{label}</span>
    </Link>
  );
}
