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
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-100">
      {/* Camada-mundo */}
      <div className="absolute inset-0">
        <WorldCanvasClient />
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
