"use client";

import { useRef, type ReactNode, type UIEvent } from "react";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import type { NodeId } from "@/flow/types";
import { MODULES } from "@/components/screens/registry";
import { CenterStage } from "./CenterStage";
import { AthenaPanel } from "@/components/chrome/AthenaPanel";
import { PersistentGlobe } from "@/components/experience/PersistentGlobe";
import { AuroraBackground } from "@/components/experience/AuroraBackground";
import { TopBar } from "@/components/chrome/TopBar";
import { SearchBar } from "@/components/chrome/SearchBar";
import { ChromeOverlay } from "@/components/chrome/ChromeOverlay";
import { Intro } from "@/components/experience/Intro";
import { MobileExperience } from "@/components/experience/MobileExperience";
import { useIsMobile } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";

// Shell PERSISTENTE (2D). Header GLOBAL fixo no topo (TopBar do Figma) + corpo que
// preenche o resto. Telas de CONTEÚDO (sem coluna ESQUERDA) usam COLUNA ÚNICA
// centralizada (AppScreen) com a Athena como OVERLAY/orbe acionável. A zona de
// Consulta (módulos com `Left`: consult/clinical-note) mantém o layout legado de
// colunas. A Home é centralizada (globo herói). O globo é o PersistentGlobe (único,
// montado UMA vez) que voa entre as âncoras [data-globe-anchor].
const GRID_EXPANDED = "minmax(0,1fr) minmax(0,2.2fr) minmax(0,1fr)";
const GRID_COLLAPSED = "minmax(0,1fr) minmax(0,3.2fr)";

export function WorkspaceShell() {
  const isMobile = useIsMobile();
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const athenaCollapsed = useFlow((s) => s.athenaCollapsed);
  const toggleAthena = useFlow((s) => s.toggleAthena);

  const shellRef = useRef<HTMLDivElement>(null);

  // Scroll join (só telas de colunas legadas): ESQUERDA e CENTRO espelham scrollTop.
  const scrollerCache = useRef<{
    node: NodeId | null;
    left: HTMLElement | null;
    center: HTMLElement | null;
  }>({ node: null, left: null, center: null });
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
    if (col === "left" || col === "center") {
      const other = getScroller(col === "left" ? "center" : "left");
      if (other && Math.abs(other.scrollTop - el.scrollTop) > 1) {
        syncing.current = true;
        other.scrollTop = el.scrollTop;
      }
    }
  };

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
  // Consulta ao Vivo: tela autocontida de 2 zonas (tem o seu próprio aside Athena).
  const isConsult = currentNode === "consult";
  // Telas legadas multi-coluna (ainda definem `Left`).
  const isColumn = !isHome && !isLauncher && !isConsult && Boolean(Left);
  // Telas de conteúdo (novo look) = coluna única.
  const isSingle = !isHome && !isLauncher && !isConsult && !isColumn;

  // Orbe recolhida → âncora do canto. A Consulta tem aside próprio: sem orbe/overlay.
  const showOrb = !isHome && !isConsult && athenaCollapsed;
  // Painel overlay da Athena: só nas telas single, quando EXPANDIDA.
  const showSingleOverlay = isSingle && !athenaCollapsed;

  let body: ReactNode;
  if (isHome) {
    const Center = MODULES.home?.Center;
    body = (
      <div data-col="center" className="relative z-10 h-full w-full">
        {Center ? <Center /> : null}
      </div>
    );
  } else if (isLauncher) {
    const Center = MODULES[currentNode]?.Center;
    body = (
      <div
        data-col="center"
        className="h-full w-full overflow-y-auto px-[6vw] pt-6"
      >
        {Center ? <Center onContinue={() => goTo("consult")} /> : null}
      </div>
    );
  } else if (isColumn) {
    // Override de grid por módulo (ex.: consulta). Mantém Athena expansível à dir.
    const moduleGrid = MODULES[currentNode]?.grid;
    const gridColumns = moduleGrid
      ? athenaCollapsed
        ? moduleGrid.collapsed
        : moduleGrid.expanded
      : athenaCollapsed
        ? GRID_COLLAPSED
        : GRID_EXPANDED;

    body = (
      <div
        onScrollCapture={onScrollCapture}
        className="grid h-full items-stretch gap-4 px-[5vw]"
        style={{
          gridTemplateColumns: gridColumns,
          gridTemplateRows: "minmax(0, 1fr)",
        }}
      >
        {Left ? (
          <div data-col="left" className="h-full min-h-0 min-w-0">
            <Left />
          </div>
        ) : null}
        <div data-col="center" className="h-full min-h-0 min-w-0">
          <CenterStage renderCenter={renderCenter} />
        </div>
        {!athenaCollapsed && (
          <div className="h-full min-h-0 min-w-0 pb-6">
            <AthenaPanel onToggle={() => toggleAthena()} />
          </div>
        )}
      </div>
    );
  } else if (isConsult) {
    // Tela autocontida full-height; ela gerencia o próprio scroll (main + aside).
    body = (
      <div data-col="center" className="relative z-10 h-full min-h-0">
        {renderCenter(currentNode)}
      </div>
    );
  } else {
    // COLUNA ÚNICA (novo look) — scroll natural; a tela usa AppScreen p/ enquadrar.
    body = (
      <div
        data-col="center"
        onScrollCapture={onScrollCapture}
        className="relative z-10 h-full overflow-y-auto"
      >
        {renderCenter(currentNode)}
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "relative flex h-screen w-screen flex-col overflow-hidden",
        isHome ? "bg-white" : "bg-neutral-100",
      )}
    >
      {/* Fundo "aurora" — só na Home, atrás de tudo. */}
      {isHome && <AuroraBackground />}

      {/* Globo PERSISTENTE — `key` estável: nunca remonta. */}
      <PersistentGlobe key="persistent-globe" />

      {/* Header GLOBAL fixo. */}
      <TopBar />

      {/* Corpo — preenche o resto da altura. */}
      <div className="relative z-10 min-h-0 flex-1">{body}</div>

      {/* Athena — painel overlay (telas single, expandida). Abaixo do globo (z-20)
          para o globo aparecer na âncora do topo do painel; acima do conteúdo. */}
      {showSingleOverlay && (
        <div className="pointer-events-auto fixed bottom-4 right-4 top-[88px] z-[15] w-[380px]">
          <AthenaPanel onToggle={() => toggleAthena()} />
        </div>
      )}

      {/* Orbe do canto → âncora p/ o globo (recolhida). O globo trata o clique. */}
      {showOrb && (
        <div data-globe-anchor className="fixed bottom-6 right-6 z-20 h-20 w-20" />
      )}

      <ChromeOverlay />
      <SearchBar />
      <Intro />
    </div>
  );
}
