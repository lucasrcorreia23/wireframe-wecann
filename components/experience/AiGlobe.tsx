"use client";

import { type ComponentRef, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";

const RADIUS = 2.1;
const DIST = 7; // distância à frente da câmera (billboard)

// Âncoras em NDC (x,y ∈ [-1,1]) + escala relativa. A IA (Athena) fica CENTRAL e
// GRANDE na Home — cobrindo atrás de toda a faixa de módulos para o vidro
// "pegar" o globo (blur estilo Casuística); nas demais telas desliza para o
// canto superior direito, menor, alinhada ao "slot do globo" no AIDock.
const HOME_ANCHOR = { x: 0.0, y: 0.2, scale: 1.05 };
const DOCK_ANCHOR = { x: 0.6, y: 0.42, scale: 0.44 };

// O globo persiste e billboarda à frente da câmera: um único globo 3D que segue
// a viagem −Z e desliza centro↔direita conforme a tela. Atrás do overlay DOM
// translúcido (módulos), preservando a profundidade do mundo.
export function AiGlobe() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<ComponentRef<typeof MeshDistortMaterial>>(null);
  const halo = useRef<THREE.Mesh>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const isHome = useFlow((s) => s.currentNode === "home");
  const invalidate = useThree((s) => s.invalidate);

  const cur = useRef({ ...HOME_ANCHOR });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const cam = state.camera;
    const target = isHome ? HOME_ANCHOR : DOCK_ANCHOR;

    // Lerp da âncora (deslize harmônico ao trocar de tela).
    const k = reduce ? 1 : 1 - Math.pow(0.0009, dt);
    cur.current.x = THREE.MathUtils.lerp(cur.current.x, target.x, k);
    cur.current.y = THREE.MathUtils.lerp(cur.current.y, target.y, k);
    cur.current.scale = THREE.MathUtils.lerp(cur.current.scale, target.scale, k);

    // NDC → ponto no mundo a DIST à frente da câmera; encara a câmera.
    tmp.set(cur.current.x, cur.current.y, 0.5).unproject(cam);
    tmp.sub(cam.position).normalize().multiplyScalar(DIST).add(cam.position);
    g.position.copy(tmp);
    g.quaternion.copy(cam.quaternion);
    g.scale.setScalar(cur.current.scale);

    if (!reduce) {
      const t = state.clock.elapsedTime;
      if (core.current) core.current.rotation.y += dt * 0.18;
      const lerp = 1 - Math.pow(0.001, dt);
      if (coreMat.current) {
        const mat = coreMat.current;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity ?? 1, isHome ? 0.55 : 0.5, lerp);
        const hue = 0.58 + Math.sin(t * 0.25) * 0.09;
        mat.color.setHSL(hue, 0.45, 0.68);
      }
      if (halo.current) {
        const mat = halo.current.material as THREE.MeshBasicMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, isHome ? 0.16 : 0.1, lerp);
      }
    }
    invalidate();
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[-2, -1, 3]} intensity={0.6} color="#cfe0ff" />

      <mesh ref={core}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <MeshDistortMaterial
          ref={coreMat}
          color="#7fa0d8"
          distort={0.35}
          speed={1.6}
          metalness={0.4}
          roughness={0.15}
          transparent
          opacity={0.6}
          emissive="#2a3f73"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh ref={halo} scale={1.12}>
        <sphereGeometry args={[RADIUS, 24, 24]} />
        <meshBasicMaterial
          color="#bcd0f5"
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
