"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { ComponentRef, Ref } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useFlow } from "@/flow/store";
import { prefersReducedMotion } from "@/lib/motion";
import { viewScroll } from "@/lib/viewScroll";

const RADIUS = 2.1;
const DIST = 7; // distância à frente da câmera (billboard)
const ENTRY_OFFSET = 80; // quão "no fundo" o globo começa na intro (DIST + offset)

// Deformação orgânica de repouso (mantida — está correta). Na fase "text" da
// intro o globo está longe/invisível, então pausamos a distorção (libera GPU).
const REST_DISTORT = 0.13;
const REST_SPEED = 1.6;

// Âncoras em NDC (x,y ∈ [-1,1]) + escala relativa. A IA (Athena) fica CENTRAL e
// GRANDE nas telas modulares de colunas transparentes — cobrindo atrás dos
// módulos para o vidro "pegar" o globo (blur estilo Casuística); nas demais
// telas desliza para o canto superior direito, menor, alinhada ao "slot do
// globo" no AIDock.
const HOME_ANCHOR = { x: 0.0, y: 0.2, scale: 1.05 };
const DOCK_ANCHOR = { x: 0.6, y: 0.42, scale: 0.44 };

// Quanto a orb sobe (em NDC) ao rolar o prontuário até a base — sai de quadro pelo
// topo conforme você "desce a câmera"; volta ao subir. Casa com o pan da CameraRig.
const SCROLL_RISE = 0.95;

// Telas onde o globo fica CENTRALIZADO (colunas simétricas transparentes, foco
// na IA). Em todo o resto ele dESLIZA para o dock (canto sup. direito). Precisa
// bater com o set MODULAR transparente que deixa o globo aparecer atrás.
const CENTERED = new Set<string>(["home", "consult", "pre-review", "report", "casuistry"]);

// O material do globo é, em runtime, o impl do MeshTransmissionMaterial (estende
// MeshPhysicalMaterial). A flag marca que já encadeamos nosso patch de vértice.
type DisplaceMaterial = THREE.MeshPhysicalMaterial & { __displacePatched?: boolean };

// Ruído simplex 3D (mesma fonte do MeshDistortMaterial do drei). Injetado no
// vertex shader via onBeforeCompile para deformar a esfera organicamente.
const SNOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
`;

// O globo persiste e billboarda à frente da câmera: um único globo 3D que segue
// a viagem −Z e desliza centro↔direita conforme a tela. Atrás do overlay DOM
// translúcido (módulos), preservando a profundidade do mundo.
export function AiGlobe() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  // MeshTransmissionMaterial estende MeshPhysicalMaterial em runtime; tipamos
  // pela base + a flag interna do patch de deslocamento (__displacePatched).
  const coreMat = useRef<DisplaceMaterial>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const centered = useFlow((s) => CENTERED.has(s.currentNode));
  const introPhase = useFlow((s) => s.introPhase);
  const invalidate = useThree((s) => s.invalidate);

  // Uniforms da deformação num ref (escape hatch mutável — são alterados todo
  // frame no useFrame; useMemo seria tratado como imutável pelo React Compiler).
  const uniforms = useRef({
    uTime: { value: 0 },
    uDistort: { value: 0 },
    uRadius: { value: 1 },
    uFreq: { value: 0.5 }, // ↑ = mais cristas (baixo = pregas bem maiores/seda)
    uRidge: { value: 0.18 }, // 0 = blob, 1 = cristas líquidas (quase puro fbm liso)
    uWarp: { value: 0.85 }, // fluxo/varredura direcional — alto = look líquido/seda
  });

  // Injeta a deformação orgânica do drei (replicada) no vertex shader do
  // material físico, ligando os uniforms ao ref. Estável (useCallback []).
  const handleBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = uniforms.current.uTime;
    shader.uniforms.uDistort = uniforms.current.uDistort;
    shader.uniforms.uRadius = uniforms.current.uRadius;
    shader.uniforms.uFreq = uniforms.current.uFreq;
    shader.uniforms.uRidge = uniforms.current.uRidge;
    shader.uniforms.uWarp = uniforms.current.uWarp;
    shader.vertexShader = `
        uniform float uTime, uRadius, uDistort, uFreq, uRidge, uWarp;
        ${SNOISE}

        // 1 oitava: só forma grande, zero ruga média (mata a textura "miolada")
        float fbm(vec3 p){
          return snoise(p);
        }
        // octave ridged: cristas direcionais tipo líquido/seda
        float ridged(vec3 p){
          float v = 0.0, a = 0.6;
          for(int i=0;i<2;i++){ v += a*(1.0 - abs(snoise(p))); p *= 2.0; a *= 0.5; }
          return v;
        }
        // campo da superfície: fbm com domain-warp (fluxo) + mistura ridged (cristas)
        float surfaceField(vec3 pos){
          vec3 t = pos * uFreq + vec3(0.0, uTime * 0.2, 0.0);
          vec3 q = vec3(fbm(t), fbm(t + 5.2), fbm(t + 9.3)); // warp
          vec3 w = t + uWarp * q;
          return mix(fbm(w), ridged(w) - 0.5, uRidge);
        }
        vec3 displace(vec3 pos){
          return pos * (uRadius + uDistort * surfaceField(pos));
        }
        ${shader.vertexShader}
      `
      // 1) Recalcula a NORMAL por diferenças finitas (luz acompanha cada crista)
      .replace(
        "#include <beginnormal_vertex>",
        `
        vec3 nDir = normalize(position);
        vec3 nT = normalize(cross(nDir, abs(nDir.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
        vec3 nB = cross(nDir, nT);
        float eps = 0.06;
        vec3 dp0 = displace(position);
        vec3 dp1 = displace(position + nT * eps);
        vec3 dp2 = displace(position + nB * eps);
        vec3 objectNormal = normalize(cross(dp1 - dp0, dp2 - dp0));
        if (dot(objectNormal, nDir) < 0.0) objectNormal = -objectNormal;
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif
        `,
      )
      // 2) Aplica a posição deslocada (reaproveita dp0)
      .replace("#include <begin_vertex>", `vec3 transformed = dp0;`);
  }, []);

  // O MeshTransmissionMaterial do drei já define um onBeforeCompile próprio (no
  // constructor) que injeta a refração/chromaticAberration no FRAGMENT shader.
  // Passar nosso onBeforeCompile como prop o SOBRESCREVERIA (quebra a
  // transmissão). Então ENCADEAMOS: chamamos o dele primeiro, depois aplicamos
  // nosso patch de VERTEX (deslocamento + recálculo de normal). Ele só mexe no
  // fragment → os includes do vertex que substituímos continuam intactos.
  useLayoutEffect(() => {
    const mat = coreMat.current;
    if (!mat || mat.__displacePatched) return;
    const base = mat.onBeforeCompile?.bind(mat);
    mat.onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms, renderer: THREE.WebGLRenderer) => {
      base?.(shader, renderer);
      handleBeforeCompile(shader);
    };
    mat.__displacePatched = true;
    mat.needsUpdate = true;
  }, [handleBeforeCompile]);

  const cur = useRef({ ...HOME_ANCHOR });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Cor amostrada pela transmissão: o drei troca scene.background por esta SÓ
  // durante o render do FBO de transmissão (MeshTransmissionMaterial.js:349),
  // restaurando depois → miolo branco/perolado SEM mudar o fundo cinza do app.
  const transmissionBg = useMemo(() => new THREE.Color("#ffffff"), []);

  // Estado da ENTRADA do globo (vindo do fundo). Sob reduced-motion já nasce no
  // repouso (offset 0, opaco). Na fase "text" fica longe e invisível.
  const entry = useRef({
    offset: reduce ? 0 : ENTRY_OFFSET,
    opacity: reduce ? 1 : 0,
  });

  // Distorção/velocidade ficam zeradas enquanto o globo não está em cena
  // ("text") — menos churn no back-buffer atrás do vidro. Repouso nas demais.
  const active = introPhase !== "text";
  const targetDistort = active ? REST_DISTORT : 0;
  const speed = active ? REST_SPEED : 0;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const cam = state.camera;
    const target = centered ? HOME_ANCHOR : DOCK_ANCHOR;

    // Lerp da âncora (deslize harmônico ao trocar de tela). O Y ganha a subida
    // por scroll (orb sai de quadro ao descer no prontuário; progress=0 fora dele).
    const riseY = reduce ? 0 : viewScroll.progress * SCROLL_RISE;
    const k = reduce ? 1 : 1 - Math.pow(0.0009, dt);
    cur.current.x = THREE.MathUtils.lerp(cur.current.x, target.x, k);
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

    // Deformação orgânica: tempo acumulado (pausa suave quando speed=0) + lerp
    // do distort. Opacidade da entrada aplicada sempre (vale sob reduced-motion).
    uniforms.current.uTime.value += dt * speed;
    uniforms.current.uDistort.value = THREE.MathUtils.lerp(
      uniforms.current.uDistort.value,
      targetDistort,
      reduce ? 1 : 1 - Math.pow(0.05, dt),
    );
    if (coreMat.current) coreMat.current.opacity = entry.current.opacity;

    if (!reduce && core.current) core.current.rotation.y += dt * 0.18;

    invalidate();
  });

  return (
    <group ref={group}>
      {/* A iluminação principal vem do env (softbox branco). Luz direta só sutil
          para dar forma (sombreado leve embaixo), sem lavar a iridescência. */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[2, 5, 3]} intensity={0.3} />

      {/* Material físico PURO (iridescência/clearcoat garantidos pelo three) +
          deformação orgânica via onBeforeCompile. `transparent` fica ligado só
          para o fade-in da entrada; em repouso opacity = 1 (opaco). O env map
          (Lightformers no root do Canvas) é o que faz a iridescência (arco-íris
          ciano/magenta/amarelo) aparecer. */}
      <mesh ref={core}>
        <icosahedronGeometry args={[RADIUS, 32]} />
        {/* MeshTransmissionMaterial (drei): a dispersão por canal R/G/B
            (chromaticAberration) + distortion gera as ONDAS de espectro contínuo
            fluindo nas cristas/borda — o look da referência. Estende o Physical,
            então iridescência/clearcoat (o "azul" da soap-bubble) continuam. O
            deslocamento de vértice é injetado via patch encadeado (useLayoutEffect
            acima). `transparent`/`opacity` seguem servindo o fade-in da entrada. */}
        <MeshTransmissionMaterial
          ref={coreMat as unknown as Ref<ComponentRef<typeof MeshTransmissionMaterial>>}
          color="#ffffff"
          background={transmissionBg}
          samples={8}
          resolution={1024}
          transmission={1}
          thickness={1.1}
          ior={1.25}
          attenuationColor="#ffffff"
          attenuationDistance={2.5}
          chromaticAberration={0.11}
          anisotropicBlur={0.1}
          distortion={0.25}
          distortionScale={0.3}
          temporalDistortion={0.1}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.15}
          iridescence={1}
          iridescenceIOR={1.45}
          iridescenceThicknessRange={[200, 700]}
          envMapIntensity={1.8}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Halo suave — neutralizado para branco (não competir com o perolado). */}
      <mesh scale={1.12}>
        <sphereGeometry args={[RADIUS, 24, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
