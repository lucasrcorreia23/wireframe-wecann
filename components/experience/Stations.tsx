"use client";

import { useFlow } from "@/flow/store";
import { NODES, ALL_NODE_IDS } from "@/flow/graph";
import { StationPlane } from "./StationPlane";

// Mapeia os nós do grafo para planos-estação (placeholders 3D de profundidade).
// A UI da estação ativa é renderizada pelo ActiveStationLayer (overlay DOM).
export function Stations() {
  const current = useFlow((s) => s.currentNode);

  return (
    <>
      {ALL_NODE_IDS.map((id) => (
        <StationPlane key={id} node={NODES[id]} active={id === current} />
      ))}
    </>
  );
}
