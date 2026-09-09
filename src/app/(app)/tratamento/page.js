import { Suspense } from "react";
import TratamentoClient from "./TratamentoClient";

export const metadata = { title: "Tratamento — Diário da Hellen 🌷" };

export default function TratamentoPage() {
  return (
    <Suspense fallback={null}>
      <TratamentoClient />
    </Suspense>
  );
}
