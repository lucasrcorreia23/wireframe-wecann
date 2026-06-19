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

  // Intro (1º load): inicializa o proxy "longe" e a câmera entra → enquadra home;
  // fog "acende" via intensidade decaindo (§6). Roda uma única vez.
  useEffect(() => {
    const t = cameraTargetFor(NODES.home.position);
    target.current = t;
    const reduce = prefersReducedMotion();

    // Inicialização do proxy (fora do render para respeitar as regras de refs).
    proxyRef.current = {
      px: t.pos[0],
      py: t.pos[1] + (reduce ? 0 : 6),
      pz: t.pos[2] + (reduce ? 0 : 34),
      tx: t.look[0],
      ty: t.look[1],
      tz: t.look[2],
    };
    const p = proxyRef.current;

    if (reduce) {
      setProxy(p, t.pos, t.look);
      return;
    }
    const tl = gsap.timeline();
    tl.to(p, {
      px: t.pos[0],
      py: t.pos[1],
      pz: t.pos[2],
      tx: t.look[0],
      ty: t.look[1],
      tz: t.look[2],
      duration: DURATION.intro,
      ease: travelEase(),
    });
    return () => {
      tl.kill();
    };
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

  useFrame(() => {
    const p = proxyRef.current;
    if (!p) return;
    const t = target.current;
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
