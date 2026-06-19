"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

// Momento editorial de abertura (§6): título display revelado por linha com
// SplitText, sincronizado com a entrada da câmera; depois esmaece. Sob
// reduced-motion não bloqueia — não renderiza.
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(prefersReducedMotion());

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = new SplitText(".intro-title", { type: "lines" });
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.from(".intro-eyebrow", { opacity: 0, y: 12, duration: 0.6 })
        .from(
          split.lines,
          {
            yPercent: 120,
            opacity: 0,
            stagger: 0.12,
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .to(root.current, { opacity: 0, duration: 0.7, delay: 0.7 });
      return () => {
        split.revert();
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-neutral-100/80 backdrop-blur-sm"
    >
      <span className="intro-eyebrow font-mono text-micro uppercase tracking-[0.3em] text-neutral-500">
        WeCann · fluxo de atendimento
      </span>
      <h1 className="intro-title max-w-3xl text-center font-display text-display-xl font-medium leading-[1.05] text-ink">
        Um espaço contínuo, da pré-consulta ao relatório.
      </h1>
    </div>
  );
}
