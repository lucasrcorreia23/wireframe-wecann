"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

// Modal-painel deslizante PADRÃO da plataforma (o "feel da pílula"): entra pela
// direita com GSAP `power2.out` em 0.5s (xPercent 100→0 + opacity), idêntico ao
// painel de pílula da Home. O transform vive no PRÓPRIO painel (vidro) — seguro
// p/ o backdrop-filter (só transform em ANCESTRAL mataria o blur).
//
// `backdrop`: quando true, mostra um scrim que escurece o fundo (telas cujo fundo
// NÃO recua — JourneyShell). Quando false, o host recua os cards (Home/Agenda) e o
// scrim é dispensado. `className` define a largura (ex.: "max-w-[560px]").
export function SlideOverPanel({
  open,
  onClose,
  children,
  className,
  backdrop = true,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdrop?: boolean;
  label?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  useGSAP(
    () => {
      const el = panelRef.current;
      if (!el) return;
      const to = { xPercent: open ? 0 : 100, opacity: open ? 1 : 0 };
      // Estado inicial sem animação (não desliza no mount); depois anima nas trocas.
      if (!inited.current) {
        inited.current = true;
        gsap.set(el, to);
        return;
      }
      gsap.to(el, { ...to, duration: 0.5, ease: "power2.out" });
    },
    { dependencies: [open] },
  );

  return (
    <>
      {backdrop ? (
        <div
          onClick={onClose}
          aria-hidden
          className={cn(
            "absolute inset-0 z-20 rounded-[24px] bg-[#e6e6e4]/45 transition-opacity duration-500",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      ) : null}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-hidden={!open}
        className={cn(
          "glass-panel-blue backdrop-blur-2xl absolute inset-y-0 right-0 z-30 my-auto flex h-fit max-h-full w-full flex-col rounded-[28px] p-7 opacity-0",
          open ? "pointer-events-auto" : "pointer-events-none",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}
