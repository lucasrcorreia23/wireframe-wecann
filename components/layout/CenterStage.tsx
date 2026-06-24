"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFlow } from "@/flow/store";
import type { NodeId } from "@/flow/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";

// Palco do CENTRO — onde o foco principal "evolui" (não navega). Trocar de módulo
// faz um CROSSFADE só de OPACIDADE, no próprio lugar (sem deslize/movimento).
//
// ANTI-"PISCADA": animar `opacity` num ANCESTRAL que contém `backdrop-filter` (o
// vidro) causa um flash de 1 frame quando a opacidade chega em 1 — o navegador
// troca de "buffer de grupo isolado" para render direto e o vidro re-amostra o
// backdrop. Por isso o painel que PERMANECE (`enter`) fica SEMPRE em `opacity: 1`
// (nunca animado): quem anima é só o que SAI (`exit`/véu), POR CIMA, em fade-out.
// Assim o vidro do foco final nunca "pisca". Transform também é proibido aqui
// (mataria o backdrop-filter).
export function CenterStage({
  renderCenter,
}: {
  renderCenter: (node: NodeId) => ReactNode;
}) {
  const currentNode = useFlow((s) => s.currentNode);
  const travelToken = useFlow((s) => s.travelToken);

  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(travelToken);

  // Painéis em cena: `enter` é o foco atual (embaixo, sempre opaco); `exit` é o que
  // está saindo (por cima, faz fade-out só durante a transição). Em repouso, exit = null.
  const [panes, setPanes] = useState<{ enter: NodeId; exit: NodeId | null }>({
    enter: currentNode,
    exit: null,
  });

  // Véu sólido (cor do shell, SEM vidro) que cobre o foco no PRIMEIRO mount e some
  // em fade-out, revelando o CENTRO sem o "pop" do backdrop-filter (não há tela
  // anterior para sair por cima). Some após o reveal.
  const [veil, setVeil] = useState(true);

  // Ao mudar o travelToken (nova "evolução"), promove o foco atual a `enter` e
  // empurra o anterior para `exit`.
  useEffect(() => {
    if (tokenRef.current === travelToken) return;
    tokenRef.current = travelToken;
    setPanes((p) => (p.enter === currentNode ? p : { enter: currentNode, exit: p.enter }));
  }, [travelToken, currentNode]);

  // Anima o crossfade quando os painéis mudam (e o fade-out do véu no 1º mount).
  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;
      const exitEl = root.querySelector<HTMLElement>('[data-pane="exit"]');
      const veilEl = root.querySelector<HTMLElement>('[data-pane="veil"]');

      const reduce = prefersReducedMotion();
      const d = reduce ? DURATION.crossfade : DURATION.panel;

      // Troca de tela: o foco novo (`enter`) já está 100% opaco embaixo; o antigo
      // (`exit`) sai POR CIMA em fade-out, revelando o novo. Removido no fim REAL
      // (functional update — sem closure/ref obsoleto).
      if (exitEl) {
        gsap.to(exitEl, {
          opacity: 0,
          duration: d,
          ease: EASE.panel,
          onComplete: () => setPanes((p) => ({ enter: p.enter, exit: null })),
        });
        return;
      }

      // Primeiro mount: o foco já está opaco; revela-se dissolvendo o véu sólido
      // (sem vidro → fade puro, sem pop).
      if (veilEl) {
        gsap.to(veilEl, {
          opacity: 0,
          duration: d,
          ease: EASE.panel,
          onComplete: () => setVeil(false),
        });
      }
    },
    { dependencies: [panes.enter, panes.exit], scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* FOCO (enter) — embaixo e SEMPRE opaco (nunca anima opacidade → sem pop). */}
      <div key={`enter-${panes.enter}`} data-pane="enter" className="absolute inset-0">
        {renderCenter(panes.enter)}
      </div>

      {/* SAÍDA (exit) — por cima, faz fade-out durante a troca, revelando o foco. */}
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

      {/* VÉU — só no 1º mount: cor do shell, sem vidro; some revelando o foco. */}
      {veil ? (
        <div data-pane="veil" className="absolute inset-0 bg-neutral-100" aria-hidden />
      ) : null}
    </div>
  );
}
