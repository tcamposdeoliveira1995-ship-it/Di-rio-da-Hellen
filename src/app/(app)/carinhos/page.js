"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Heart, Star, Download, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { urlAssinada } from "@/lib/supabase/storage";
import { formatarDataLonga } from "@/lib/date";

const AVATARES = ["🌸", "🦋", "⭐", "😊", "💗", "🌈", "🐱", "🐶"];

export default function CarinhosPage() {
  const {
    criancas,
    carinhos,
    adicionarCrianca,
    atualizarCrianca,
    reagirCarinho,
    favoritarCarinho,
    tornarVisivelCarinho,
    souAdmin,
  } = useStore();
  const [filtro, setFiltro] = useState("todos");
  const [gerenciarAberto, setGerenciarAberto] = useState(criancas.length === 0);
  const [formAberto, setFormAberto] = useState(false);

  // Os carinhos são recadinhos/desenhos endereçados à Hellen — por padrão
  // só ela vê. Quem é "visualizador" só recebe (o próprio banco, via RLS,
  // já filtra isso) os carinhos que ela marcou como visíveis pra família.
  const listados =
    filtro === "todos"
      ? carinhos
      : filtro === "favoritos"
        ? carinhos.filter((c) => c.favorito)
        : carinhos.filter((c) => c.reacao === "amei");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">Carinhos 💌</h1>
        <p className="text-sm text-muted">
          {souAdmin
            ? "Os desenhos e recadinhos que você recebeu no Cantinho da Helô."
            : "Os carinhos que a Hellen escolheu compartilhar com a família."}
        </p>
      </header>

      {souAdmin && (
      <Card
        title="Pessoas autorizadas"
        icon="👪"
        action={
          <button onClick={() => setGerenciarAberto((v) => !v)} className="text-muted">
            {gerenciarAberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        }
      >
        {gerenciarAberto && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Quem estiver aqui consegue abrir{" "}
              <a href="/cantinho" target="_blank" rel="noreferrer" className="underline text-burnt">
                /cantinho
              </a>{" "}
              e mandar carinho pra você — sem senha, sem ver nada do resto do painel.
            </p>

            {criancas.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2">
                <span className="text-2xl">{c.avatar_emoji}</span>
                <p className="flex-1 font-medium text-ink">{c.nome}</p>
                <Toggle
                  label="Ativo"
                  valor={c.ativo}
                  onChange={souAdmin ? (v) => atualizarCrianca(c.id, { ativo: v }) : undefined}
                />
                <Toggle
                  label="Desenhar"
                  valor={c.pode_desenhar}
                  onChange={souAdmin ? (v) => atualizarCrianca(c.id, { pode_desenhar: v }) : undefined}
                />
                <Toggle
                  label="Recado"
                  valor={c.pode_enviar_recado}
                  onChange={souAdmin ? (v) => atualizarCrianca(c.id, { pode_enviar_recado: v }) : undefined}
                />
              </div>
            ))}

            {souAdmin &&
              (formAberto ? (
                <FormularioCrianca
                  onFechar={() => setFormAberto(false)}
                  onSalvar={adicionarCrianca}
                />
              ) : (
                <button
                  onClick={() => setFormAberto(true)}
                  className="flex items-center gap-1.5 text-sm text-burnt"
                >
                  <Plus size={16} /> Adicionar pessoa
                </button>
              ))}
          </div>
        )}
      </Card>
      )}

      <div className="flex gap-2">
        <BotaoFiltro ativo={filtro === "todos"} onClick={() => setFiltro("todos")} label="Todos" />
        <BotaoFiltro ativo={filtro === "favoritos"} onClick={() => setFiltro("favoritos")} label="⭐ Favoritos" />
        <BotaoFiltro ativo={filtro === "amados"} onClick={() => setFiltro("amados")} label="❤️ Amados" />
      </div>

      {listados.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhum carinho por aqui ainda" emoji="💌" />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {listados.map((c) => {
            const autor = criancas.find((cr) => cr.id === c.crianca_id);
            return (
              <CarinhoCard
                key={c.id}
                carinho={c}
                autor={autor}
                onReagir={reagirCarinho}
                onFavoritar={favoritarCarinho}
                onTornarVisivel={tornarVisivelCarinho}
                souAdmin={souAdmin}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, valor, onChange }) {
  return (
    <button
      disabled={!onChange}
      onClick={onChange ? () => onChange(!valor) : undefined}
      className={`text-[11px] rounded-full px-2 py-1 whitespace-nowrap disabled:opacity-70 ${
        valor ? "bg-burnt text-white" : "bg-surface text-muted border border-line"
      }`}
    >
      {label}
    </button>
  );
}

function BotaoFiltro({ ativo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs border whitespace-nowrap ${
        ativo ? "bg-burnt text-white border-burnt" : "bg-surface border-line text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function FormularioCrianca({ onFechar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState(AVATARES[0]);
  const [salvando, setSalvando] = useState(false);

  async function aoSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({ nome, avatar_emoji: avatar, ativo: true, pode_desenhar: true, pode_enviar_recado: true });
      onFechar();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={aoSalvar} className="rounded-xl bg-cream p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Nova pessoa</p>
        <button type="button" onClick={onFechar} aria-label="Fechar">
          <X size={16} className="text-muted" />
        </button>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {AVATARES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAvatar(a)}
            className={`w-9 h-9 rounded-full text-lg flex items-center justify-center ${
              avatar === a ? "bg-blush-soft border border-burnt" : "bg-surface"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <input
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={salvando}
        className="flex items-center gap-2 rounded-xl bg-burnt text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {salvando && <Loader2 size={14} className="animate-spin" />}
        Salvar
      </button>
    </form>
  );
}

function CarinhoCard({ carinho, autor, onReagir, onFavoritar, onTornarVisivel, souAdmin }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!carinho.arquivo_path) return;
    let cancelado = false;
    const supabase = createClient();
    urlAssinada(supabase, carinho.arquivo_path).then((u) => {
      if (!cancelado) setUrl(u);
    });
    return () => {
      cancelado = true;
    };
  }, [carinho.arquivo_path]);

  return (
    <Card className="!p-4">
      {carinho.tipo === "desenho" && url && (
        // eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária.
        <img src={url} alt="Desenho recebido" className="w-full rounded-2xl mb-3 max-h-56 object-cover" />
      )}
      {carinho.mensagem && <p className="text-sm text-ink italic">&ldquo;{carinho.mensagem}&rdquo;</p>}
      <p className="text-xs text-muted mt-2">
        De {autor ? `${autor.avatar_emoji} ${autor.nome}` : "alguém"} · {formatarDataLonga(carinho.created_at?.slice(0, 10))}
      </p>

      <div className="flex items-center gap-2 mt-3">
        {souAdmin ? (
          <>
            <button
              onClick={() => onReagir(carinho.id, carinho.reacao === "amei" ? null : "amei")}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${
                carinho.reacao === "amei" ? "bg-burnt text-white" : "bg-cream text-ink"
              }`}
            >
              <Heart size={14} /> Amei
            </button>
            <button
              onClick={() => onFavoritar(carinho.id, !carinho.favorito)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${
                carinho.favorito ? "bg-gold text-white" : "bg-cream text-ink"
              }`}
            >
              <Star size={14} /> Favorito
            </button>
            <button
              onClick={() => onTornarVisivel(carinho.id, !carinho.visivel_para_familia)}
              title={
                carinho.visivel_para_familia
                  ? "A família visualizadora consegue ver este carinho"
                  : "Só você vê este carinho"
              }
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${
                carinho.visivel_para_familia ? "bg-burnt text-white" : "bg-cream text-ink"
              }`}
            >
              {carinho.visivel_para_familia ? <Eye size={14} /> : <EyeOff size={14} />}
              {carinho.visivel_para_familia ? "Visível pra família" : "Tornar visível"}
            </button>
          </>
        ) : (
          <>
            {carinho.reacao === "amei" && (
              <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs bg-burnt text-white">
                <Heart size={14} /> Amei
              </span>
            )}
            {carinho.favorito && (
              <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs bg-gold text-white">
                <Star size={14} /> Favorito
              </span>
            )}
          </>
        )}
        {url && (
          <a
            href={url}
            download
            className="flex items-center gap-1 rounded-full bg-cream text-ink px-3 py-1.5 text-xs"
          >
            <Download size={14} />
          </a>
        )}
      </div>
    </Card>
  );
}
