"use client";

import { WorldCanvasClient } from "./WorldCanvasClient";
import { ActiveStationLayer } from "./ActiveStationLayer";
import { MobileExperience } from "./MobileExperience";
import { ChromeOverlay } from "@/components/chrome/ChromeOverlay";
import { Intro } from "./Intro";
import { useIsMobile } from "@/lib/useMediaQuery";

// Compõe a experiência: canvas-mundo persistente (camada-mundo) + chrome DOM
// acima (camada-chrome). Em tablet/mobile, troca para o fallback simplificado.
// O canvas nunca remonta ao navegar entre estações.
export function Experience() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileExperience />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-warm-bg">
      {/* Camada-mundo */}
      <div className="absolute inset-0">
        <WorldCanvasClient />
      </div>

      {/* Aurora do rodapé (Figma): faixa do Main Gradient borrada + véu branco
          + fio azul de 4px na base. Elemento de FUNDO do mundo — presente em
          todas as telas, entre o canvas e o overlay das estações. A faixa
          sangra para fora das bordas e a máscara esmaece o topo — nada de
          corte reto. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[440px]">
        <div
          className="absolute inset-x-[-120px] bottom-[-120px] h-[520px] opacity-[0.14] blur-[48px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(136,234,197,0.5) 0%, rgba(95,146,255,0.5) 25%, rgba(179,136,235,0.5) 50%, rgba(255,166,158,0.5) 75%, rgba(252,215,87,0.5) 100%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 96%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 96%)",
          }}
        />
        <div
          className="absolute inset-0 blur-[32px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 78%)",
          }}
        />
      </div>

      {/* Camada-tela — overlay DOM 1:1 da estação ativa (nítido) */}
      <ActiveStationLayer />

      {/* Camada-chrome */}
      <ChromeOverlay />

      {/* Momento editorial de abertura */}
      <Intro />
    </div>
  );
}
