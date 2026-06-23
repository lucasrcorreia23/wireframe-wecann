"use client";

import dynamic from "next/dynamic";
// Filtra o warning de depreciação do THREE.Clock disparado pelo @react-three/fiber.
import "@/lib/silence-three-deprecations";

// Regra de ouro do canvas no App Router (§armadilha 1): `dynamic(..., {ssr:false})`
// SÓ é permitido em Client Component. Este wrapper "use client" carrega o
// WorldCanvas client-only, evitando qualquer render no servidor (zero hidratação).
const WorldCanvas = dynamic(
  () => import("./WorldCanvas").then((m) => m.WorldCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 grid place-items-center bg-neutral-100">
        <span className="font-mono text-micro uppercase tracking-[0.14em] text-neutral-400">
          Preparando o espaço…
        </span>
      </div>
    ),
  },
);

export function WorldCanvasClient() {
  return <WorldCanvas />;
}
