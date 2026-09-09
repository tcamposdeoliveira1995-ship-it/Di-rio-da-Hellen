"use client";

// Gráfico de linha simples (uma série só) com crosshair + tooltip no
// hover, seguindo as specs de marca da skill de dataviz: traço de 2px,
// pontas arredondadas, grid recessivo, sem legenda (série única).
import { useRef, useState } from "react";

const LARGURA = 600;
const ALTURA = 180;
const MARGEM = { topo: 16, baixo: 24, esquerda: 8, direita: 8 };

export default function LinhaChart({ pontos, cor, formatarValor = (v) => v, formatarRotulo = (p) => p.rotulo }) {
  const svgRef = useRef(null);
  const [indiceHover, setIndiceHover] = useState(null);

  const validos = pontos.filter((p) => p.valor !== null && p.valor !== undefined);
  if (validos.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">Sem dados suficientes neste período.</p>;
  }

  const valores = validos.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const faixa = max - min || 1;

  const areaLargura = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const areaAltura = ALTURA - MARGEM.topo - MARGEM.baixo;
  const passo = pontos.length > 1 ? areaLargura / (pontos.length - 1) : 0;

  function coordenadas(i, valor) {
    const x = MARGEM.esquerda + passo * i;
    const y = MARGEM.topo + areaAltura - ((valor - min) / faixa) * areaAltura;
    return [x, y];
  }

  const segmentos = [];
  let atual = [];
  pontos.forEach((p, i) => {
    if (p.valor === null || p.valor === undefined) {
      if (atual.length) segmentos.push(atual);
      atual = [];
      return;
    }
    atual.push(coordenadas(i, p.valor));
  });
  if (atual.length) segmentos.push(atual);

  function aoMoverMouse(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const xRelativo = ((e.clientX - rect.left) / rect.width) * LARGURA;
    const indice = passo ? Math.round((xRelativo - MARGEM.esquerda) / passo) : 0;
    setIndiceHover(Math.min(Math.max(indice, 0), pontos.length - 1));
  }

  const pontoHover = indiceHover !== null ? pontos[indiceHover] : null;
  const temValorHover = pontoHover && pontoHover.valor !== null && pontoHover.valor !== undefined;
  const [xHover, yHover] = temValorHover ? coordenadas(indiceHover, pontoHover.valor) : [null, null];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="none"
        className="w-full h-44 touch-none"
        onMouseMove={aoMoverMouse}
        onMouseLeave={() => setIndiceHover(null)}
      >
        {/* grid recessivo */}
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={MARGEM.esquerda}
            x2={LARGURA - MARGEM.direita}
            y1={MARGEM.topo + areaAltura * f}
            y2={MARGEM.topo + areaAltura * f}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}

        {segmentos.map((seg, i) => (
          <polyline
            key={i}
            points={seg.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke={cor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {validos.map((p, i) => {
          const indiceReal = pontos.indexOf(p);
          const [x, y] = coordenadas(indiceReal, p.valor);
          return <circle key={i} cx={x} cy={y} r="2.5" fill={cor} />;
        })}

        {temValorHover && (
          <>
            <line x1={xHover} x2={xHover} y1={MARGEM.topo} y2={MARGEM.topo + areaAltura} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={xHover} cy={yHover} r="4" fill={cor} stroke="var(--surface)" strokeWidth="2" />
          </>
        )}
      </svg>

      {temValorHover && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-ink text-white text-xs rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap"
          style={{ left: `${(xHover / LARGURA) * 100}%`, top: `${(yHover / ALTURA) * 100}%` }}
        >
          {formatarRotulo(pontoHover)}: {formatarValor(pontoHover.valor)}
        </div>
      )}

      <div className="flex justify-between text-xs text-muted mt-1 px-1">
        <span>{formatarRotulo(pontos[0])}</span>
        <span>{formatarRotulo(pontos[pontos.length - 1])}</span>
      </div>
    </div>
  );
}
