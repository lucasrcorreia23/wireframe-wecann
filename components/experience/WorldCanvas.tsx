"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Atmosphere } from "./Atmosphere";
import { CameraRig, type CameraProxy } from "./CameraRig";
import { Stations } from "./Stations";
import { CAM_DIST, CAM_LIFT } from "@/lib/camera";
import { NODES } from "@/flow/graph";

// O <Canvas> persistente. Nunca remonta ao navegar — a câmera atravessa o mundo.
// frameloop="always": perf despriorizada em favor de fluidez (§3.3).
export function WorldCanvas() {
  // Proxy de câmera compartilhado entre CameraRig (escreve/copia) e, na Fase 4,
  // o timeline GSAP do goTo.
  const proxyRef = useRef<CameraProxy | null>(null);
  // Intensidade da atmosfera (0..1) durante o trânsito.
  const intensityRef = useRef<number>(0);

  const home = NODES.home.position;

  return (
    <Canvas
      frameloop="always"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      camera={{
        position: [home[0], home[1] + CAM_LIFT, home[2] + CAM_DIST],
        fov: 45,
        near: 0.1,
        far: 400,
      }}
    >
      {/* Fundo e névoa cinza — base da atmosfera. Levemente mais escuro que o
          papel das estações (#fff) para que as telas brancas "flutuem". */}
      <color attach="background" args={["#e3e3e1"]} />
      <fog attach="fog" args={["#d6d6d3", 16, 130]} />

      <Atmosphere intensityRef={intensityRef} />
      <CameraRig proxyRef={proxyRef} intensityRef={intensityRef} />
      <Stations />
    </Canvas>
  );
}
