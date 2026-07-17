"use client";

import { useSyncExternalStore } from "react";

// Hook SSR-safe via useSyncExternalStore: snapshot do servidor é `false`, o
// cliente assina o matchMedia. Evita setState-em-efeito e mismatch de hidratação.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tablet/mobile: a experiência 3D completa é trocada pelo fallback (§0/§6). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1024px)");
}
