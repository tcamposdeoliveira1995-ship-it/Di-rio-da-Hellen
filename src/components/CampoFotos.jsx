"use client";

// Campo de fotos do dia, com várias fotos permitidas — tirar quantas
// quiser (uma de cada vez, é como a câmera funciona) ou escolher várias
// de uma vez na galeria. Mostra lado a lado as que já estão salvas e as
// que acabaram de ser escolhidas (ainda não enviadas), cada uma com um
// botão de remover.
import { useEffect, useMemo, useRef } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import FotoPrivada from "./FotoPrivada";

export default function CampoFotos({
  label = "Fotos",
  fotosExistentes = [],
  fotosNovas = [],
  onAdicionar,
  onRemoverExistente,
  onRemoverNova,
}) {
  const inputCameraRef = useRef(null);
  const inputGaleriaRef = useRef(null);

  function aoEscolherArquivos(e) {
    const arquivos = Array.from(e.target.files || []);
    if (arquivos.length) onAdicionar(arquivos);
    e.target.value = "";
  }

  const temFotos = fotosExistentes.length > 0 || fotosNovas.length > 0;

  return (
    <div>
      <label className="block text-sm text-ink mb-2">{label}</label>

      {temFotos && (
        <div className="flex flex-wrap gap-3 mb-3">
          {fotosExistentes.map((caminho) => (
            <MiniFoto key={caminho} caminho={caminho} onRemover={() => onRemoverExistente(caminho)} />
          ))}
          {fotosNovas.map((arquivo, indice) => (
            <MiniFotoNova key={indice} arquivo={arquivo} onRemover={() => onRemoverNova(indice)} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputCameraRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl bg-cream border border-line px-3 py-2 text-sm text-ink hover:border-burnt"
        >
          <Camera size={16} /> Tirar foto
        </button>
        <button
          type="button"
          onClick={() => inputGaleriaRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl bg-cream border border-line px-3 py-2 text-sm text-ink hover:border-burnt"
        >
          <ImagePlus size={16} /> Escolher da galeria
        </button>
      </div>

      <input
        ref={inputCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={aoEscolherArquivos}
        className="hidden"
      />
      <input
        ref={inputGaleriaRef}
        type="file"
        accept="image/*"
        multiple
        onChange={aoEscolherArquivos}
        className="hidden"
      />
    </div>
  );
}

function MiniFoto({ caminho, onRemover }) {
  return (
    <div className="relative w-24 h-24">
      <FotoPrivada caminho={caminho} alt="Foto do dia" className="w-24 h-24" />
      <button
        type="button"
        onClick={onRemover}
        aria-label="Remover foto"
        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-ink text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function MiniFotoNova({ arquivo, onRemover }) {
  const url = useMemo(() => URL.createObjectURL(arquivo), [arquivo]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="relative w-24 h-24">
      {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização local de um arquivo ainda não enviado */}
      <img src={url} alt="Pré-visualização" className="w-24 h-24 object-cover rounded-2xl" />
      <button
        type="button"
        onClick={onRemover}
        aria-label="Remover foto"
        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-ink text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}
