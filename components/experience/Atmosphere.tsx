"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

// Atmosfera WebGL cinza (§3.1): névoa + grid recuando + partículas sutis. É o que
// faz a transição parecer viagem e não corte. `intensity` (0..1) sobe durante o
// trânsito para dar pistas de movimento (controlado pela CameraRig na Fase 4).
export function Atmosphere({
  intensityRef,
}: {
  intensityRef: React.RefObject<number>;
}) {
  const points = useRef<THREE.Points>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  // Nuvem de partículas distribuída ao longo do corredor (−Z), em torno do trilho.
  // PRNG semeado (mulberry32) → layout determinístico e função pura (sem
  // Math.random no render; também evita qualquer divergência de hidratação).
  const { positions, count } = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    let seed = 0x9e3779b9;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (rand() - 0.5) * 40; // x
      positions[i * 3 + 1] = (rand() - 0.5) * 22; // y
      positions[i * 3 + 2] = -rand() * 170 + 6; // z ao longo do trilho
    }
    return { positions, count };
  }, []);

  useFrame((_, dt) => {
    if (reduce || !points.current) return; // atmosfera estática sob reduced-motion
    const k = intensityRef.current ?? 0;
    // Deriva sutil; acelera proporcional à intensidade do trânsito.
    points.current.rotation.z += dt * 0.01;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = 0.18 + k * 0.32;
    mat.size = 0.035 + k * 0.03;
  });

  return (
    <group>
      {/* Grid no piso, recuando — pista de movimento durante o dolly. */}
      <Grid
        position={[0, -6, -80]}
        args={[60, 220]}
        infiniteGrid
        cellSize={1.4}
        cellThickness={0.6}
        cellColor="#d6d6d3"
        sectionSize={7}
        sectionThickness={1}
        sectionColor="#b5b5b1"
        fadeDistance={70}
        fadeStrength={2}
        followCamera={false}
      />

      {/* Partículas cinza no ar. */}
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={count}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#8a8a85"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
