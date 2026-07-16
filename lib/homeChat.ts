// Canal compartilhado entre o chat da Home (DOM) e o mundo 3D (AiGlobe) — um
// ref simples, sem React, no mesmo espírito de lib/viewScroll.ts. A HomeScreen
// espelha a fase do chat aqui; a QuestionPill do ÚLTIMO turno mede a própria
// caixa e escreve a âncora (px de viewport) onde o globo fica parado
// "iluminando o canto", além do alpha de visibilidade — o globo dissolve junto
// da pill nas zonas de fade do scroller (não passa por cima do header). (Quem
// acompanha a geração da resposta é a marquinha da StatusLine, no DOM — ver
// ChatTurn.) O AiGlobe lê por frame. Resetado ao desmontar a Home.
export type HomeChatPhase = "idle" | "asking" | "answered";

export const homeChat = {
  phase: "idle" as HomeChatPhase,
  /** Centro-alvo da orb em px de viewport (0 = ainda não medido → fallback). */
  anchorX: 0,
  anchorY: 0,
  /** Visibilidade da orb no chat (0..1) — segue o fade do texto no scroll. */
  anchorAlpha: 1,
};
