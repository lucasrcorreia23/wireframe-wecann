"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";

// Névoa da INTRO: o globo nasce a ~87u da câmera — além do `far` DENSO, ou
// seja, 100% encoberto pelo branco. Enquanto ele se aproxima (AiGlobe), a
// própria travessia da distância faz a revelação: silhueta velada → contraste
// pleno ao atracar. Quando a fase sai de "text"/"globe", a névoa relaxa para a
// forma residual sutil (a régua original, recolorida branca).
const FOG_DENSE = { near: 4, far: 55 };
const FOG_FINAL = { near: 16, far: 130 };

export function IntroFog() {
  const scene = useThree((s) => s.scene);
  const introPhase = useFlow((s) => s.introPhase);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  useFrame((_, dt) => {
    const fog = scene.fog;
    if (!(fog instanceof THREE.Fog)) return;
    const dense = !reduce && (introPhase === "text" || introPhase === "globe");
    const target = dense ? FOG_DENSE : FOG_FINAL;
    // Lerp harmônico (τ ≈ 0.95s) — mesmo padrão do entry do AiGlobe. Sob
    // reduced-motion snap imediato para o estado final.
    const k = reduce ? 1 : 1 - Math.pow(0.35, dt);
    fog.near = THREE.MathUtils.lerp(fog.near, target.near, k);
    fog.far = THREE.MathUtils.lerp(fog.far, target.far, k);
  });

  return null;
}
