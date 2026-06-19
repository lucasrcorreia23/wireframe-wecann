"use client";

import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import { WireButton } from "@/components/ui";

// Afordância de avanço do caminho-ouro: aparece quando o nó tem `next` e não é
// um ponto de decisão (forks são resolvidos na própria tela). Mantém o fluxo
// para a frente sem expor todo o chrome de navegação.
export function AdvanceControl() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const node = NODES[currentNode];

  if (!node.next || node.fork) return null;

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2">
      <WireButton variant="primary" onClick={() => goTo(node.next!)}>
        Continuar → {NODES[node.next].title}
      </WireButton>
    </div>
  );
}
