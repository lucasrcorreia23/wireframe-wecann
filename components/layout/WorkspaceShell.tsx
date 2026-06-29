"use client";

import { useRef, useState, type ReactNode, type UIEvent } from "react";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import type { NodeId } from "@/flow/types";
import { MODULES } from "@/components/screens/registry";
import { CenterStage } from "./CenterStage";
import { AthenaPanel } from "@/components/chrome/AthenaPanel";
import { PersistentGlobe } from "@/components/experience/PersistentGlobe";
import { AuroraBackground } from "@/components/experience/AuroraBackground";
import { ChromeOverlay } from "@/components/chrome/ChromeOverlay";
import { Intro } from "@/components/experience/Intro";
import { MobileExperience } from "@/components/experience/MobileExperience";
import { useIsMobile } from "@/lib/useMediaQuery";

// Shell PERSISTENTE (proposta 2D). A Home é uma tela CENTRALIZada (globo herói +
// saudação + pílulas + chat + agenda). As demais telas usam o shell de colunas:
// ESQUERDA (resumos) + CENTRO (foco) + a Athena, que nasce RECOLHIDA (orbe no
// canto) e pode ser EXPANDIDA para o painel direito. O globo é o PersistentGlobe
// (único, montado UMA vez no MESMO ponto da árvore com `key` estável) que voa
// entre o centro da Home, a orbe e o topo do painel — nunca remonta.
const GRID_EXPANDED = "minmax(0,1fr) minmax(0,2.2fr) minmax(0,1fr)";
const GRID_COLLAPSED = "minmax(0,1fr) minmax(0,3.2fr)";

export function WorkspaceShell() {
  const isMobile = useIsMobile();
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const athenaCollapsed = useFlow((s) => s.athenaCollapsed);
  const toggleAthena = useFlow((s) => s.toggleAthena);

  const shellRef = useRef<HTMLDivElement>(null);

  // Header auto-hide. Topo: sem fundo; rolar p/ BAIXO esconde; rolar p/ CIMA traz
  // de volta com blur. Direção medida por elemento (WeakMap) — estável, sem flicker.
  const [header, setHeader] = useState({ hidden: false, blur: false });
  const lastTops = useRef(new WeakMap<HTMLElement, number>());

  // Scroll join: ESQUERDA e CENTRO rolam juntos (espelham scrollTop). Cache por nó.
  const scrollerCache = useRef<{ node: NodeId | null; left: HTMLElement | null; center: HTMLElement | null }>({
    node: null,
    left: null,
    center: null,
  });
  const syncing = useRef(false);
  const getScroller = (col: "left" | "center"): HTMLElement | null => {
    const cache = scrollerCache.current;
    if (cache.node !== currentNode) {
      cache.node = currentNode;
      cache.left = null;
      cache.center = null;
    }
    if (cache[col]?.isConnected) return cache[col];
    const sel =
      col === "center"
        ? '[data-col="center"] [data-pane="enter"] .overflow-y-auto'
        : '[data-col="left"] .overflow-y-auto';
    const found = shellRef.current?.querySelector<HTMLElement>(sel) ?? null;
    cache[col] = found;
    return found;
  };

  const onScrollCapture = (e: UIEvent) => {
    const el = e.target as HTMLElement;
    const col = el?.closest?.("[data-col]")?.getAttribute("data-col");
    if (!col) return;
    if (syncing.current) {
      syncing.current = false;
      return;
    }

    const top = el.scrollTop;
    const prev = lastTops.current.get(el) ?? 0;
    lastTops.current.set(el, top);
    setHeader((h) => {
      if (top <= 8) return h.hidden || h.blur ? { hidden: false, blur: false } : h;
      const delta = top - prev;
      if (Math.abs(delta) < 4) return h; // ignora jitter/momentum mínimo
      const next =
        delta > 0 && top > 64
          ? { hidden: true, blur: h.blur }
          : delta < 0
            ? { hidden: false, blur: true }
            : h;
      return next.hidden === h.hidden && next.blur === h.blur ? h : next;
    });

    // Espelha o scroll entre esquerda ↔ centro (só nas telas de colunas).
    if (col === "left" || col === "center") {
      const other = getScroller(col === "left" ? "center" : "left");
      if (other && Math.abs(other.scrollTop - top) > 1) {
        syncing.current = true;
        other.scrollTop = top;
      }
    }
  };

  // Fallback mobile (sem o shell de colunas).
  if (isMobile) return <MobileExperience />;

  const Left = MODULES[currentNode]?.Left;

  // Renderiza o CENTRO de um nó com o onContinue ligado ao próximo do grafo.
  const renderCenter = (node: NodeId) => {
    const Center = MODULES[node]?.Center;
    if (!Center) return null;
    const next = NODES[node]?.next;
    return <Center onContinue={next ? () => goTo(next) : undefined} />;
  };

  const isHome = currentNode === "home";
  const isLauncher = currentNode === "consult-intro";
  // Orbe (recolhida) fora da Home, ou no launcher (que não tem painel).
  const showOrb = !isHome && (athenaCollapsed || isLauncher);

  // Conteúdo da tela (varia); o PersistentGlobe/ChromeOverlay/Intro ficam ESTÁVEIS
  // fora dele (mesmo lugar da árvore) para o globo nunca remontar ao navegar.
  let body: ReactNode;
  if (isHome) {
    const Center = MODULES.home?.Center;
    body = (
      <div data-col="center" onScrollCapture={onScrollCapture} className="relative z-10 h-full w-full">
        {Center ? <Center /> : null}
      </div>
    );
  } else if (isLauncher) {
    const Center = MODULES[currentNode]?.Center;
    body = (
      <div data-col="center" onScrollCapture={onScrollCapture} className="h-full w-full px-[6vw] pt-20">
        {Center ? <Center onContinue={() => goTo("consult")} /> : null}
      </div>
    );
  } else {
    body = (
      <div
        onScrollCapture={onScrollCapture}
        className="grid h-full items-stretch gap-4 px-[5vw]"
        style={{
          gridTemplateColumns: athenaCollapsed ? GRID_COLLAPSED : GRID_EXPANDED,
          gridTemplateRows: "minmax(0, 1fr)",
        }}
      >
        {/* ESQUERDA — resumos. */}
        <div data-col="left" className="h-full min-h-0 min-w-0">
          {Left ? <Left /> : null}
        </div>

        {/* CENTRO — foco que evolui. */}
        <div data-col="center" className="h-full min-h-0 min-w-0">
          <CenterStage renderCenter={renderCenter} />
        </div>

        {/* DIREITA — painel da Athena (só quando EXPANDIDA). O globo é o
            PersistentGlobe, encaixado na âncora do topo do painel. */}
        {!athenaCollapsed && (
          <div className="h-full min-h-0 min-w-0 pt-[88px] pb-6">
            <AthenaPanel onToggle={() => toggleAthena()} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`relative h-screen w-screen overflow-hidden ${isHome ? "bg-white" : "bg-neutral-100"}`}
    >
      {/* Fundo "aurora" — só na Home, no rodapé, atrás de tudo (z-0). */}
      {isHome && <AuroraBackground />}

      {/* Globo PERSISTENTE — `key` estável + posição fixa na árvore: nunca remonta. */}
      <PersistentGlobe key="persistent-globe" />

      {body}

      {/* Recolhida/launcher → âncora da orbe no canto (o globo se encaixa aqui). */}
      {showOrb && <div data-globe-anchor className="fixed bottom-6 right-6 h-24 w-24" />}

      <ChromeOverlay headerHidden={header.hidden} headerBlur={header.blur} />
      <Intro />
    </div>
  );
}
