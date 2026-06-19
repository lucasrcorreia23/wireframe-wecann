"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import { cameraTargetFor } from "@/lib/camera";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";

// Proxy de câmera (§3.3): nunca tweenamos a câmera direto contra o loop do R3F.
// Mantemos { px,py,pz, tx,ty,tz }; um timeline GSAP tweena o proxy e, em useFrame,
// copiamos proxy → camera. Isso evita conflito GSAP/R3F e dá easing por trecho.
export type CameraProxy = {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
};

function setProxy(p: CameraProxy, pos: THREE.Vector3Tuple, look: THREE.Vector3Tuple) {
  p.px = pos[0];
  p.py = pos[1];
  p.pz = pos[2];
  p.tx = look[0];
  p.ty = look[1];
  p.tz = look[2];
}

/** Resolve o ease "travel" com fallback documentado (power3.inOut). */
function travelEase(): string {
  return gsap.parseEase(EASE.travel) ? EASE.travel : EASE.travelFallback;
}

export function CameraRig({
  proxyRef,
  intensityRef,
}: {
  proxyRef: React.RefObject<CameraProxy | null>;
  intensityRef: React.RefObject<number>;
}) {
  const camera = useThree((s) => s.camera);
  const currentNode = useFlow((s) => s.currentNode);
  const travelToken = useFlow((s) => s.travelToken);
  const target = useRef(cameraTargetFor(NODES.home.position));

  // Intro (1º load): inicializa o proxy no enquadramento de repouso da home.
  // A câmera "voa" de longe via damping no useFrame (não-GSAP) durante os
  // primeiros frames — robusto e independente do ticker do GSAP. Roda uma vez.
  const intro = useRef({ active: false, t: 0 });
  useEffect(() => {
    const t = cameraTargetFor(NODES.home.position);
    target.current = t;
    // `?still` (ou reduced-motion) inicia já no repouso, sem fly-in.
    const still =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("still");
    const reduce = prefersReducedMotion() || still;

    // Inicialização do proxy (fora do render — regras de refs). Com movimento,
    // começa um pouco atrás/acima e o useFrame amortece até o repouso.
    proxyRef.current = {
      px: t.pos[0],
      py: t.pos[1] + (reduce ? 0 : 5),
      pz: t.pos[2] + (reduce ? 0 : 26),
      tx: t.look[0],
      ty: t.look[1],
      tz: t.look[2],
    };
    intro.current = { active: !reduce, t: 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // goTo: cada navegação (travelToken > 0) dispara um timeline que tweena o proxy
  // até o alvo do nó. Forks laterais usam duração maior (offset + reentrada).
  useEffect(() => {
    if (travelToken === 0) return; // intro cuida do enquadramento inicial
    const p = proxyRef.current;
    if (!p) return;

    const node = NODES[currentNode];
    const t = cameraTargetFor(node.position);
    target.current = t;

    gsap.killTweensOf(p);

    if (prefersReducedMotion()) {
      // Fallback: sem dolly; o cross-fade dos planos cobre a troca (§6).
      setProxy(p, t.pos, t.look);
      return;
    }

    // Ramo lateral: a estação está deslocada em X em relação ao trilho.
    const lateral = Math.abs(t.look[0]) > 0.5;
    const duration = lateral ? DURATION.fork : DURATION.travel;

    const tl = gsap.timeline();
    tl.to(p, {
      px: t.pos[0],
      py: t.pos[1],
      pz: t.pos[2],
      tx: t.look[0],
      ty: t.look[1],
      tz: t.look[2],
      duration,
      ease: travelEase(),
    });
    return () => {
      tl.kill();
    };
  }, [travelToken, currentNode, proxyRef]);

  useFrame((_, dt) => {
    const p = proxyRef.current;
    if (!p) return;
    const t = target.current;

    // Fly-in da intro por damping (não depende do ticker do GSAP).
    if (intro.current.active) {
      const lambda = 1.9;
      const clampedDt = Math.min(dt, 0.05);
      p.px = THREE.MathUtils.damp(p.px, t.pos[0], lambda, clampedDt);
      p.py = THREE.MathUtils.damp(p.py, t.pos[1], lambda, clampedDt);
      p.pz = THREE.MathUtils.damp(p.pz, t.pos[2], lambda, clampedDt);
      intro.current.t += dt;
      // Encerra quando chega perto ou após a duração máxima da intro.
      const near = Math.abs(p.pz - t.pos[2]) < 0.05;
      if (near || intro.current.t > DURATION.intro + 0.5) {
        setProxy(p, t.pos, t.look);
        intro.current.active = false;
      }
    }
    // Intensidade da atmosfera ∝ distância restante até o alvo (sobe no trânsito).
    const remaining = Math.hypot(
      t.pos[0] - p.px,
      t.pos[1] - p.py,
      t.pos[2] - p.pz,
    );
    intensityRef.current = THREE.MathUtils.clamp(remaining / 12, 0, 1);

    camera.position.set(p.px, p.py, p.pz);
    camera.lookAt(p.tx, p.ty, p.tz);
  });

  return null;
}
