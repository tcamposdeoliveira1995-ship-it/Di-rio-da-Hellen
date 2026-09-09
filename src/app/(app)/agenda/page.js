import { Suspense } from "react";
import AgendaClient from "./AgendaClient";

export const metadata = { title: "Agenda — Diário da Hellen 🌷" };

export default function AgendaPage() {
  return (
    <Suspense fallback={null}>
      <AgendaClient />
    </Suspense>
  );
}
