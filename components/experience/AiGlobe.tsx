"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";
import { viewScroll } from "@/lib/viewScroll";
import {
  HOME_CHAT_ORB_SCALE,
  HOME_CHAT_ORB_X,
  HOME_CHAT_ORB_Y,
  HOME_GAP,
  HOME_ORB_SCALE,
  HOME_ORB_X_SHIFT,
  HOME_ORB_Y,
  HOME_SIDEBAR_W,
} from "@/lib/homeLayout";
import { homeChat } from "@/lib/homeChat";

const RADIUS = 2.1;
const DIST = 7; // distância à frente da câmera (billboard)
// Entrada da intro: offset NEGATIVO = o globo nasce PERTO da câmera e RECUA
// até o lugar. −5 ⇒ nasce a 2u da câmera (~3.5× o tamanho final) e percorre
// uma viagem longa até encolher ao tamanho de repouso.
const ENTRY_OFFSET = -5;

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
// Esfera LISA e cristalina com o gradiente do print: menta no topo → branco →
// lavanda (lados periwinkle) → rosa → pêssego na base. Miolo LEITOSO
// concentrado; a borda SATURA e acende (fresnel) e o alpha faz um fade LONGO
// — a esfera "derrete" no glow, como na referência. Sem specular pontual
// (entregava plástico) e sem véu leitoso global (achatava o gradiente).
// A normal é amostrada em VIEW SPACE e o grupo billboarda a câmera → o
// gradiente fica sempre "em pé", estável.
// Sem tone mapping/colorspace includes: os valores são sRGB diretos do print.

// Ramp compartilhado entre o núcleo e a casca de rim — uma única fonte de
// verdade para as cores, interpolada nas duas strings GLSL.
const RAMP_GLSL = /* glsl */ `
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
`;

const ORB_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vN;
#include <fog_pars_vertex>
void main() {
  vN = normalize(normalMatrix * normal);
  // Tremor orgânico da BORDA: ondulação minúscula (~2% do raio) somada ao
  // longo da normal — três senos defasados em frequências primas = silhueta
  // viva, sem parecer "geleia". uTime fica em 0 sob reduced-motion.
  float w = sin(position.y * 3.1 + uTime * 1.6)
          * sin(position.x * 2.7 + uTime * 1.1)
          * sin(position.z * 3.3 + uTime * 1.3);
  vec3 p = position + normal * w * 0.05;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const ORB_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vN;
#include <fog_pars_fragment>
${RAMP_GLSL}
void main() {
  vec3 n = normalize(vN);
  float t = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = ramp(t);

  // Lados do terço médio puxam para periwinkle (como no print).
  float side = smoothstep(0.25, 0.9, abs(n.x)) * (1.0 - abs(n.y));
  col = mix(col, vec3(0.72, 0.73, 0.93), side * 0.25);

  float facing = clamp(n.z, 0.0, 1.0);
  float fresnel = 1.0 - facing;

  // Borda ACESA: satura e soma a própria cor do ramp no rim
  // (luz vazando pelas laterais — o "vidro" da referência).
  vec3 vivid = clamp((col - 0.5) * 1.55 + 0.5, 0.0, 1.0);
  col = mix(col, vivid, smoothstep(0.2, 0.9, fresnel));
  col += ramp(t) * pow(fresnel, 2.0) * 0.4;

  // Miolo leitoso: concentrado (pow alto), sem véu global.
  col = mix(col, vec3(1.0), pow(facing, 3.0) * 0.6);

  // Sombreado sutil na calota inferior — reforça o volume.
  float shade = smoothstep(-0.25, -1.0, n.y) * fresnel;
  col *= 1.0 - shade * 0.05;

  // Fade LONGO da borda — a esfera derrete no glow (casca + halo atrás).
  float alpha = uOpacity * (1.0 - smoothstep(0.68, 1.0, fresnel));

  gl_FragColor = vec4(col, alpha);
  #include <fog_fragment>
}
`;

// Fragment da CASCA de rim: só a cor do ramp, visível apenas no rim, additive.
// Renderiza num mesh BackSide levemente maior que o núcleo → vira o anel de
// luz menta/coral que abraça a esfera e acompanha o gradiente automaticamente.
const RIM_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vN;
#include <fog_pars_fragment>
${RAMP_GLSL}
void main() {
  vec3 n = normalize(vN);
  float t = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
  float facing = clamp(abs(n.z), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.5);
  gl_FragColor = vec4(ramp(t) * rim * 0.8, rim * uOpacity);
  #include <fog_fragment>
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
  // Halo SUAVE (redesign 16/07/2026): levemente laranjado no miolo esvaindo
  // em roxo na borda — discreto, a página segue branca.
  g.addColorStop(0.0, "rgba(255, 200, 150, 0.4)"); // laranja suave
  g.addColorStop(0.35, "rgba(247, 174, 148, 0.18)"); // laranja→rosado
  g.addColorStop(0.7, "rgba(179, 136, 235, 0.1)"); // roxo suave
  g.addColorStop(1.0, "rgba(179, 136, 235, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// "Sombra" de contato: elipse com o GRADIENTE da marca (Figma: azul → azul
// claro → coral → laranja) esvaindo nas bordas — mais um reflexo de luz
// colorida no chão do que sombra. Renderizada a 30% de opacidade.
function makeShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const lin = ctx.createLinearGradient(0, 0, size, 0);
  lin.addColorStop(0.1, "#588dff");
  lin.addColorStop(0.26, "#96adff");
  lin.addColorStop(0.58, "#f36350");
  lin.addColorStop(0.96, "#f3ac50");
  ctx.fillStyle = lin;
  ctx.fillRect(0, 0, size, size);
  // Máscara elíptica: miolo pleno, bordas esvaídas.
  const mask = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  mask.addColorStop(0.0, "rgba(255, 255, 255, 1)");
  mask.addColorStop(0.55, "rgba(255, 255, 255, 0.55)");
  mask.addColorStop(1.0, "rgba(255, 255, 255, 0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = mask;
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
  const shadowMat = useRef<THREE.SpriteMaterial>(null);
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const shadowTex = useMemo(() => makeShadowTexture(), []);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const node = useFlow((s) => s.currentNode);
  const introPhase = useFlow((s) => s.introPhase);
  const invalidate = useThree((s) => s.invalidate);

  // Materiais via args (parâmetros estáveis); o uniform do fade é mutado todo
  // frame ATRAVÉS do ref do material no useFrame — refs podem ser mutados fora
  // do render (React Compiler não permite mutar valores de memo).
  const orbMat = useRef<THREE.ShaderMaterial>(null);
  const orbArgs = useMemo(
    () =>
      [
        {
          // UniformsLib.fog + fog:true — combinação exigida pelo renderer para
          // alimentar fogColor/fogNear/fogFar num ShaderMaterial. É o que faz
          // o núcleo emergir da névoa na intro (IntroFog).
          uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.fog,
            { uOpacity: { value: reduce ? 1 : 0 }, uTime: { value: 0 } },
          ]),
          vertexShader: ORB_VERT,
          fragmentShader: ORB_FRAG,
          transparent: true,
          fog: true,
        },
      ] as [THREE.ShaderMaterialParameters],
    [reduce],
  );

  // Casca de rim glow: BackSide + additive, mesma malha um pouco maior.
  // Também recebe fog (ORB_VERT tem os includes) — some na névoa da intro
  // junto com o núcleo.
  const rimMat = useRef<THREE.ShaderMaterial>(null);
  const rimArgs = useMemo(
    () =>
      [
        {
          uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.fog,
            { uOpacity: { value: reduce ? 1 : 0 }, uTime: { value: 0 } },
          ]),
          vertexShader: ORB_VERT,
          fragmentShader: RIM_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          fog: true,
        },
      ] as [THREE.ShaderMaterialParameters],
    [reduce],
  );

  const cur = useRef({ ...HOME_ANCHOR });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Estado da ENTRADA do globo (gigante → recua ao lugar). Sob reduced-motion
  // já nasce no repouso (offset 0, opaco). Na fase "text" fica invisível.
  const entry = useRef({
    offset: reduce ? 0 : ENTRY_OFFSET,
    opacity: reduce ? 1 : 0,
  });
  // A curva da intro roda uma única vez, até a chegada real (p ≈ 1).
  const entryDone = useRef(reduce);

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
    // Na Home o X parte do eixo da coluna principal do DOM (o centro da coluna
    // fica (sidebar+gap)/2 px à esquerda do centro do viewport → em NDC,
    // -(sidebar+gap)/larguraPx) e ganha o deslocamento para a ESQUERDA
    // (HOME_ORB_X_SHIFT) — a saudação vive à direita da bola.
    let targetX =
      node === "home"
        ? -(HOME_SIDEBAR_W + HOME_GAP) / state.size.width + HOME_ORB_X_SHIFT
        : target.x;
    let targetY = target.y;
    let targetScale = target.scale;

    // Modo CHAT da Home: o globo deixa o hero e vai "iluminar o canto" da pill.
    // O alvo vem da MEDIÇÃO do DOM da pill do último turno (QuestionPill →
    // lib/homeChat, px de viewport → NDC); fallback nas réguas do mock até a 1ª
    // medição. O deslize continua sendo o lerp harmônico de sempre.
    const chatActive = node === "home" && homeChat.phase !== "idle";
    if (chatActive) {
      const ax =
        homeChat.anchorX || (HOME_CHAT_ORB_X / 1440) * state.size.width;
      const ay =
        homeChat.anchorY || (HOME_CHAT_ORB_Y / 810) * state.size.height;
      targetX = (ax / state.size.width) * 2 - 1;
      targetY = 1 - (ay / state.size.height) * 2;
      targetScale = HOME_CHAT_ORB_SCALE;
    }

    // Lerp da âncora (deslize harmônico ao trocar de tela). O Y ganha a subida
    // por scroll (orb sai de quadro ao descer no prontuário; progress=0 fora dele).
    // No chat o scroll do prontuário não sobe a orb (ela pertence à pill).
    const riseY =
      reduce || chatActive ? 0 : viewScroll.progress * SCROLL_RISE;
    const k = reduce ? 1 : 1 - Math.pow(0.0009, dt);
    cur.current.x = THREE.MathUtils.lerp(cur.current.x, targetX, k);
    cur.current.y = THREE.MathUtils.lerp(cur.current.y, targetY + riseY, k);
    cur.current.scale = THREE.MathUtils.lerp(cur.current.scale, targetScale, k);

    // ENTRADA: lerp harmônico (mesmo padrão das âncoras) do offset de distância
    // e da opacidade rumo ao alvo da fase atual. "text" → gigante/invisível
    // (perto da câmera); demais fases → recua e assenta no lugar, enquanto a
    // névoa do mundo (IntroFog) clareia atrás. A opacidade materializa o
    // "fantasma" gigante em ~0.5s; o recuo leva ~1.5s.
    const eTargetOffset = introPhase === "text" ? ENTRY_OFFSET : 0;
    const eTargetOpacity = introPhase === "text" ? 0 : 1;
    const ek = reduce ? 1 : 1 - Math.pow(0.18, dt); // viagem ágil, final resolvido (~1.8s)
    const ekOpacity = reduce ? 1 : 1 - Math.pow(0.1, dt); // ~0.5s
    entry.current.offset = THREE.MathUtils.lerp(entry.current.offset, eTargetOffset, ek);
    entry.current.opacity = THREE.MathUtils.lerp(entry.current.opacity, eTargetOpacity, ekOpacity);

    // TRAJETÓRIA DA INTRO (Home): uma única curva natural — nasce no CENTRO
    // (grande), e conforme recua (progresso p da chegada) desliza para a
    // esquerda com leve arco vertical, assentando no lugar. O desvio começa
    // devagar (p²) e o arco (seno) sobe ~0.05 NDC no meio do caminho e zera na
    // chegada. A curva vive até a chegada REAL (p ≈ 1), independente da fase
    // da intro — na entrega, coincide com a âncora e o lerp normal assume.
    if (!entryDone.current) {
      if (node !== "home") {
        entryDone.current = true; // navegou no meio da intro — encerra a curva
      } else {
        const p = THREE.MathUtils.clamp(
          1 - entry.current.offset / ENTRY_OFFSET,
          0,
          1,
        );
        if (p >= 0.995) {
          entryDone.current = true;
        } else {
          cur.current.x = targetX * (p * p);
          cur.current.y = HOME_ORB_Y + Math.sin(p * Math.PI) * 0.05;
        }
      }
    }

    // NDC → ponto no mundo a (DIST + offset) à frente da câmera; encara a câmera.
    tmp.set(cur.current.x, cur.current.y, 0.5).unproject(cam);
    tmp
      .sub(cam.position)
      .normalize()
      .multiplyScalar(DIST + entry.current.offset)
      .add(cam.position);
    g.position.copy(tmp);
    g.quaternion.copy(cam.quaternion);

    // Vida em repouso: a esfera NÃO se desloca (a sombra ficava se mexendo
    // junto) — a vida vem do tremor da borda (ORB_VERT) e da "respiração" de
    // escala. Reduced-motion: estático.
    if (!reduce) {
      const tNow = state.clock.elapsedTime;
      // Tremor da borda (ver ORB_VERT): núcleo e casca ondulam juntos.
      if (orbMat.current) orbMat.current.uniforms.uTime.value = tNow;
      if (rimMat.current) rimMat.current.uniforms.uTime.value = tNow;
    }
    const breath = reduce ? 1 : 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.012;
    g.scale.setScalar(cur.current.scale * breath);

    // Fade da entrada × visibilidade do chat: no chat o globo segue a pill e
    // DISSOLVE junto dela nas zonas de fade do scroller (anchorAlpha publicado
    // pela QuestionPill) — nunca passa sobre o header.
    const vis =
      entry.current.opacity * (chatActive ? homeChat.anchorAlpha : 1);
    if (orbMat.current) orbMat.current.uniforms.uOpacity.value = vis;
    if (rimMat.current) rimMat.current.uniforms.uOpacity.value = vis;
    if (glowMat.current) glowMat.current.opacity = vis;
    if (shadowMat.current) shadowMat.current.opacity = vis * 0.3;

    invalidate();
  });

  return (
    <group ref={group}>
      {/* Sombra de contato: elipse escura suave ABAIXO da bola — ancora o
          globo no espaço e dá leitura 3D ao fundo branco. Viaja/escala com o
          grupo; some na névoa (fog padrão do SpriteMaterial). */}
      <sprite position={[0, -RADIUS * 1.7, -RADIUS * 0.4]} scale={[RADIUS * 3.4, RADIUS * 0.9, 1]}>
        <spriteMaterial
          ref={shadowMat}
          map={shadowTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </sprite>

      {/* Halo laranja→roxo: sprite radial ATRÁS do núcleo, viajando e escalando
          com o grupo. toneMapped=false preserva as cores exatas; depthWrite=false
          evita ocluir o núcleo. Escala RADIUS*7 — contido junto do globo, some
          antes de tingir a página (redesign 16/07/2026). */}
      <sprite position={[0, 0, -RADIUS * 1.2]} scale={[RADIUS * 7, RADIUS * 7, 1]}>
        <spriteMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </sprite>

      {/* Casca additive: rim glow colorido que acompanha o gradiente da esfera
          (menta no topo, coral embaixo). BackSide + escala 1.12 → anel de luz
          colado na silhueta, atrás do núcleo. */}
      <mesh scale={1.12}>
        <icosahedronGeometry args={[RADIUS, 32]} />
        <shaderMaterial ref={rimMat} args={rimArgs} />
      </mesh>

      {/* Núcleo: esfera lisa com o gradiente pastel cristalino (shader acima).
          transparent serve o fade-in da entrada e o fade longo da borda. */}
      <mesh>
        <icosahedronGeometry args={[RADIUS, 32]} />
        <shaderMaterial ref={orbMat} args={orbArgs} />
      </mesh>
    </group>
  );
}