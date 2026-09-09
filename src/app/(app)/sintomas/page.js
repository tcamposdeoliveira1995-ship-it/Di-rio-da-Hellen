import { Suspense } from "react";
import SintomasClient from "./SintomasClient";

export const metadata = { title: "Sintomas — Diário da Hellen 🌻" };

export default function SintomasPage() {
  return (
    <Suspense fallback={null}>
      <SintomasClient />
    </Suspense>
  );
}
