"use client";

import { useFlow, useCanBack } from "@/flow/store";
import { NODES, ALL_NODE_IDS, ZONE_LABEL } from "@/flow/graph";
import { WireButton, WireBadge } from "@/components/ui";

// Navegação TEMPORÁRIA (Fase 3/4) sobre o canvas — substituída pelo ChromeOverlay
// real na Fase 5. Existe só para exercitar a travessia e os forks.
export function TempNav() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);
  const canBack = useCanBack();
  const node = NODES[currentNode];

  return (
    <>
      {/* Context bar provisória */}
      <div className="pointer-events-auto absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-3 rounded-wire border border-neutral-200 bg-paper/90 px-4 py-2 backdrop-blur">
        <span className="font-mono text-micro uppercase tracking-[0.14em] text-neutral-500">
          {ZONE_LABEL[node.zone]}
        </span>
        <span className="h-3 w-px bg-neutral-300" />
        <span className="text-caption font-medium text-ink">{node.title}</span>
        {node.terminus ? <WireBadge tone="hard">Terminus</WireBadge> : null}
      </div>

      {/* Controles de travessia provisórios */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-wire border border-neutral-200 bg-paper/90 px-3 py-2 backdrop-blur">
        <WireButton variant="ghost" size="sm" onClick={back}>
          ← Voltar
        </WireButton>
        {node.branch ? (
          <WireButton
            variant="secondary"
            size="sm"
            onClick={() => goTo(node.branch!)}
          >
            {NODES[node.branch].title}
          </WireButton>
        ) : null}
        {node.next && !node.fork ? (
          <WireButton
            variant="primary"
            size="sm"
            onClick={() => goTo(node.next!)}
          >
            Avançar →
          </WireButton>
        ) : null}
        {node.fork ? <WireBadge tone="mid">Decisão na tela</WireBadge> : null}
      </div>

      {/* Saltos diretos (debug de alcançabilidade) */}
      <div className="pointer-events-auto absolute right-5 top-1/2 z-20 flex max-h-[80vh] -translate-y-1/2 flex-col gap-1 overflow-auto rounded-wire border border-neutral-200 bg-paper/85 p-2 backdrop-blur">
        {ALL_NODE_IDS.map((id) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={
              "rounded-wire px-2 py-1 text-right font-mono text-micro transition-colors " +
              (id === currentNode
                ? "bg-ink text-paper"
                : "text-neutral-500 hover:text-ink")
            }
          >
            {id}
          </button>
        ))}
      </div>

      <span className="sr-only">{canBack ? "Voltar disponível" : ""}</span>
    </>
  );
}
