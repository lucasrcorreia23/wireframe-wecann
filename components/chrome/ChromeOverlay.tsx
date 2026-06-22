"use client";

import { TopBar } from "./TopBar";
import { CompanionPanels } from "./CompanionPanels";

// Raiz da camada-chrome (HUD DOM, z acima do canvas, sempre nítida §3.2).
// O container é pointer-events-none; cada peça reativa os eventos onde precisa.
// Navegação por TopBar (menu/busca/avatar); o avanço entre telas vive nas
// próprias telas (CTAs), não em barras flutuantes.
export function ChromeOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TopBar />
      <CompanionPanels />
    </div>
  );
}
