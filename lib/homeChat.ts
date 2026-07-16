// Canal compartilhado entre o chat da Home (DOM) e o mundo 3D (AiGlobe) — um
// ref simples, sem React, no mesmo espírito de lib/viewScroll.ts. A HomeScreen
// espelha a fase do chat aqui; a PinnedQuestion mede a pill fixada e escreve a
// âncora (px de viewport) onde a orb deve "iluminar o canto". O AiGlobe lê por
// frame. Resetado ao desmontar a Home.
export type HomeChatPhase = "idle" | "asking" | "answered";

export const homeChat = {
  phase: "idle" as HomeChatPhase,
  /** Centro-alvo da orb em px de viewport (0 = ainda não medido → fallback). */
  anchorX: 0,
  anchorY: 0,
};
