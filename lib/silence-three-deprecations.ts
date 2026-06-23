// Silencia UM aviso de depreciação específico do three.js (r183+):
//   "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead."
//
// O Clock é instanciado internamente pelo @react-three/fiber (store: `new THREE.Clock()`),
// não pelo nosso código. É um warning inofensivo e dev-only; some sozinho quando o
// react-three-fiber migrar para THREE.Timer. Até lá, filtramos APENAS essa string
// para manter o console limpo — todos os outros warnings continuam intactos.
//
// Reversível: basta remover o import em WorldCanvasClient.tsx.

const SILENCED = "Clock: This module has been deprecated";

declare global {
  var __threeClockWarnSilenced: boolean | undefined;
}

if (typeof window !== "undefined" && !globalThis.__threeClockWarnSilenced) {
  globalThis.__threeClockWarnSilenced = true;

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === "string" && first.includes(SILENCED)) return;
    originalWarn(...args);
  };
}

export {};
