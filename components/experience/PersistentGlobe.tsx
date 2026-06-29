"use client";

import { useEffect, useRef, useState } from "react";
import { useFlow } from "@/flow/store";
import { AthenaGlobe } from "./AthenaGlobe";
import { ChatInput } from "@/components/chrome/AthenaPanel";
import { gsap } from "@/lib/gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

// Tamanho FIXO do canvas do globo (px). Nunca muda → o ResizeObserver do R3F
// nunca dispara → sem o bug de deslocamento (medir tamanho com transform). A
// variação de tamanho/posição entre estados é SÓ transform (translate + scale).
const GLOBE_PX = 160;

// Globo PERSISTENTE da Athena: montado UMA vez, vive aqui (não dentro do painel),
// e "voa" entre as âncoras [data-globe-anchor] da tela ativa:
//  • Home    → centro (grande);
//  • outras  → orbe no canto (recolhida) ou topo do painel (expandida).
// Como é único, nunca remonta o canvas Three ao navegar/recolher.
export function PersistentGlobe() {
  const currentNode = useFlow((s) => s.currentNode);
  const athenaCollapsed = useFlow((s) => s.athenaCollapsed);
  const toggleAthena = useFlow((s) => s.toggleAthena);

  const isHome = currentNode === "home";
  const isLauncher = currentNode === "consult-intro";
  // Orbe clicável: fora da Home e recolhida (ou no launcher, que não tem painel).
  const isOrb = !isHome && (athenaCollapsed || isLauncher);

  const globeRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  const miniRef = useRef<HTMLDivElement>(null);
  const [miniOpen, setMiniOpen] = useState(false);

  // Encaixa o globo CENTRALIZADO sobre a âncora ativa (centro do globo no centro
  // da âncora). Usamos x/y no centro + xPercent/yPercent -50 e transformOrigin no
  // centro → alinhamento robusto, independente da origem padrão do GSAP. Como a
  // esfera é centrada no canvas, ela cai exatamente no centro da âncora (ex.: sob
  // o título "athena").
  const place = (animate: boolean) => {
    const g = globeRef.current;
    if (!g) return;
    const anchor = document.querySelector<HTMLElement>("[data-globe-anchor]");
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vars = {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      xPercent: -50,
      yPercent: -50,
      scale: r.width / GLOBE_PX,
      transformOrigin: "50% 50%",
      autoAlpha: 1,
    };
    if (animate && !prefersReducedMotion()) {
      gsap.to(g, { ...vars, duration: 0.6, ease: EASE.panel, overwrite: true });
    } else {
      gsap.set(g, vars);
    }
  };

  // Reposiciona quando muda a tela/estado: no mount sem animar; depois, voo.
  useEffect(() => {
    const wasFirst = firstRun.current;
    place(!wasFirst);
    firstRun.current = false;
    // 1ª montagem: re-encaixa após o layout e as fontes assentarem (sem animar),
    // evitando posição obsoleta (medida antes do reflow do texto/grid).
    if (wasFirst) {
      const raf = requestAnimationFrame(() => place(false));
      let cancelled = false;
      document.fonts?.ready?.then(() => {
        if (!cancelled) place(false);
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
      };
    }
    // place lê a DOM (âncora ativa); depende só do estado de tela.
  }, [currentNode, athenaCollapsed]);

  // Acompanha a âncora ao redimensionar/rolar (Home rola) e a QUALQUER mudança de
  // layout (fontes, scrollbar, conteúdo assíncrono) via ResizeObserver no body —
  // o globo se re-encaixa sozinho e nunca fica obsoleto. Sem animar.
  useEffect(() => {
    const onMove = () => place(false);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true); // capture: pega scroll de qualquer container
    const ro = new ResizeObserver(onMove);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
      ro.disconnect();
    };
  }, []);

  // Fecha o mini-input ao clicar fora.
  useEffect(() => {
    if (!miniOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (globeRef.current?.contains(t) || miniRef.current?.contains(t)) return;
      setMiniOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [miniOpen]);

  const expand = () => {
    setMiniOpen(false);
    toggleAthena(false);
  };

  return (
    <>
      {/* Globo — tamanho fixo (160px); começa invisível (autoAlpha) até ser
          posicionado no 1º frame. Só transform muda entre estados. */}
      <div
        ref={globeRef}
        style={{ visibility: "hidden" }}
        onClick={isOrb ? () => setMiniOpen((v) => !v) : undefined}
        role={isOrb ? "button" : undefined}
        tabIndex={isOrb ? 0 : undefined}
        aria-label={isOrb ? "Abrir Athena" : undefined}
        className={cn(
          "fixed left-0 top-0 z-20 h-40 w-40",
          isOrb ? "cursor-pointer" : "pointer-events-none",
        )}
      >
        <AthenaGlobe />
      </div>

      {/* Mini-input do orbe (fixo, NÃO escala com o globo). */}
      {isOrb && miniOpen && (
        <div
          ref={miniRef}
          className="fixed bottom-[116px] right-6 z-30 flex w-[280px] flex-col gap-2"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={expand}
              aria-label="Expandir Athena"
              className="glass-panel-blue backdrop-blur-2xl grid h-8 w-8 place-items-center rounded-full text-neutral-600 transition-colors hover:text-ink"
            >
              <Icon name="bx-expand-alt" className="text-base" />
            </button>
          </div>
          <ChatInput />
        </div>
      )}
    </>
  );
}
