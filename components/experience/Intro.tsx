"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";

// Abertura editorial: frase sobre um SCRIM desfocado de tela cheia (dá leitura
// por cima do workspace). Máquina simplificada (pós-2D): text → (fade-in, hold,
// fade-out) → ready. As fases globe/modules foram aposentadas com o mundo 3D.
// Animações são opacity-only no scrim e no PRÓPRIO card (o reveal por linha usa
// transform só em spans DESCENDENTES — não quebra o backdrop-filter do scrim,
// regido por ancestrais sem transform).
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
      // Fase 1 — scrim e card entram juntos (opacity), título revelado por linha.
      tl.fromTo(".intro-scrim", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
        .fromTo(".intro-card", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
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
        // Fase 2 — segura e faz fade-out (opacity) de card + scrim juntos; depois
        // repousa. Sem fases de globo/módulos: o mundo agora é 2D e o CENTRO entra
        // com seu próprio fade (CenterStage), enquanto o globo vive no AthenaPanel.
        .to(".intro-card", { opacity: 0, duration: 0.7, delay: 1.2 })
        .to(".intro-scrim", { opacity: 0, duration: 0.7 }, "<")
        .call(() => setIntroPhase("ready"));
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
        <>
          {/* SCRIM desfocado de tela cheia — desfoca/clareia o workspace atrás para
              dar leitura à frase. Mesmo idioma do "overlay desfocado" do
              SlideOverPanel. backdrop-filter íntegro: ancestrais (root) sem
              transform; animação é opacity-only. */}
          <div className="intro-scrim absolute inset-0 bg-[#e6e6e4]/55 backdrop-blur-md" />
          <div className="intro-card relative z-10 flex max-w-3xl flex-col items-center gap-5 text-center">
            <span className="intro-eyebrow font-mono text-micro uppercase tracking-[0.3em] text-neutral-500">
              WeCann · fluxo de atendimento
            </span>
            <h1 className="intro-title font-display text-display-xl font-medium leading-[1.05] text-ink">
              Tudo que a medicina pode ser, agora.
            </h1>
          </div>
        </>
      ) : null}
    </div>
  );
}
