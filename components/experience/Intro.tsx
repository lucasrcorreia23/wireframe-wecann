"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";

// Abertura editorial (§6) orquestrada pela máquina de estados `introPhase`:
//   text   → card de texto sobre vidro fosco, fade-in
//   (~2.5s)→ card faz fade-out
//   globe  → o globo entra vindo do fundo (lógica no AiGlobe)
//   modules→ as colunas da Home entram em stagger (lógica no HomeScreen)
//   ready  → estado de repouso
// Animações do card são opacity-only no PRÓPRIO card (o reveal por linha usa
// transform só em spans DESCENDENTES — não quebra o backdrop-filter do card,
// que é regido por ancestrais). O "globo vindo do fundo" é WebGL.
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const setIntroPhase = useFlow((s) => s.setIntroPhase);
  const introPhase = useFlow((s) => s.introPhase);

  // Reduced-motion (ou ?still via prefersReducedMotion): salta direto p/ "ready".
  useEffect(() => {
    if (prefersReducedMotion()) setIntroPhase("ready");
  }, [setIntroPhase]);

  // Rede de segurança: garante que a intro sempre chegue a "ready", mesmo que o
  // onComplete do GSAP não dispare em algum ambiente. Nunca fica presa.
  useEffect(() => {
    const id = window.setTimeout(() => setIntroPhase("ready"), 7000);
    return () => window.clearTimeout(id);
  }, [setIntroPhase]);

  useGSAP(
    () => {
      // Só constrói a timeline num arranque genuíno (introPhase "text" no
      // mount). Evita replay/avisos do GSAP se o componente remontar já em
      // fase adiantada (ex.: HMR, ou navegação que reuse o estado "ready").
      if (prefersReducedMotion() || useFlow.getState().introPhase !== "text")
        return;
      const split = new SplitText(".intro-title", { type: "lines" });
      const tl = gsap.timeline();
      // Fase 1 — card entra (opacity), título revelado por linha.
      tl.fromTo(".intro-card", { opacity: 0 }, { opacity: 1, duration: 0.6 })
        .from(".intro-eyebrow", { opacity: 0, y: 12, duration: 0.6 }, "-=0.2")
        .from(
          split.lines,
          {
            yPercent: 120,
            opacity: 0,
            stagger: 0.12,
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.3",
        )
        // Fase 2 — segura ~2.5s no total e faz fade-out (opacity).
        .to(".intro-card", { opacity: 0, duration: 0.7, delay: 0.9 })
        // Fase 3 — libera o globo vindo do fundo (~1.5s no AiGlobe).
        .call(() => setIntroPhase("globe"))
        // Fase 4 — colunas entram em stagger (HomeScreen).
        .call(() => setIntroPhase("modules"), undefined, "+=1.5")
        // Repouso.
        .call(() => setIntroPhase("ready"), undefined, "+=0.9");
      return () => {
        split.revert();
      };
    },
    { scope: root },
  );

  // O root permanece SEMPRE montado (vazio após a fase de texto) para que a
  // timeline do useGSAP não seja revertida/morta no meio — só assim os .call()
  // de globe→modules→ready continuam disparando. O card só existe na fase "text".
  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-[3vw]"
    >
      {introPhase === "text" ? (
        <div className="intro-card flex max-w-3xl flex-col items-center gap-5 text-center">
          <span className="intro-eyebrow font-mono text-micro uppercase tracking-[0.3em] text-neutral-500">
            WeCann · fluxo de atendimento
          </span>
          <h1 className="intro-title font-display text-display-xl font-medium leading-[1.05] text-ink">
            Tudo que a medicina pode ser, agora.
          </h1>
        </div>
      ) : null}
    </div>
  );
}
