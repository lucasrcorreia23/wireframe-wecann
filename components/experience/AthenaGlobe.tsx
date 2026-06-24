"use client";

import dynamic from "next/dynamic";
// Filtra o warning de depreciação do THREE.Clock disparado pelo @react-three/fiber.
import "@/lib/silence-three-deprecations";

// Regra de ouro do canvas no App Router: `dynamic(..., {ssr:false})` SÓ é permitido
// em Client Component. Este wrapper "use client" carrega o canvas do globo
// client-only (zero hidratação). O globo agora é um elemento CONTIDO dentro do
// painel da IA — preenche o slot do pai (`absolute inset-0`).
const Globe = dynamic(
  () => import("./AthenaGlobeCanvas").then((m) => m.AthenaGlobeCanvas),
  {
    ssr: false,
    loading: () => null,
  },
);

export function AthenaGlobe() {
  return <Globe />;
}
