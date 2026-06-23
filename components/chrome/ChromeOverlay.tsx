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
      {/* Micro-fade global na bordinha (padrão da plataforma): o conteúdo que
          rola até a borda do viewport esvanece nos últimos px em vez de cortar
          seco. Cor do mundo (#e3e3e1) → invisível sobre o fundo vazio, suaviza
          sobre os cards. z-[1] interno: acima do conteúdo (z-5), abaixo dos
          ícones (z-20). Overlay-irmão — não quebra o backdrop-filter dos cards. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-5 bg-gradient-to-b from-[#e3e3e1] to-transparent" />
      <TopBar />
      <CompanionPanels />
    </div>
  );
}
