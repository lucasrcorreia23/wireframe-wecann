"use client";

import { ContextBar } from "./ContextBar";
import { TopBar } from "./TopBar";
import { CompanionPanels } from "./CompanionPanels";
import { AdvanceControl } from "./AdvanceControl";

// Raiz da camada-chrome (HUD DOM, z acima do canvas, sempre nítida §3.2).
// O container é pointer-events-none; cada peça reativa os eventos onde precisa.
export function ChromeOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TopBar />
      <ContextBar />
      <CompanionPanels />
      <AdvanceControl />
    </div>
  );
}
