export default function StatTile({ emoji, label, valor, detalhe }) {
  return (
    <div className="rounded-2xl bg-cream px-4 py-3">
      <p className="text-xs text-muted flex items-center gap-1.5">
        <span aria-hidden>{emoji}</span> {label}
      </p>
      <p className="text-xl font-display text-ink mt-1">{valor}</p>
      {detalhe && <p className="text-xs text-muted mt-0.5">{detalhe}</p>}
    </div>
  );
}
