// Réguas da Home (Figma "Iteração 9 de Julho") compartilhadas entre DOM e 3D.
// O AiGlobe deriva a âncora X da bola DESTAS MESMAS medidas para alinhar
// pixel-perfect com o eixo da coluna principal (centro da coluna = centro do
// viewport deslocado meia sidebar + meio gap para a esquerda).
export const HOME_SIDEBAR_W = 320;
export const HOME_GAP = 32;

/** Âncora vertical da bola na Home (NDC y ∈ [-1,1]) — centro da área flexível
 *  acima do prompt (a saudação fica à direita dela, na mesma altura). */
export const HOME_ORB_Y = 0.18;

/** Deslocamento horizontal da bola na Home (NDC): negativo = à ESQUERDA do
 *  eixo da coluna principal — a saudação ocupa a metade direita. */
export const HOME_ORB_X_SHIFT = -0.25;

/** Escala da bola na Home (núcleo ~112px no frame de 1440 do Figma, com o
 *  halo bem maior). */
export const HOME_ORB_SCALE = 0.3;

/* ───── Modo CHAT (mocks 0-174/0-279): orb pequena no canto sup-esquerdo da
   mensagem fixada. A âncora REAL vem da medição do DOM (lib/homeChat); estes
   são o fallback (px no frame de 1440×810 do mock) e a escala do núcleo
   (~52px no mock). */
export const HOME_CHAT_ORB_SCALE = 0.09;
export const HOME_CHAT_ORB_X = 146;
export const HOME_CHAT_ORB_Y = 184;
