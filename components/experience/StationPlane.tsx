"use client";

import type { FlowNode, Vec3 } from "@/flow/types";
import { PLACEHOLDER_W, PLACEHOLDER_H } from "@/lib/camera";

// Um plano-estação: placeholder 3D leve, mantido como base neutra atrás da UI mas
// INVISÍVEL (sem contorno e opacity 0) — o "quadrado no fundo" foi removido. A tela
// real é renderizada como overlay DOM (ActiveStationLayer), não em 3D; os vidros
// "pegam" o globo + atmosfera, não este plano. A posição pode ser sobrescrita (a
// câmera não viaja mais, então o plano ativo fica no enquadramento de repouso).
export function StationPlane({
  node,
  position,
}: {
  node: FlowNode;
  active?: boolean;
  position?: Vec3;
}) {
  return (
    <mesh position={position ?? node.position}>
      <planeGeometry args={[PLACEHOLDER_W, PLACEHOLDER_H]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
