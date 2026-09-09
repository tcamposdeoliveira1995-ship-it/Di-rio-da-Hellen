import { Suspense } from "react";
import DiarioNovoForm from "./DiarioNovoForm";

export const metadata = { title: "Registrar meu dia — Diário da Hellen 🌻" };

export default function NovoDiarioPage() {
  return (
    <Suspense fallback={null}>
      <DiarioNovoForm />
    </Suspense>
  );
}
