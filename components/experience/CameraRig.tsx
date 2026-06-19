"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import { cameraTargetFor } from "@/lib/camera";

// Proxy de câmera (§3.3): nunca tweenamos a câmera direto contra o loop do R3F.
// Mantemos { px,py,pz, tx,ty,tz } e, em useFrame, copiamos proxy → camera.
export type CameraProxy = {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
};

// Fase 3: a rig amortece (damp) o proxy em direção ao alvo do nó atual — já lê
// como movimento. Na Fase 4 o `goTo` substitui o damping por um timeline GSAP.
export function CameraRig({
  proxyRef,
  intensityRef,
}: {
  proxyRef: React.RefObject<CameraProxy | null>;
  intensityRef: React.RefObject<number>;
}) {
  const camera = useThree((s) => s.camera);
  const currentNode = useFlow((s) => s.currentNode);
  const target = useRef(cameraTargetFor(NODES.home.position));

  // Inicializa o proxy enquadrando a home.
  if (proxyRef.current === null) {
    const t = cameraTargetFor(NODES.home.position);
    proxyRef.current = {
      px: t.pos[0],
      py: t.pos[1],
      pz: t.pos[2],
      tx: t.look[0],
      ty: t.look[1],
      tz: t.look[2],
    };
  }

  // Atualiza o alvo quando o nó muda.
  useEffect(() => {
    target.current = cameraTargetFor(NODES[currentNode].position);
  }, [currentNode]);

  useFrame((_, dt) => {
    const p = proxyRef.current;
    if (!p) return;
    const t = target.current;
    const lambda = 2.6;
    p.px = THREE.MathUtils.damp(p.px, t.pos[0], lambda, dt);
    p.py = THREE.MathUtils.damp(p.py, t.pos[1], lambda, dt);
    p.pz = THREE.MathUtils.damp(p.pz, t.pos[2], lambda, dt);
    p.tx = THREE.MathUtils.damp(p.tx, t.look[0], lambda, dt);
    p.ty = THREE.MathUtils.damp(p.ty, t.look[1], lambda, dt);
    p.tz = THREE.MathUtils.damp(p.tz, t.look[2], lambda, dt);

    // Intensidade da atmosfera ∝ distância restante até o alvo.
    const remaining = Math.hypot(t.pos[0] - p.px, t.pos[1] - p.py, t.pos[2] - p.pz);
    intensityRef.current = THREE.MathUtils.clamp(remaining / 10, 0, 1);

    camera.position.set(p.px, p.py, p.pz);
    camera.lookAt(p.tx, p.ty, p.tz);
  });

  return null;
}
