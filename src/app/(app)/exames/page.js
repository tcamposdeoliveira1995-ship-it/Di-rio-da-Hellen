import { Suspense } from "react";
import ExamesClient from "./ExamesClient";

export const metadata = { title: "Exames — Diário da Hellen 🌻" };

export default function ExamesPage() {
  return (
    <Suspense fallback={null}>
      <ExamesClient />
    </Suspense>
  );
}
