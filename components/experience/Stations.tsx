"use client";

import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import type { Vec3 } from "@/flow/types";
import { StationPlane } from "./StationPlane";

// Enquadramento de repouso da câmera (home). Como a câmera não viaja mais pelo
// trilho −Z, renderizamos só o plano da estação ATIVA aqui, como backdrop sutil
// atrás da UI — em vez de espalhar planos distantes que ficariam fora de vista.
const RESTING_PLANE: Vec3 = [0, 0, 0];

// O plano-estação ativo serve de backdrop 3D leve. A UI real é renderizada pelo
// ActiveStationLayer (overlay DOM), e as telas é que se movem na transição.
export function Stations() {
  const current = useFlow((s) => s.currentNode);
  const introPhase = useFlow((s) => s.introPhase);

  // Durante a abertura, o placeholder 3D (plano + stroke) fica oculto para a
  // entrada ser limpa (só o globo vindo do fundo). Aparece ao chegar em repouso
  // ("ready"). Sob reduced-motion introPhase já é "ready" → visível.
  if (introPhase !== "ready") return null;

  return <StationPlane node={NODES[current]} active position={RESTING_PLANE} />;
}
