// Centro de gravidade do movimento. Durações e eases vivem aqui para que cada
// transição seja "um momento orquestrado" e não efeitos espalhados (§6).

export const DURATION = {
  /** micro-interação (hover, toggle) */
  micro: 0.18,
  /** painel HUD entrando/saindo */
  panel: 0.42,
  /** travessia de câmera entre estações */
  travel: 1.05,
  /** fork lateral (offset + reentrada) é ~1.4x a travessia */
  fork: 1.45,
  /** cross-fade do fallback reduced-motion */
  crossfade: 0.2,
  /** intro: entrada da câmera no mundo */
  intro: 1.8,
} as const;

export const EASE = {
  /** ease assinatura da câmera; cai para power3.inOut se CustomEase falhar */
  travel: "travel",
  travelFallback: "power3.inOut",
  panel: "power2.out",
  micro: "power1.out",
} as const;

/** Lê a preferência de movimento reduzido de forma SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Resolve o nome do ease "travel" com fallback caso o CustomEase não exista. */
export function travelEase(): string {
  if (typeof window === "undefined") return EASE.travelFallback;
  // CustomEase registra no objeto gsap; se ausente, gsap ignora a string e isso
  // ficaria sem suavização. Conferimos via gsap.parseEase em runtime no callsite.
  return EASE.travel;
}
