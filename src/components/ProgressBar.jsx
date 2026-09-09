export default function ProgressBar({ percentual = 0, className = "" }) {
  const valor = Math.min(100, Math.max(0, percentual));
  return (
    <div
      className={`h-2.5 w-full rounded-full bg-blush-soft overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(valor)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-burnt to-gold transition-all duration-500"
        style={{ width: `${valor}%` }}
      />
    </div>
  );
}
