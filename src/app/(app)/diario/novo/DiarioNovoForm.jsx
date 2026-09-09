"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Card from "@/components/Card";
import MoodPicker from "@/components/MoodPicker";
import CampoArquivo from "@/components/CampoArquivo";
import { useStore } from "@/lib/store";
import { hoje, formatarDataLonga } from "@/lib/date";

export default function DiarioNovoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get("data") || hoje();

  const { diario, salvarDiario } = useStore();
  const entradaExistente = diario.find((e) => e.data === data);

  const [humor, setHumor] = useState(entradaExistente?.humor || null);
  const [energia, setEnergia] = useState(entradaExistente?.energia || null);
  const [texto, setTexto] = useState(entradaExistente?.texto || "");
  const [algoBom, setAlgoBom] = useState(entradaExistente?.algo_bom || "");
  const [dificuldade, setDificuldade] = useState(entradaExistente?.dificuldade || "");
  const [queroLembrar, setQueroLembrar] = useState(entradaExistente?.quero_lembrar || "");
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

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
        foto
      );
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

          <CampoArquivo
            label="Foto do dia (opcional)"
            arquivo={foto}
            onSelecionar={setFoto}
            caminhoExistente={entradaExistente?.foto_path}
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
