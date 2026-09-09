export const metadata = { title: "Cantinho da Helô 🎨" };

export default function CantinhoLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--helo-bg)", color: "var(--helo-ink)" }}>
      {children}
    </div>
  );
}
