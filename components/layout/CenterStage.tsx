"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFlow } from "@/flow/store";
import type { NodeId } from "@/flow/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";

// Palco do CENTRO — onde o foco principal "evolui" (não navega). Trocar de módulo
// faz um CROSSFADE só de OPACIDADE entre a tela que sai e a que entra, no próprio
// lugar (sem deslize/movimento). Opacidade em ancestral é SEGURA para o vidro
// (backdrop-filter sobrevive); transform em ancestral mataria o blur — por isso
// nada de x/y/scale aqui.
export function CenterStage({
  renderCenter,
}: {
  renderCenter: (node: NodeId) => ReactNode;
}) {
  const currentNode = useFlow((s) => s.currentNode);
  const travelToken = useFlow((s) => s.travelToken);

  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(travelToken);

  // Painéis em cena: `enter` é o foco atual; `exit` é o que está saindo (só durante
  // a transição). Em repouso, exit = null (um único painel).
  const [panes, setPanes] = useState<{ enter: NodeId; exit: NodeId | null }>({
    enter: currentNode,
    exit: null,
  });

  // Ao mudar o travelToken (nova "evolução"), promove o foco atual a `enter` e
  // empurra o anterior para `exit`.
  useEffect(() => {
    if (tokenRef.current === travelToken) return;
    tokenRef.current = travelToken;
    setPanes((p) => (p.enter === currentNode ? p : { enter: currentNode, exit: p.enter }));
  }, [travelToken, currentNode]);

  // Anima o crossfade quando os painéis mudam.
  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;
      const enterEl = root.querySelector<HTMLElement>('[data-pane="enter"]');
      const exitEl = root.querySelector<HTMLElement>('[data-pane="exit"]');
      if (!enterEl) return;

      const reduce = prefersReducedMotion();

      // Sem painel de saída → primeiro mount (fade-in único do foco).
      if (!exitEl) {
        gsap.fromTo(
          enterEl,
          { opacity: 0 },
          { opacity: 1, duration: reduce ? DURATION.crossfade : DURATION.panel, ease: EASE.panel },
        );
        return;
      }

      const d = reduce ? DURATION.crossfade : DURATION.panel;
      gsap.fromTo(enterEl, { opacity: 0 }, { opacity: 1, duration: d, ease: EASE.panel });
      gsap.to(exitEl, {
        opacity: 0,
        duration: reduce ? d : d * 0.6,
        ease: "power2.in",
        // Mantém o foco atual e apenas remove o painel que saiu (functional
        // update — sem closure/ref obsoleto).
        onComplete: () => setPanes((p) => ({ enter: p.enter, exit: null })),
      });
    },
    { dependencies: [panes.enter, panes.exit], scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {panes.exit && panes.exit !== panes.enter ? (
        <div
          key={`exit-${panes.exit}`}
          data-pane="exit"
          className="absolute inset-0 overflow-hidden"
          aria-hidden
        >
          {renderCenter(panes.exit)}
        </div>
      ) : null}
      <div
        key={`enter-${panes.enter}`}
        data-pane="enter"
        className="absolute inset-0"
      >
        {renderCenter(panes.enter)}
      </div>
    </div>
  );
}
