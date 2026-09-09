export default function EmptyState({ emoji = "🌷", titulo, descricao }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <p className="font-medium text-ink">{titulo}</p>
      {descricao && <p className="text-sm text-muted max-w-sm">{descricao}</p>}
    </div>
  );
}
