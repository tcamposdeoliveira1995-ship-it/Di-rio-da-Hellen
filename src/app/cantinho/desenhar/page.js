"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Redo2, Trash2, Pencil, Brush, Eraser, Type, Camera, Loader2 } from "lucide-react";
import { lerCriancaSelecionada, CORES_PAINT, TAMANHOS, CARIMBOS } from "@/lib/cantinho";
import PerfilAtivo from "@/components/cantinho/PerfilAtivo";

const LARGURA = 900;
const ALTURA = 1200;

export default function DesenharPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const desenhandoRef = useRef(false);
  const ultimoPontoRef = useRef(null);
  const inputFotoRef = useRef(null);

  const [crianca, setCrianca] = useState(null);
  const [ferramenta, setFerramenta] = useState("pincel"); // lapis | pincel | borracha | carimbo | texto
  const [cor, setCor] = useState(CORES_PAINT[0]);
  const [tamanho, setTamanho] = useState(TAMANHOS[1]);
  const [carimbo, setCarimbo] = useState(CARIMBOS[0]);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);

  // Histórico do desfazer/refazer vive em refs (não em state) porque é
  // escrito de dentro dos handlers de ponteiro, onde ler um state por
  // closure poderia pegar um valor antigo. versaoHistorico só existe
  // pra forçar um re-render toda vez que o histórico muda (assim os
  // botões de desfazer/refazer atualizam o estado de "desabilitado").
  const historicoRef = useRef([]);
  const indiceHistoricoRef = useRef(-1);
  const [, setVersaoHistorico] = useState(0);

  const [etapa, setEtapa] = useState("desenhando"); // desenhando | pre-visualizacao | enviado
  const [imagemFinal, setImagemFinal] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const c = lerCriancaSelecionada();
    if (!c) {
      router.replace("/cantinho");
      return;
    }
    // queueMicrotask só pra não chamar setState direto e sincronamente
    // no corpo do efeito (lint) — o valor já foi lido do localStorage
    // de forma síncrona acima.
    queueMicrotask(() => setCrianca(c));
  }, [router]);

  // Prepara o canvas (fundo branco) — depende de "crianca" (não é []),
  // porque enquanto ela ainda não foi lida do localStorage a página
  // retorna null mais abaixo e o <canvas> nem existe no DOM. Só quando
  // "crianca" vira um objeto de verdade é que o canvas monta, e é
  // exatamente aí que este efeito precisa rodar.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    ctxRef.current = ctx;
    salvarNoHistorico(canvas);
  }, [crianca]);

  function salvarNoHistorico(canvas) {
    const url = canvas.toDataURL("image/png");
    historicoRef.current = [...historicoRef.current.slice(0, indiceHistoricoRef.current + 1), url];
    indiceHistoricoRef.current = historicoRef.current.length - 1;
    setVersaoHistorico((v) => v + 1);
  }

  function pontoDoEvento(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * LARGURA,
      y: ((e.clientY - rect.top) / rect.height) * ALTURA,
    };
  }

  function aoPressionar(e) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const ponto = pontoDoEvento(e);

    if (ferramenta === "carimbo") {
      ctx.font = `${tamanho.carimbo}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(carimbo, ponto.x, ponto.y);
      salvarNoHistorico(canvasRef.current);
      return;
    }

    if (ferramenta === "texto") {
      const texto = window.prompt("O que você quer escrever?");
      if (texto) {
        ctx.font = `bold ${tamanho.texto}px sans-serif`;
        ctx.fillStyle = cor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(texto, ponto.x, ponto.y);
        salvarNoHistorico(canvasRef.current);
      }
      return;
    }

    desenhandoRef.current = true;
    ultimoPontoRef.current = ponto;
  }

  function aoMover(e) {
    if (!desenhandoRef.current) return;
    const ctx = ctxRef.current;
    const ponto = pontoDoEvento(e);
    const anterior = ultimoPontoRef.current;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = tamanho.traco * (ferramenta === "borracha" ? 2.2 : 1);

    if (ferramenta === "borracha") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = cor;
    }

    ctx.beginPath();
    ctx.moveTo(anterior.x, anterior.y);
    ctx.lineTo(ponto.x, ponto.y);
    ctx.stroke();

    ultimoPontoRef.current = ponto;
  }

  function aoSoltar() {
    if (!desenhandoRef.current) return;
    desenhandoRef.current = false;
    salvarNoHistorico(canvasRef.current);
  }

  function redesenhar(url) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, LARGURA, ALTURA);
      ctx.drawImage(img, 0, 0, LARGURA, ALTURA);
    };
    img.src = url;
  }

  function desfazer() {
    if (indiceHistoricoRef.current <= 0) return;
    indiceHistoricoRef.current -= 1;
    redesenhar(historicoRef.current[indiceHistoricoRef.current]);
    setVersaoHistorico((v) => v + 1);
  }

  function refazer() {
    if (indiceHistoricoRef.current >= historicoRef.current.length - 1) return;
    indiceHistoricoRef.current += 1;
    redesenhar(historicoRef.current[indiceHistoricoRef.current]);
    setVersaoHistorico((v) => v + 1);
  }

  function limparDeVerdade() {
    const ctx = ctxRef.current;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    salvarNoHistorico(canvasRef.current);
    setConfirmarLimpar(false);
  }

  function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    const img = new window.Image();
    img.onload = () => {
      const ctx = ctxRef.current;
      // "cover": preenche o canvas todo sem distorcer a foto.
      const escala = Math.max(LARGURA / img.width, ALTURA / img.height);
      const w = img.width * escala;
      const h = img.height * escala;
      ctx.drawImage(img, (LARGURA - w) / 2, (ALTURA - h) / 2, w, h);
      salvarNoHistorico(canvasRef.current);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function terminar() {
    setImagemFinal(canvasRef.current.toDataURL("image/png"));
    setEtapa("pre-visualizacao");
  }

  async function enviar() {
    if (!crianca) return;
    setErro("");
    setEnviando(true);
    try {
      const blob = await (await fetch(imagemFinal)).blob();
      const formData = new FormData();
      formData.append("crianca_id", crianca.id);
      formData.append("tipo", "desenho");
      formData.append("mensagem", mensagem);
      formData.append("imagem", blob, "desenho.png");

      const resposta = await fetch("/api/cantinho/enviar", { method: "POST", body: formData });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        throw new Error(corpo?.error || "Não consegui enviar. Tenta de novo?");
      }
      setEtapa("enviado");
    } catch (err) {
      setErro(err.message || "Não consegui enviar. Tenta de novo?");
    } finally {
      setEnviando(false);
    }
  }

  function fazerOutro() {
    limparDeVerdade();
    setMensagem("");
    setImagemFinal(null);
    setEtapa("desenhando");
  }

  if (!crianca) return null;

  if (etapa === "enviado") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-6xl">💗🌸⭐✨🌈</p>
        <h1 className="text-2xl font-bold">Carinho enviado!</h1>
        <p className="opacity-80">Seu desenho foi enviado para a Hellen!</p>
        <button
          onClick={fazerOutro}
          className="mt-6 rounded-full px-6 py-3 font-bold shadow-md"
          style={{ background: "var(--helo-rosa)" }}
        >
          🎨 Fazer outro desenho
        </button>
      </div>
    );
  }

  if (etapa === "pre-visualizacao") {
    return (
      <div className="min-h-screen flex flex-col items-center px-6 py-8 text-center gap-4">
        <h1 className="text-xl font-bold">Seu desenho ficou pronto! 🎨</h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização local (data URL), não é imagem remota. */}
        <img src={imagemFinal} alt="Seu desenho" className="w-full max-w-sm rounded-2xl shadow-md border-4 border-white" />

        <p className="mt-2">Quer escrever alguma coisa para a Hellen?</p>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          placeholder="Meu recadinho..."
          className="w-full max-w-sm rounded-2xl p-3 border-2"
          style={{ borderColor: "var(--helo-lilas)", background: "var(--helo-surface)" }}
        />

        <p className="text-sm opacity-70">
          Feito com amor por: <strong>{crianca.nome} 💗</strong>
        </p>

        {erro && <p className="text-sm font-medium" style={{ color: "#c0392b" }}>{erro}</p>}

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setEtapa("desenhando")}
            className="rounded-full px-5 py-3 font-bold shadow-md"
            style={{ background: "var(--helo-surface)" }}
          >
            ✏️ Voltar
          </button>
          <button
            onClick={enviar}
            disabled={enviando}
            className="flex items-center gap-2 rounded-full px-6 py-3 font-bold shadow-md disabled:opacity-60"
            style={{ background: "var(--helo-rosa)" }}
          >
            {enviando && <Loader2 size={18} className="animate-spin" />}
            💗 Enviar para a Hellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PerfilAtivo crianca={crianca} posicao="top-14" />
      <header className="flex items-center justify-between gap-2 px-3 py-2 shrink-0" style={{ background: "var(--helo-surface)" }}>
        <div className="flex items-center gap-1">
          <BotaoIcone onClick={desfazer} disabled={indiceHistoricoRef.current <= 0} aria-label="Desfazer">
            <Undo2 size={22} />
          </BotaoIcone>
          <BotaoIcone
            onClick={refazer}
            disabled={indiceHistoricoRef.current >= historicoRef.current.length - 1}
            aria-label="Refazer"
          >
            <Redo2 size={22} />
          </BotaoIcone>
          <BotaoIcone onClick={() => setConfirmarLimpar(true)} aria-label="Limpar desenho">
            <Trash2 size={22} />
          </BotaoIcone>
        </div>
        <button
          onClick={terminar}
          className="rounded-full px-4 py-2 font-bold text-sm shadow-md"
          style={{ background: "var(--helo-rosa)" }}
        >
          💗 Terminei!
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        <canvas
          ref={canvasRef}
          width={LARGURA}
          height={ALTURA}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerLeave={aoSoltar}
          className="max-h-full max-w-full rounded-2xl shadow-md touch-none bg-white"
          style={{ aspectRatio: `${LARGURA}/${ALTURA}` }}
        />
      </div>

      {/* Altura fixa nas duas fileiras abaixo (h-11), mesmo quando o
          conteúdo muda entre ferramentas — sem isso, trocar de
          ferramenta muda a altura da barra e o <canvas> "pula" de
          tamanho na tela (péssimo pra uma criança desenhar). */}
      <div className="shrink-0 px-3 py-2 space-y-2" style={{ background: "var(--helo-surface)" }}>
        <div className="h-11 flex items-center">
          {(ferramenta === "lapis" || ferramenta === "pincel" || ferramenta === "texto") && (
            <div className="flex gap-2 overflow-x-auto w-full">
              {CORES_PAINT.map((c) => (
                <button
                  key={c}
                  onClick={() => setCor(c)}
                  aria-label={`Cor ${c}`}
                  className="w-8 h-8 rounded-full shrink-0 border-2"
                  style={{
                    background: c,
                    borderColor: cor === c ? "var(--helo-ink)" : "rgba(0,0,0,0.15)",
                    boxShadow: cor === c ? "0 0 0 2px var(--helo-bg)" : "none",
                  }}
                />
              ))}
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-8 h-8 rounded-full shrink-0"
                aria-label="Mais cores"
              />
            </div>
          )}

          {ferramenta === "carimbo" && (
            <div className="flex gap-2 overflow-x-auto w-full">
              {CARIMBOS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCarimbo(c)}
                  className="text-2xl w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
                  style={{ background: carimbo === c ? "var(--helo-amarelo)" : "transparent" }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {ferramenta === "borracha" && (
            <p className="text-xs opacity-60 w-full text-center">Arraste no desenho para apagar</p>
          )}
        </div>

        <div className="h-9 flex items-center gap-2">
          {ferramenta !== "texto" &&
            TAMANHOS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTamanho(t)}
                className="flex-1 h-full rounded-xl text-xs font-medium"
                style={{ background: tamanho.id === t.id ? "var(--helo-lilas)" : "var(--helo-bg)" }}
              >
                {t.label}
              </button>
            ))}
        </div>

        <div className="flex gap-1.5 justify-between">
          <FerramentaBotao ativo={ferramenta === "lapis"} onClick={() => setFerramenta("lapis")} label="Lápis">
            <Pencil size={20} />
          </FerramentaBotao>
          <FerramentaBotao ativo={ferramenta === "pincel"} onClick={() => setFerramenta("pincel")} label="Pincel">
            <Brush size={20} />
          </FerramentaBotao>
          <FerramentaBotao ativo={ferramenta === "borracha"} onClick={() => setFerramenta("borracha")} label="Borracha">
            <Eraser size={20} />
          </FerramentaBotao>
          <FerramentaBotao ativo={ferramenta === "carimbo"} onClick={() => setFerramenta("carimbo")} label="Carimbo">
            <span className="text-lg">💖</span>
          </FerramentaBotao>
          <FerramentaBotao ativo={ferramenta === "texto"} onClick={() => setFerramenta("texto")} label="Escrever">
            <Type size={20} />
          </FerramentaBotao>
          <FerramentaBotao onClick={() => inputFotoRef.current?.click()} label="Foto">
            <Camera size={20} />
          </FerramentaBotao>
        </div>
        <input ref={inputFotoRef} type="file" accept="image/*" onChange={aoEscolherFoto} className="hidden" />
      </div>

      {confirmarLimpar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="rounded-3xl p-6 max-w-xs text-center shadow-lg" style={{ background: "var(--helo-surface)" }}>
            <p className="font-bold mb-4">Tem certeza que quer apagar todo o desenho?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmarLimpar(false)}
                className="rounded-full px-4 py-2 font-medium"
                style={{ background: "var(--helo-bg)" }}
              >
                Não
              </button>
              <button
                onClick={limparDeVerdade}
                className="rounded-full px-4 py-2 font-bold"
                style={{ background: "var(--helo-rosa)" }}
              >
                Sim, limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BotaoIcone({ children, disabled, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-full disabled:opacity-30"
      style={{ color: "var(--helo-ink)" }}
      {...props}
    >
      {children}
    </button>
  );
}

function FerramentaBotao({ children, ativo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-1.5"
      style={{ background: ativo ? "var(--helo-lilas)" : "transparent", color: "var(--helo-ink)" }}
    >
      {children}
      <span className="text-[9px]">{label}</span>
    </button>
  );
}
