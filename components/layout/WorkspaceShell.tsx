"use client";

import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import type { NodeId } from "@/flow/types";
import { MODULES } from "@/components/screens/registry";
import { CenterStage } from "./CenterStage";
import { AthenaPanel } from "@/components/chrome/AthenaPanel";
import { ChromeOverlay } from "@/components/chrome/ChromeOverlay";
import { Intro } from "@/components/experience/Intro";
import { MobileExperience } from "@/components/experience/MobileExperience";
import { useIsMobile } from "@/lib/useMediaQuery";

// Shell PERSISTENTE de 3 zonas (proposta de design 2D). Substitui o antigo mundo
// 3D (<Experience/>). "Evolução, não navegação": as zonas são fixas e só o CENTRO
// troca de conteúdo (crossfade no lugar, sem movimento). A IA (Athena) acompanha
// o usuário pela coluna DIREITA em toda a plataforma; a ESQUERDA traz os resumos
// alimentados pela IA, que adaptam ao contexto.
const GRID = "minmax(0,1fr) minmax(0,1.7fr) minmax(0,1fr)";

export function WorkspaceShell() {
  const isMobile = useIsMobile();
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);

  // Fallback mobile (sem o shell de 3 colunas).
  if (isMobile) return <MobileExperience />;

  const Left = MODULES[currentNode]?.Left;

  // Renderiza o CENTRO de um nó com o onContinue ligado ao próximo do grafo
  // (ex.: encerrar a consulta → evolui para a Análise).
  const renderCenter = (node: NodeId) => {
    const Center = MODULES[node]?.Center;
    if (!Center) return null;
    const next = NODES[node]?.next;
    return <Center onContinue={next ? () => goTo(next) : undefined} />;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-100">
      <div
        className="grid h-full items-stretch gap-4 px-[3vw] pt-24 pb-12"
        // gridTemplateRows minmax(0,1fr): a linha PREENCHE a altura do shell (não
        // encolhe para o conteúdo). Sem isso a linha fica "auto" e as colunas
        // ganham altura do conteúdo → overflow-y-auto nunca dispara (não rola) e
        // os flex-1 colapsam (Agenda cortando itens).
        style={{ gridTemplateColumns: GRID, gridTemplateRows: "minmax(0, 1fr)" }}
      >
        {/* ESQUERDA — resumos (adaptam ao contexto, alimentados pela IA). */}
        <div className="h-full min-h-0 min-w-0">{Left ? <Left /> : null}</div>

        {/* CENTRO — foco principal que evolui no lugar. */}
        <div className="h-full min-h-0 min-w-0">
          <CenterStage renderCenter={renderCenter} />
        </div>

        {/* DIREITA — Athena persistente (globo contido + insights + chat). */}
        <AthenaPanel />
      </div>

      {/* Chrome (TopBar/menu/busca) acima do shell. */}
      <ChromeOverlay />

      {/* Momento editorial de abertura. */}
      <Intro />
    </div>
  );
}
