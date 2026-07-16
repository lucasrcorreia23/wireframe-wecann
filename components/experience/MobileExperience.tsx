"use client";

import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow, useCanBack } from "@/flow/store";
import { NODES, ALL_NODE_IDS, ZONE_LABEL } from "@/flow/graph";
import { WireButton, WireBadge, Eyebrow } from "@/components/ui";

// Fallback mobile (§0/§6): sem o trilho 3D completo. As estações entram por
// cross-fade; navegação por seleção de nó + avanço/voltar. Forks na própria tela.
export function MobileExperience() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);
  const canBack = useCanBack();

  const node = NODES[currentNode];
  const Screen = SCREENS[currentNode];

  const props: ScreenProps = {};
  if (node.fork) {
    props.onYes = () => goTo(node.fork!.yes.to);
    props.onNo = () => goTo(node.fork!.no.to);
  }
  if (node.next) props.onContinue = () => goTo(node.next!);

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      {/* Header compacto */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-paper px-4 py-3">
        <div className="flex flex-col">
          <Eyebrow>{ZONE_LABEL[node.zone]}</Eyebrow>
          <span className="text-body font-medium text-ink">{node.title}</span>
        </div>
        {node.terminus ? <WireBadge tone="hard">Terminus</WireBadge> : null}
      </header>

      {/* Seletor de estação */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-neutral-200 bg-paper-50 px-4 py-2">
        {ALL_NODE_IDS.map((id) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={
              "shrink-0 rounded-wire border px-2 py-1 font-mono text-micro transition-colors " +
              (id === currentNode
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-500")
            }
          >
            {id}
          </button>
        ))}
      </div>

      {/* Estação atual com cross-fade (key força remontagem + soft-fade) */}
      <main className="flex-1 overflow-auto p-4">
        <div
          key={currentNode}
          className="station-reveal mx-auto w-fit origin-top scale-[0.46] sm:scale-[0.62]"
        >
          <div className="overflow-hidden rounded-wire border border-neutral-200 bg-paper">
            <Screen {...props} />
          </div>
        </div>
      </main>

      {/* Controles */}
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-neutral-200 bg-paper px-4 py-3">
        <WireButton variant="ghost" size="sm" onClick={back} >
          ← Voltar
        </WireButton>
        {!canBack ? <span className="sr-only">início</span> : null}
        {node.fork ? (
          <WireBadge tone="mid">Decisão na tela</WireBadge>
        ) : node.next ? (
          <WireButton variant="primary" size="sm" onClick={() => goTo(node.next!)}>
            Continuar →
          </WireButton>
        ) : (
          <WireBadge tone="neutral">Fim do fluxo</WireBadge>
        )}
      </footer>
    </div>
  );
}
