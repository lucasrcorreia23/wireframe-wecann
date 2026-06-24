"use client";

import { TopBar } from "./TopBar";
import { CompanionPanels } from "./CompanionPanels";

// Raiz da camada-chrome (HUD DOM, z acima do canvas, sempre nítida §3.2).
// O container é pointer-events-none; cada peça reativa os eventos onde precisa.
// O header (TopBar) é auto-hide: some ao rolar para baixo e reaparece (só blur)
// ao rolar para cima — estado calculado no WorkspaceShell e repassado aqui.
export function ChromeOverlay({
  headerHidden = false,
  headerBlur = false,
}: {
  headerHidden?: boolean;
  headerBlur?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TopBar headerHidden={headerHidden} headerBlur={headerBlur} />
      <CompanionPanels />
    </div>
  );
}
