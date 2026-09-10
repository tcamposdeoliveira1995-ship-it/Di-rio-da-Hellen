"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import MoodPicker from "@/components/MoodPicker";
import CampoFotos from "@/components/CampoFotos";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";

export default function DiarioNovoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get("data") || hoje();

  const { diario, salvarDiario, souAdmin } = useStore();
  const entradaExistente = diario.find((e) => e.data === data);

  const [humor, setHumor] = useState(entradaExistente?.humor || null);
  const [energia, setEnergia] = useState(entradaExistente?.energia || null);
  const [texto, setTexto] = useState(entradaExistente?.texto || "");
  const [algoBom, setAlgoBom] = useState(entradaExistente?.algo_bom || "");
  const [dificuldade, setDificuldade] = useState(entradaExistente?.dificuldade || "");
  const [queroLembrar, setQueroLembrar] = useState(entradaExistente?.quero_lembrar || "");
  const [fotosExistentes, setFotosExistentes] = useState(
    entradaExistente?.fotos_paths?.length
      ? entradaExistente.fotos_paths
      : entradaExistente?.foto_path
        ? [entradaExistente.foto_path]
        : []
  );
  const [fotosNovas, setFotosNovas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [restaurado, setRestaurado] = useState(false);

  const rascunhoKey = `diario-rascunho-${data}`;

  // Rascunho local: o celular às vezes recarrega a página sozinho quando a
  // câmera abre (principalmente com pouca memória) — o que já derrubou um
  // texto inteiro que a Hellen tinha escrito. Pra isso não acontecer de
  // novo, o texto vai sendo salvo no aparelho enquanto ela digita, e volta
  // sozinho se a página recarregar ou se ela sair sem querer.
  useEffect(() => {
    let raw;
    try {
      raw = window.localStorage.getItem(rascunhoKey);
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const rascunho = JSON.parse(raw);
      queueMicrotask(() => {
        if (rascunho.humor !== undefined) setHumor(rascunho.humor);
        if (rascunho.energia !== undefined) setEnergia(rascunho.energia);
        if (rascunho.texto !== undefined) setTexto(rascunho.texto);
        if (rascunho.algoBom !== undefined) setAlgoBom(rascunho.algoBom);
        if (rascunho.dificuldade !== undefined) setDificuldade(rascunho.dificuldade);
        if (rascunho.queroLembrar !== undefined) setQueroLembrar(rascunho.queroLembrar);
        setRestaurado(true);
      });
    } catch {
      // rascunho corrompido — ignora e segue com o que já veio do banco
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quer rodar uma vez, ao montar, pra restaurar o rascunho
  }, []);

  useEffect(() => {
    const temConteudo = texto || algoBom || dificuldade || queroLembrar || humor || energia;
    const t = setTimeout(() => {
      try {
        if (temConteudo) {
          window.localStorage.setItem(
            rascunhoKey,
            JSON.stringify({ humor, energia, texto, algoBom, dificuldade, queroLembrar })
          );
        } else {
          window.localStorage.removeItem(rascunhoKey);
        }
      } catch {
        // localStorage indisponível (modo privado, por exemplo) — sem rascunho, sem drama
      }
    }, 400);
    return () => clearTimeout(t);
  }, [rascunhoKey, humor, energia, texto, algoBom, dificuldade, queroLembrar]);

  if (!souAdmin) {
    return (
      <Card>
        <EmptyState emoji="🔒" titulo="Só a Hellen registra o diário" descricao="Você pode ver tudo, mas não editar." />
      </Card>
    );
  }

  async function aoSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await salvarDiario(
        {
          data,
          humor,
          energia,
          texto,
          algo_bom: algoBom,
          dificuldade,
          quero_lembrar: queroLembrar,
        },
        fotosNovas,
        fotosExistentes
      );
      try {
        window.localStorage.removeItem(rascunhoKey);
      } catch {
        // sem problema — o pior caso é um rascunho velho e vazio sobrando
      }
      router.push("/diario");
    } catch (err) {
      setErro(err.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <h1 className="font-display text-2xl text-ink">
          {entradaExistente ? "Editar meu dia" : "Registrar meu dia"} 📖
        </h1>
        <p className="text-sm text-muted">{formatarDataLonga(data)}</p>
      </header>

      {restaurado && (
        <p className="text-sm text-leaf bg-leaf-soft rounded-xl px-3 py-2">
          🌱 Recuperamos o que você tinha escrito antes da página recarregar.
        </p>
      )}

      <Card>
        <form onSubmit={aoSalvar} className="space-y-5">
          <div>
            <p className="text-sm text-ink mb-2">Como estou hoje?</p>
            <MoodPicker valor={humor} onChange={setHumor} />
          </div>

          <div>
            <p className="text-sm text-ink mb-2">Minha energia hoje</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergia(n)}
                  className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${
                    energia === n
                      ? "bg-burnt text-white border-burnt"
                      : "bg-cream border-line text-ink hover:border-burnt"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Campo label="Como foi meu dia?" valor={texto} onChange={setTexto} linhas={4} />
          <Campo label="Algo bom aconteceu hoje? (opcional)" valor={algoBom} onChange={setAlgoBom} />
          <Campo label="O que foi mais difícil hoje? (opcional)" valor={dificuldade} onChange={setDificuldade} />
          <Campo
            label="Quero lembrar deste dia porque... (opcional)"
            valor={queroLembrar}
            onChange={setQueroLembrar}
          />

          <CampoFotos
            label="Fotos do dia (opcional)"
            fotosExistentes={fotosExistentes}
            fotosNovas={fotosNovas}
            onAdicionar={(arquivos) => setFotosNovas((atual) => [...atual, ...arquivos])}
            onRemoverExistente={(caminho) => setFotosExistentes((atual) => atual.filter((c) => c !== caminho))}
            onRemoverNova={(indice) => setFotosNovas((atual) => atual.filter((_, i) => i !== indice))}
          />

          {erro && <p className="text-sm text-burnt">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 rounded-xl bg-burnt text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            Salvar meu dia
          </button>
        </form>
      </Card>
    </div>
  );
}

function Campo({ label, valor, onChange, linhas = 2 }) {
  return (
    <div>
      <label className="block text-sm text-ink mb-1">{label}</label>
      <textarea
        rows={linhas}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-burnt resize-none"
      />
    </div>
  );
}
