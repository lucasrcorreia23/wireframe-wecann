// Réguas da Home (layout home.png) compartilhadas entre DOM e 3D. O AiGlobe
// deriva a âncora X da bola DESTAS MESMAS medidas para alinhar pixel-perfect
// com o eixo da coluna principal (centro da coluna = centro do viewport
// deslocado meia sidebar + meio gap para a esquerda).
export const HOME_SIDEBAR_W = 300;
export const HOME_GAP = 24;

/** Âncora vertical da bola na Home (NDC y ∈ [-1,1]) — ~38% do topo, como no print. */
export const HOME_ORB_Y = 0.25;

/** Escala da bola na Home. Núcleo ≈ 4.2·s / (14·tan 22.5°) da altura do
 *  viewport → 0.3 ≈ 21% (pedido: ~1.5× o núcleo do print). */
export const HOME_ORB_SCALE = 0.3;
