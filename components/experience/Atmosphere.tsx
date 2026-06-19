"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

// Atmosfera WebGL cinza (§3.1): névoa + grid recuando + partículas sutis. É o que
// faz a transição parecer viagem e não corte. `intensity` (0..1) sobe durante o
// trânsito para dar pistas de movimento (controlado pela CameraRig na Fase 4).
export function Atmosphere({
  intensityRef,
}: {
  intensityRef: React.RefObject<number>;
}) {
  const points = useRef<THREE.Points>(null);

  // Nuvem de partículas distribuída ao longo do corredor (−Z), em torno do trilho.
  const { positions, count } = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22; // y
      positions[i * 3 + 2] = -Math.random() * 170 + 6; // z ao longo do trilho
    }
    return { positions, count };
  }, []);

  useFrame((_, dt) => {
    const k = intensityRef.current ?? 0;
    if (points.current) {
      // Deriva sutil; acelera proporcional à intensidade do trânsito.
      points.current.rotation.z += dt * 0.01;
      const mat = points.current.material as THREE.PointsMaterial;
      mat.opacity = 0.18 + k * 0.32;
      mat.size = 0.035 + k * 0.03;
    }
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
