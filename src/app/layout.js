import "./globals.css";

export const metadata = {
  title: "Diário da Hellen 🌷",
  description: "Painel pessoal para acompanhamento da jornada de tratamento.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-cream text-ink">{children}</body>
    </html>
  );
}
