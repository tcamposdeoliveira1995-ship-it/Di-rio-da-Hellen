"use client";

// Campo de foto/arquivo com duas formas de escolher: tirar uma foto agora
// (abre a câmera direto no celular, via capture="environment") ou
// escolher um arquivo já existente (galeria, Arquivos, PDF...). Mostra
// uma pré-visualização do que foi escolhido, ou da foto já salva quando
// estamos editando um registro que já tinha uma.
import { useEffect, useMemo, useRef } from "react";
import { Camera, ImagePlus, FileText, X } from "lucide-react";
import FotoPrivada from "./FotoPrivada";

export default function CampoArquivo({
  label = "Foto",
  arquivo,
  onSelecionar,
  aceitarPdf = false,
  caminhoExistente = null,
}) {
  const inputCameraRef = useRef(null);
  const inputGaleriaRef = useRef(null);

  // O objeto URL é derivado direto do arquivo (useMemo), sem estado à
  // parte — o efeito só existe para liberar a URL anterior da memória.
  const urlPreview = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(() => {
    return () => {
      if (urlPreview) URL.revokeObjectURL(urlPreview);
    };
  }, [urlPreview]);

  function aoEscolherArquivo(e) {
    const escolhido = e.target.files?.[0] || null;
    if (escolhido) onSelecionar(escolhido);
    e.target.value = "";
  }

  const ehImagem = arquivo && arquivo.type?.startsWith("image/");
  const mostrarPreviewExistente = !arquivo && caminhoExistente;

  return (
    <div>
      <label className="block text-sm text-ink mb-2">{label}</label>

      {(urlPreview || mostrarPreviewExistente) && (
        <div className="relative w-32 h-32 mb-3">
          {urlPreview ? (
            ehImagem ? (
              // eslint-disable-next-line @next/next/no-img-element -- pré-visualização local de um arquivo ainda não enviado, não faz sentido passar pelo otimizador do Next.
              <img src={urlPreview} alt="Pré-visualização" className="w-32 h-32 object-cover rounded-2xl" />
            ) : (
              <div className="w-32 h-32 flex flex-col items-center justify-center gap-1 rounded-2xl bg-cream text-burnt">
                <FileText size={24} />
                <span className="text-[10px] text-muted px-2 text-center truncate max-w-full">{arquivo.name}</span>
              </div>
            )
          ) : (
            <FotoPrivada caminho={caminhoExistente} alt={label} className="w-32 h-32" />
          )}
          {arquivo && (
            <button
              type="button"
              onClick={() => onSelecionar(null)}
              aria-label="Remover"
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-ink text-white"
            >
              <X size={14} />
            </button>
          )}
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
          <ImagePlus size={16} /> {aceitarPdf ? "Escolher arquivo" : "Escolher da galeria"}
        </button>
      </div>

      {/* capture="environment" é o que faz o navegador do celular abrir a
          câmera direto, em vez do seletor de arquivos comum. */}
      <input
        ref={inputCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={aoEscolherArquivo}
        className="hidden"
      />
      <input
        ref={inputGaleriaRef}
        type="file"
        accept={aceitarPdf ? "application/pdf,image/*" : "image/*"}
        onChange={aoEscolherArquivo}
        className="hidden"
      />
    </div>
  );
}
