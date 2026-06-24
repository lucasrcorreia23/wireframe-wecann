"use client";

import { Suspense, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { ComponentRef, Ref } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

const RADIUS = 2.1;

// Deformação orgânica de repouso (idêntica ao globo original — só o cenário muda).
const REST_DISTORT = 0.13;
const REST_SPEED = 1.6;

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

// Globo iridescente CONTIDO: o mesmo look do mundo 3D (MeshTransmissionMaterial +
// deformação por vértice + iridescência do env), porém parado na origem encarando
// uma câmera fixa. Sem billboard/anchors/scroll/intro — vive dentro do painel da IA.
function ContainedGlobe() {
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<DisplaceMaterial>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const invalidate = useThree((s) => s.invalidate);

  // Uniforms da deformação num ref (escape hatch mutável — alterados todo frame).
  const uniforms = useRef({
    uTime: { value: 0 },
    uDistort: { value: 0 },
    uRadius: { value: 1 },
    uFreq: { value: 0.5 },
    uRidge: { value: 0.18 },
    uWarp: { value: 0.85 },
  });

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

        float fbm(vec3 p){
          return snoise(p);
        }
        float ridged(vec3 p){
          float v = 0.0, a = 0.6;
          for(int i=0;i<2;i++){ v += a*(1.0 - abs(snoise(p))); p *= 2.0; a *= 0.5; }
          return v;
        }
        float surfaceField(vec3 pos){
          vec3 t = pos * uFreq + vec3(0.0, uTime * 0.2, 0.0);
          vec3 q = vec3(fbm(t), fbm(t + 5.2), fbm(t + 9.3));
          vec3 w = t + uWarp * q;
          return mix(fbm(w), ridged(w) - 0.5, uRidge);
        }
        vec3 displace(vec3 pos){
          return pos * (uRadius + uDistort * surfaceField(pos));
        }
        ${shader.vertexShader}
      `
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
      .replace("#include <begin_vertex>", `vec3 transformed = dp0;`);
  }, []);

  // O MeshTransmissionMaterial já define onBeforeCompile próprio (fragment:
  // refração/chromaticAberration). ENCADEAMOS: chamamos o dele e depois aplicamos
  // nosso patch de VERTEX (deslocamento + recálculo de normal).
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

  // Cor amostrada pela transmissão (miolo perolado) — o drei troca o background do
  // FBO de transmissão por esta e restaura depois.
  const transmissionBg = useMemo(() => new THREE.Color("#ffffff"), []);

  // Fade-in suave de entrada (opacity 0→1). Sob reduced-motion já nasce opaco.
  const opacity = useRef(reduce ? 1 : 0);

  useFrame((_, dt) => {
    const targetDistort = REST_DISTORT;
    uniforms.current.uTime.value += dt * REST_SPEED;
    uniforms.current.uDistort.value = THREE.MathUtils.lerp(
      uniforms.current.uDistort.value,
      targetDistort,
      reduce ? 1 : 1 - Math.pow(0.05, dt),
    );

    opacity.current = THREE.MathUtils.lerp(opacity.current, 1, reduce ? 1 : 1 - Math.pow(0.1, dt));
    if (coreMat.current) coreMat.current.opacity = opacity.current;

    if (!reduce && core.current) core.current.rotation.y += dt * 0.18;

    // Sob reduced-motion renderiza uma vez e para; senão sustenta o loop (demand).
    if (!reduce) invalidate();
  });

  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={[2, 5, 3]} intensity={0.3} />

      <mesh ref={core}>
        <icosahedronGeometry args={[RADIUS, 32]} />
        <MeshTransmissionMaterial
          ref={coreMat as unknown as Ref<ComponentRef<typeof MeshTransmissionMaterial>>}
          color="#ffffff"
          background={transmissionBg}
          samples={6}
          resolution={512}
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
          opacity={0}
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

// Canvas pequeno e CONTIDO (vive dentro do painel da IA). `alpha:true` + sem
// `background`/`fog` → fundo transparente (o vidro do painel aparece atrás). A
// receita de iridescência (HDRI de estúdio + Lightformers coloridos) é a mesma do
// mundo 3D antigo — é ela que faz o arco-íris ciano/magenta/amarelo existir.
export function AthenaGlobeCanvas() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
      }}
      camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 100 }}
    >
      <Suspense fallback={null}>
        <Environment files="/hdri/studio.hdr" environmentIntensity={1.0}>
          <Lightformer form="rect" intensity={4} color="#22d3ff" position={[-3.5, 1.5, 3]} scale={[2.5, 6, 1]} />
          <Lightformer form="rect" intensity={4} color="#ff3df0" position={[3.5, -0.5, 3]} scale={[2.5, 6, 1]} />
          <Lightformer form="rect" intensity={3} color="#ffd23d" position={[0, -3.5, 3]} scale={[6, 2.5, 1]} />
        </Environment>
      </Suspense>

      <ContainedGlobe />
    </Canvas>
  );
}
