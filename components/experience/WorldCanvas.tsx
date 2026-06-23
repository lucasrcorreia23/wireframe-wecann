"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Atmosphere } from "./Atmosphere";
import { CameraRig, type CameraProxy } from "./CameraRig";
import { Stations } from "./Stations";
import { AiGlobe } from "./AiGlobe";
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
      // NeutralToneMapping (Khronos PBR Neutral): preserva a SATURAÇÃO dos
      // reflexos (o ACES padrão lava as cores → globo "preto e branco"). Só
      // afeta o canvas 3D (atmosfera/grid cinzas mudam de forma imperceptível);
      // as telas DOM (vidro/texto) NÃO passam pelo tone mapping.
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.NeutralToneMapping,
      }}
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

      {/* Environment map — é ele que faz a iridescência/clearcoat do globo
          existirem (reflexos arco-íris que mudam com o ângulo). Rig de
          Lightformers LOCAL (sem preset/CDN, funciona offline). NÃO setamos
          `background` para preservar o fundo cinza e a névoa acima. */}
      {/* Environment map — HDRI de estúdio real (CC0, empacotado em public/hdri)
          alimenta a iridescência/clearcoat do globo: softboxes reais + entorno
          escuro = o contraste que faz as bandas arco-íris aparecerem. SEM CDN
          em runtime (arquivo local). NÃO setamos `background` → preserva o fundo
          cinza e a névoa. Suspense pois o load do .hdr é assíncrono. */}
      <Suspense fallback={null}>
        <Environment files="/hdri/studio.hdr" environmentIntensity={1.0}>
          {/* HDRI branco = corpo perolado. Por cima, FAIXAS coloridas SATURADAS e
              PRÓXIMAS (z=3) — a fonte real do arco-íris: a iridescência/reflexo só
              tinge ciano/magenta/amarelo se houver luz colorida pra refletir. Com a
              superfície agora "seda", a cor não empoça mais em blocos. Sem `background`
              → fundo cinza preservado. Levers: intensity (↑ cor) e Z (perto = saturado). */}
          <Lightformer form="rect" intensity={4} color="#22d3ff" position={[-3.5, 1.5, 3]} scale={[2.5, 6, 1]} />
          <Lightformer form="rect" intensity={4} color="#ff3df0" position={[3.5, -0.5, 3]} scale={[2.5, 6, 1]} />
          <Lightformer form="rect" intensity={3} color="#ffd23d" position={[0, -3.5, 3]} scale={[6, 2.5, 1]} />
        </Environment>
      </Suspense>

      <Atmosphere intensityRef={intensityRef} />
      <CameraRig proxyRef={proxyRef} intensityRef={intensityRef} />
      <AiGlobe />
      <Stations />
    </Canvas>
  );
}
