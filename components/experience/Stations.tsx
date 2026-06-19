"use client";

import { useFlow } from "@/flow/store";
import { NODES, ALL_NODE_IDS, neighborsOf } from "@/flow/graph";
import { StationPlane } from "./StationPlane";

// Mapeia os nós do grafo para planos-estação. Só a estação ativa e suas
// adjacentes montam DOM 3D (Html); as distantes ficam como placeholder leve
// (armadilha 5 — <Html transform> é pesado).
export function Stations() {
  const current = useFlow((s) => s.currentNode);
  const near = new Set([current, ...neighborsOf(current)]);

  return (
    <>
      {ALL_NODE_IDS.map((id) => (
        <StationPlane key={id} node={NODES[id]} mounted={near.has(id)} />
      ))}
    </>
  );
}
