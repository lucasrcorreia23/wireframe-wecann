"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

// Fundo "aurora" da Home (Figma node 4805-19638): manchas de cor MUITO borradas,
// concentradas no RODAPÉ (sobretudo no canto inferior-direito), sobre branco —
// verde-menta, ciano/azul e vermelho-coral. Camada FIXA, atrás do conteúdo (z-0) e
// do globo (z-20); pointer-events-none. As manchas derivam de leve, contínuo e
// lento (GSAP yoyo) — neutralizado sob prefers-reduced-motion. Em vez de blend
// modes (que sobre branco viram branco), usamos radiais translúcidos que se
// sobrepõem e misturam pela própria opacidade (verde+azul → teal, azul+vermelho →
// púrpura), reproduzindo o degradê luminoso do design.
const BLOBS = [
  {
    // verde-menta — a mancha mais ampla, puxa do centro-direita para a esquerda
    className: "right-[6%] -bottom-[8%] h-[62vh] w-[58vw]",
    background:
      "radial-gradient(circle at 50% 60%, rgba(78,235,176,0.85) 0%, rgba(124,237,196,0.40) 45%, rgba(170,239,217,0) 72%)",
    drift: { xPercent: -6, yPercent: -5, scale: 1.12 },
    duration: 18,
  },
  {
    // ciano/azul — faixa logo abaixo do verde
    className: "right-[20%] -bottom-[16%] h-[56vh] w-[52vw]",
    background:
      "radial-gradient(circle at 50% 55%, rgba(72,158,255,0.80) 0%, rgba(120,190,255,0.38) 46%, rgba(170,215,255,0) 74%)",
    drift: { xPercent: 7, yPercent: 4, scale: 1.14 },
    duration: 22,
  },
  {
    // vermelho-coral — concentrado no canto inferior-direito
    className: "right-[1%] -bottom-[20%] h-[52vh] w-[44vw]",
    background:
      "radial-gradient(circle at 55% 50%, rgba(255,56,56,0.72) 0%, rgba(224,74,74,0.34) 50%, rgba(224,74,74,0) 78%)",
    drift: { xPercent: 5, yPercent: -4, scale: 1.1 },
    duration: 16,
  },
] as const;

export function AuroraBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const blobs = gsap.utils.toArray<HTMLElement>("[data-aurora-blob]");
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          ...BLOBS[i].drift,
          duration: BLOBS[i].duration,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 1.6,
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[68vh] overflow-hidden"
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          data-aurora-blob
          className={`absolute rounded-full blur-[80px] will-change-transform ${blob.className}`}
          style={{ background: blob.background }}
        />
      ))}
    </div>
  );
}
