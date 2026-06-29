"use client";

import { CompanionPanels } from "./CompanionPanels";

// Camada-chrome (HUD DOM, z acima do canvas). O header agora é o TopBar PERSISTENTE
// (renderizado direto pelo WorkspaceShell, não mais aqui). Esta camada hospeda só os
// painéis companheiros (zona Consulta). Container pointer-events-none; cada peça
// reativa os eventos onde precisa.
export function ChromeOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <CompanionPanels />
    </div>
  );
}
