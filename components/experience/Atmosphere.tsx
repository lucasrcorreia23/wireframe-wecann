"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

// Manchas de gradiente suave (paleta pastel da bola) espalhadas pelo corredor
// −Z — substituem o antigo grid (pedido 15/07/2026): a ambiência remete à
// suavidade do gradiente, e a paralaxe delas durante o dolly segue dando pista
// de movimento. [x, y, z, escala, opacidade, índice da cor]
const WASHES: [number, number, number, number, number, number][] = [
  [9, -7, -28, 55, 0.5, 0],
  [-13, 6, -55, 48, 0.35, 1],
  [10, -6, -95, 60, 0.5, 0],
  [-11, 5, -135, 50, 0.3, 2],
];

// Cores das manchas: pêssego, lavanda, menta (mesma família do globo).
const WASH_COLORS: [number, number, number][] = [
  [255, 203, 158],
  [199, 200, 239],
  [187, 233, 211],
];

// Textura radial suave (cor → transparente) gerada em canvas 2D, uma por cor.
function makeWashTexture([r, g, b]: [number, number, number]): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.55)`);
  grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.22)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// "Chão" de luz: elipse radial quente MUITO clara deitada sob o corredor.
// Não é um piso literal — é a insinuação de gravidade/horizonte que faz o
// espaço branco ler como AMBIENTE 3D (a perspectiva do plano + o fade na
// névoa ao longe dão a profundidade).
function makeFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  g.addColorStop(0.0, "rgba(243, 233, 221, 0.9)");
  g.addColorStop(0.45, "rgba(243, 233, 221, 0.4)");
  g.addColorStop(1.0, "rgba(243, 233, 221, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Atmosfera WebGL: névoa + manchas de gradiente + partículas sutis. É o que
// faz a transição parecer viagem e não corte. `intensity` (0..1) sobe durante o
// trânsito para dar pistas de movimento (controlado pela CameraRig na Fase 4).
export function Atmosphere({
  intensityRef,
}: {
  intensityRef: React.RefObject<number>;
}) {
  const points = useRef<THREE.Points>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const washTextures = useMemo(() => WASH_COLORS.map(makeWashTexture), []);
  const floorTex = useMemo(() => makeFloorTexture(), []);

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
      {/* Chão de luz quente: plano deitado sob o corredor, com perspectiva —
          dá horizonte/gravidade ao espaço branco e some na névoa ao longe. O
          parallax do ponteiro (CameraRig) desliza este plano ↔ profundidade. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -7, -46]}>
        <planeGeometry args={[240, 170]} />
        <meshBasicMaterial
          map={floorTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0.55}
        />
      </mesh>

      {/* Manchas de gradiente pastel ao longo do corredor — ambiência suave no
          lugar do grid; a paralaxe durante o dolly dá a pista de movimento. */}
      {WASHES.map(([x, y, z, scale, opacity, colorIdx], i) => (
        <sprite key={i} position={[x, y, z]} scale={[scale, scale, 1]}>
          <spriteMaterial
            map={washTextures[colorIdx]}
            transparent
            depthWrite={false}
            toneMapped={false}
            opacity={opacity}
          />
        </sprite>
      ))}

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
