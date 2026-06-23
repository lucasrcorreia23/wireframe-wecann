"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { viewScroll } from "@/lib/viewScroll";
import { cn } from "@/lib/cn";

// Regra de plataforma: conteúdo de scroll NUNCA corta bruto — as bordas
// esvanecem. Mas o fade só aparece no lado que realmente esconde conteúdo:
//  • topo só esvanece quando há algo rolado acima;
//  • rodapé só esvanece quando há algo abaixo.
// Assim o primeiro/último item visível em repouso fica nítido (sem "tirar visão").
// Seguro p/ vidro: a máscara fica num scroller interno cujos filhos não têm
// backdrop-filter próprio (texto / `glass-frost-inner`).
export function ScrollFade({
  children,
  className,
  fade = 22,
  watch,
  driveOrb = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Tamanho do esvanecer em px. */
  fade?: number;
  /** Valor que, ao mudar, recalcula as bordas (ex.: troca de aba/conteúdo). */
  watch?: unknown;
  /**
   * Padrão do produto: quando `true`, este scroller alimenta `viewScroll.progress`
   * (mesmo canal do JourneyShell) → o globo 3D (orb) sobe/desce e a câmera faz pan
   * conforme se rola. Use no scroller "prontuário" da tela. Reseta ao desmontar.
   */
  driveOrb?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.scrollTop > 1;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    if (driveOrb) {
      const max = el.scrollHeight - el.clientHeight;
      viewScroll.progress = max > 0 ? el.scrollTop / max : 0;
    }
    setEdges((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom },
    );
  }, [driveOrb]);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      ro.disconnect();
      // Ao desmontar (troca de tela), a orb volta ao repouso.
      if (driveOrb) viewScroll.progress = 0;
    };
  }, [update, watch, driveOrb]);

  const mask = `linear-gradient(to bottom, transparent 0, #000 var(--fade-top), #000 calc(100% - var(--fade-bottom)), transparent 100%)`;

  return (
    <div
      ref={ref}
      onScroll={update}
      className={cn("no-scrollbar overflow-y-auto", className)}
      style={
        {
          "--fade-top": edges.top ? `${fade}px` : "0px",
          "--fade-bottom": edges.bottom ? `${fade}px` : "0px",
          WebkitMaskImage: mask,
          maskImage: mask,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
