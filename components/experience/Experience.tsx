"use client";

import { WorldCanvasClient } from "./WorldCanvasClient";
import { ChromeOverlay } from "@/components/chrome/ChromeOverlay";
import { Intro } from "./Intro";

// Compõe a experiência: canvas-mundo persistente (camada-mundo) + chrome DOM
// acima (camada-chrome), sempre nítida. O canvas nunca remonta ao navegar.
export function Experience() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-100">
      {/* Camada-mundo */}
      <div className="absolute inset-0">
        <WorldCanvasClient />
      </div>

      {/* Camada-chrome */}
      <ChromeOverlay />

      {/* Momento editorial de abertura */}
      <Intro />
    </div>
  );
}
