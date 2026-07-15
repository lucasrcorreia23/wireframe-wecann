"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";
import { viewScroll } from "@/lib/viewScroll";
import {
  HOME_GAP,
  HOME_ORB_SCALE,
  HOME_ORB_Y,
  HOME_SIDEBAR_W,
} from "@/lib/homeLayout";

const RADIUS = 2.1;
const DIST = 7; // distância à frente da câmera (billboard)
const ENTRY_OFFSET = 80; // quão "no fundo" o globo começa na intro (DIST + offset)

// Âncoras em NDC (x,y ∈ [-1,1]) + escala relativa.
// HOME (redesign home.png): bola menor e mais alta, no eixo da COLUNA PRINCIPAL
// — o X exato é derivado por frame da largura do viewport (ver useFrame), a
// partir das mesmas réguas do DOM (lib/homeLayout).
const HOME_ANCHOR = { x: 0.0, y: HOME_ORB_Y, scale: HOME_ORB_SCALE };
// Telas modulares de colunas simétricas: IA CENTRAL e GRANDE — cobrindo atrás
// dos módulos para o vidro "pegar" o globo (blur estilo Casuística).
const CENTER_ANCHOR = { x: 0.0, y: 0.2, scale: 1.05 };
// Demais telas: desliza para o canto superior direito, menor, alinhada ao
// "slot do globo" no AIDock.
const DOCK_ANCHOR = { x: 0.6, y: 0.42, scale: 0.44 };

// Quanto a orb sobe (em NDC) ao rolar o prontuário até a base — sai de quadro pelo
// topo conforme você "desce a câmera"; volta ao subir. Casa com o pan da CameraRig.
const SCROLL_RISE = 0.95;

// Telas onde o globo fica CENTRALIZADO e grande (colunas simétricas
// transparentes, foco na IA). A home tem âncora PRÓPRIA (HOME_ANCHOR); em todo
// o resto ele desliza para o dock (canto sup. direito). Precisa bater com o
// set MODULAR transparente que deixa o globo aparecer atrás.
const CENTERED = new Set<string>(["consult", "pre-review", "report", "casuistry"]);

// ───────── Material da bola: gradiente pastel (referência globe.png) ─────────
// Esfera LISA e brilhosa com o gradiente exato do print: menta no topo →
// branco → lavanda (lados periwinkle) → rosa → pêssego na base, miolo lavado
// de branco e borda com fade suave. A normal é amostrada em VIEW SPACE e o
// grupo billboarda a câmera → o gradiente fica sempre "em pé", estável.
// Sem tone mapping/colorspace includes: os valores são sRGB diretos do print.
const ORB_VERT = /* glsl */ `
varying vec3 vN;
void main() {
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ORB_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vN;

vec3 ramp(float t) {
  vec3 peach = vec3(0.976, 0.757, 0.549); // #f9c18c
  vec3 coral = vec3(0.953, 0.663, 0.596); // #f3a998
  vec3 pink  = vec3(0.949, 0.757, 0.786); // #f2c1c8
  vec3 lav   = vec3(0.780, 0.784, 0.937); // #c7c8ef
  vec3 white = vec3(0.988, 0.996, 0.992); // #fcfefd
  vec3 mint  = vec3(0.733, 0.914, 0.827); // #bbe9d3
  vec3 c = peach;
  c = mix(c, coral, smoothstep(0.04, 0.20, t));
  c = mix(c, pink,  smoothstep(0.20, 0.38, t));
  c = mix(c, lav,   smoothstep(0.38, 0.55, t));
  c = mix(c, white, smoothstep(0.55, 0.78, t));
  c = mix(c, mint,  smoothstep(0.80, 0.98, t));
  return c;
}

void main() {
  vec3 n = normalize(vN);
  float t = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = ramp(t);

  // Lados do terço médio puxam para periwinkle (como no print).
  float side = smoothstep(0.25, 0.9, abs(n.x)) * (1.0 - abs(n.y));
  col = mix(col, vec3(0.72, 0.73, 0.93), side * 0.25);

  // Véu leitoso global (cores menos literais) + miolo aceso voltado à câmera
  // — a esfera lê como volume translúcido iluminado por dentro.
  col = mix(col, vec3(0.995, 0.998, 0.996), 0.22);
  float facing = clamp(n.z, 0.0, 1.0);
  col = mix(col, vec3(1.0), pow(facing, 1.6) * 0.45);

  // Sheen especular suave no alto (polido/brilhoso).
  float spec = pow(max(dot(n, normalize(vec3(-0.3, 0.55, 0.78))), 0.0), 10.0);
  col += spec * 0.16;

  // Sombreado sutil na calota inferior — reforça o volume.
  float shade = smoothstep(-0.25, -1.0, n.y) * (1.0 - facing);
  col *= 1.0 - shade * 0.07;

  // Borda: fade curto do alpha — a cor "sangra" para o halo (sprite atrás).
  float rim = 1.0 - facing;
  float alpha = uOpacity * (1.0 - smoothstep(0.92, 1.0, rim));

  gl_FragColor = vec4(col, alpha);
}
`;

// Textura do halo quente: gradiente radial pêssego → transparente gerado uma
// vez em canvas 2D (sem asset externo). Vive num sprite dentro do grupo da
// bola — viaja e escala com ela.
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  g.addColorStop(0.0, "rgba(255, 189, 138, 0.9)");
  g.addColorStop(0.25, "rgba(255, 203, 158, 0.5)");
  g.addColorStop(0.55, "rgba(255, 216, 180, 0.18)");
  g.addColorStop(1.0, "rgba(255, 224, 194, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// O globo persiste e billboarda à frente da câmera: um único globo 3D que segue
// a viagem −Z e desliza centro↔direita conforme a tela. Atrás do overlay DOM
// translúcido (módulos), preservando a profundidade do mundo.
export function AiGlobe() {
  const group = useRef<THREE.Group>(null);
  const glowMat = useRef<THREE.SpriteMaterial>(null);
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const node = useFlow((s) => s.currentNode);
  const introPhase = useFlow((s) => s.introPhase);
  const invalidate = useThree((s) => s.invalidate);

  // Material do núcleo via args (parâmetros estáveis); o uniform do fade é
  // mutado todo frame ATRAVÉS do ref do material no useFrame — refs podem ser
  // mutados fora do render (React Compiler não permite mutar valores de memo).
  const orbMat = useRef<THREE.ShaderMaterial>(null);
  const orbArgs = useMemo(
    () =>
      [
        {
          uniforms: { uOpacity: { value: reduce ? 1 : 0 } },
          vertexShader: ORB_VERT,
          fragmentShader: ORB_FRAG,
          transparent: true,
        },
      ] as [THREE.ShaderMaterialParameters],
    [reduce],
  );

  const cur = useRef({ ...HOME_ANCHOR });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Estado da ENTRADA do globo (vindo do fundo). Sob reduced-motion já nasce no
  // repouso (offset 0, opaco). Na fase "text" fica longe e invisível.
  const entry = useRef({
    offset: reduce ? 0 : ENTRY_OFFSET,
    opacity: reduce ? 1 : 0,
  });

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const cam = state.camera;
    const target =
      node === "home"
        ? HOME_ANCHOR
        : CENTERED.has(node)
          ? CENTER_ANCHOR
          : DOCK_ANCHOR;
    // Na Home o X segue o eixo da coluna principal do DOM: o centro da coluna
    // fica (sidebar+gap)/2 px à esquerda do centro do viewport → em NDC,
    // -(sidebar+gap)/larguraPx. Vale para qualquer largura de janela.
    const targetX =
      node === "home"
        ? -(HOME_SIDEBAR_W + HOME_GAP) / state.size.width
        : target.x;

    // Lerp da âncora (deslize harmônico ao trocar de tela). O Y ganha a subida
    // por scroll (orb sai de quadro ao descer no prontuário; progress=0 fora dele).
    const riseY = reduce ? 0 : viewScroll.progress * SCROLL_RISE;
    const k = reduce ? 1 : 1 - Math.pow(0.0009, dt);
    cur.current.x = THREE.MathUtils.lerp(cur.current.x, targetX, k);
    cur.current.y = THREE.MathUtils.lerp(cur.current.y, target.y + riseY, k);
    cur.current.scale = THREE.MathUtils.lerp(cur.current.scale, target.scale, k);

    // ENTRADA: lerp harmônico (mesmo padrão das âncoras) do offset de distância
    // e da opacidade rumo ao alvo da fase atual. "text" → longe/invisível;
    // demais fases → perto/opaco. Aproximação de profundidade (não scale-from-0).
    const eTargetOffset = introPhase === "text" ? ENTRY_OFFSET : 0;
    const eTargetOpacity = introPhase === "text" ? 0 : 1;
    const ek = reduce ? 1 : 1 - Math.pow(0.15, dt); // ~1.5s de aproximação suave
    entry.current.offset = THREE.MathUtils.lerp(entry.current.offset, eTargetOffset, ek);
    entry.current.opacity = THREE.MathUtils.lerp(entry.current.opacity, eTargetOpacity, ek);

    // NDC → ponto no mundo a (DIST + offset) à frente da câmera; encara a câmera.
    tmp.set(cur.current.x, cur.current.y, 0.5).unproject(cam);
    tmp
      .sub(cam.position)
      .normalize()
      .multiplyScalar(DIST + entry.current.offset)
      .add(cam.position);
    g.position.copy(tmp);
    g.quaternion.copy(cam.quaternion);
    g.scale.setScalar(cur.current.scale);

    // Fade da entrada: bola (uniform do shader) + halo juntos.
    if (orbMat.current) orbMat.current.uniforms.uOpacity.value = entry.current.opacity;
    if (glowMat.current) glowMat.current.opacity = entry.current.opacity;

    invalidate();
  });

  return (
    <group ref={group}>
      {/* Halo quente: sprite radial ATRÁS do núcleo, viajando e escalando com
          o grupo. toneMapped=false preserva o pêssego exato; depthWrite=false
          evita ocluir o núcleo. Opacidade segue a entrada. */}
      <sprite position={[0, 0, -RADIUS * 1.2]} scale={[RADIUS * 9, RADIUS * 9, 1]}>
        <spriteMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </sprite>

      {/* Núcleo: esfera lisa com o gradiente pastel (shader acima). transparent
          serve o fade-in da entrada e o fade curto da borda. */}
      <mesh>
        <icosahedronGeometry args={[RADIUS, 32]} />
        <shaderMaterial ref={orbMat} args={orbArgs} />
      </mesh>
    </group>
  );
}
