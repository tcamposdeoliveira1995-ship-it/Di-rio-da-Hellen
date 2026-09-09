export default function Card({ children, className = "", title, icon, action }) {
  return (
    <section
      className={`rounded-3xl bg-surface border border-line shadow-[0_2px_16px_-8px_rgba(74,58,61,0.15)] p-5 md:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && (
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              {icon && <span aria-hidden>{icon}</span>}
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
