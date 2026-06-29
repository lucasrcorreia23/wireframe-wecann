"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Fundo "aurora" da Home (Figma node 4740-15354): uma "asa" de cor que varre na
// DIAGONAL do canto inferior-esquerdo até o superior-direito, sobre branco. Pelo
// metadata do Figma, a faixa colorida ocupa só a METADE INFERIOR da tela (o verde — a
// cor mais alta — começa ~42% do topo); a metade superior fica branca. Ao longo da
// diagonal, de cima p/ baixo: verde-menta (alto-direita), azul-periwinkle (faixa
// central) e, no rodapé, vermelho-coral (centro-direita) + ciano varrendo p/ a
// esquerda. Camada FIXA em tela cheia, atrás do conteúdo (z-0) e do globo (z-20);
// pointer-events-none.
//
// Cores extraídas direto do Figma (alphas elevados + filtro saturate p/ deixar o
// degradê mais vivo, a pedido):
//   verde  #4EEBB0 → #7CEDC4 → transparente   (rgba 78,235,176 / 124,237,196 / 170,239,217)
//   vermelho #FF3838 → #E04A4A                  (rgba 255,56,56 / 224,74,74)
//
// As manchas têm movimento AMPLO porém lento (GSAP yoyo, 16–22s, deslocamento de
// 22–30% do próprio tamanho + scale até ~1.34): cada uma deriva numa direção, então as
// cores se cruzam e remisturam continuamente (verde+azul → teal, ciano+vermelho →
// creme). O movimento é SEMPRE ativo (decorativo, sem info essencial) — não obedece a
// prefers-reduced-motion, pois o usuário pediu o movimento explicitamente.
const BLOBS = [
  {
    // verde-menta — topo da asa, alto à direita (~42% do topo, nada acima disso)
    className: "right-[-6%] top-[42%] h-[44vh] w-[50vw]",
    background:
      "radial-gradient(circle at 50% 50%, rgba(78,235,176,0.98) 0%, rgba(124,237,196,0.55) 45%, rgba(170,239,217,0) 72%)",
    drift: { xPercent: 22, yPercent: 24, scale: 1.26, rotation: 10 },
    duration: 20,
  },
  {
    // azul-periwinkle — faixa central da diagonal, logo abaixo do verde
    className: "right-[-4%] top-[54%] h-[42vh] w-[48vw]",
    background:
      "radial-gradient(circle at 50% 50%, rgba(120,152,236,0.90) 0%, rgba(150,180,245,0.50) 46%, rgba(180,205,255,0) 74%)",
    drift: { xPercent: -26, yPercent: 18, scale: 1.30, rotation: -12 },
    duration: 22,
  },
  {
    // vermelho-coral — rodapé, centro-direita
    className: "right-[7%] -bottom-[13%] h-[42vh] w-[38vw]",
    background:
      "radial-gradient(circle at 50% 50%, rgba(255,56,56,0.92) 0%, rgba(224,74,74,0.52) 48%, rgba(224,74,74,0) 76%)",
    drift: { xPercent: 26, yPercent: -22, scale: 1.32, rotation: 12 },
    duration: 16,
  },
  {
    // ciano — rodapé, varrendo do centro para a esquerda
    className: "left-0 -bottom-[13%] h-[36vh] w-[56vw]",
    background:
      "radial-gradient(circle at 50% 50%, rgba(72,190,255,0.92) 0%, rgba(120,210,255,0.50) 46%, rgba(170,225,255,0) 74%)",
    drift: { xPercent: 30, yPercent: -24, scale: 1.34, rotation: -10 },
    duration: 18,
  },
] as const;

export function AuroraBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const blobs = gsap.utils.toArray<HTMLElement>("[data-aurora-blob]");
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          ...BLOBS[i].drift,
          duration: BLOBS[i].duration,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 1.2,
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden [filter:saturate(1.2)]"
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          data-aurora-blob
          className={`absolute rounded-full blur-[90px] will-change-transform ${blob.className}`}
          style={{ background: blob.background }}
        />
      ))}
    </div>
  );
}
