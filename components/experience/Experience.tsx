"use client";

import { WorldCanvasClient } from "./WorldCanvasClient";
import { TempNav } from "./TempNav";
import { Intro } from "./Intro";

// Compõe a experiência: canvas-mundo persistente (camada-mundo) + chrome DOM
// acima (camada-chrome). Na Fase 5 o TempNav vira ChromeOverlay.
export function Experience() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-100">
      {/* Camada-mundo */}
      <div className="absolute inset-0">
        <WorldCanvasClient />
      </div>

      {/* Camada-chrome (DOM acima do canvas, sempre nítida) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <TempNav />
      </div>

      {/* Momento editorial de abertura */}
      <Intro />
    </div>
  );
}
