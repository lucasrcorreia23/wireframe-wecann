"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import { cameraTargetFor } from "@/lib/camera";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";
import { viewScroll } from "@/lib/viewScroll";

// Quanto a câmera "desce" (unidades de mundo) quando o prontuário rola até a base.
// Move grid/partículas/névoa (fixos no mundo) → parallax de descida.
const SCROLL_PAN = 2.6;

// Proxy de câmera (§3.3): nunca tweenamos a câmera direto contra o loop do R3F.
// Mantemos { px,py,pz, tx,ty,tz }; um timeline GSAP tweena o proxy e, em useFrame,
// copiamos proxy → camera. Isso evita conflito GSAP/R3F e dá easing por trecho.
export type CameraProxy = {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
};

function setProxy(p: CameraProxy, pos: THREE.Vector3Tuple, look: THREE.Vector3Tuple) {
  p.px = pos[0];
  p.py = pos[1];
  p.pz = pos[2];
  p.tx = look[0];
  p.ty = look[1];
  p.tz = look[2];
}

/** Resolve o ease "travel" com fallback documentado (power3.inOut). */
function travelEase(): string {
  return gsap.parseEase(EASE.travel) ? EASE.travel : EASE.travelFallback;
}

export function CameraRig({
  proxyRef,
  intensityRef,
}: {
  proxyRef: React.RefObject<CameraProxy | null>;
  intensityRef: React.RefObject<number>;
}) {
  const camera = useThree((s) => s.camera);
  const currentNode = useFlow((s) => s.currentNode);
  const travelToken = useFlow((s) => s.travelToken);
  const target = useRef(cameraTargetFor(NODES.home.position));
  const reduce = useMemo(() => prefersReducedMotion(), []);
  // Offset Y amortecido dirigido pelo scroll do prontuário (viewScroll.progress).
  const scrollY = useRef(0);
  // Parallax de ponteiro amortecido (imersão): o mundo responde ao mouse; o
  // overlay DOM e a bola (ancorada em NDC) ficam parados — o fundo desliza.
  const parallax = useRef({ x: 0, y: 0 });

  // Intro (1º load): a câmera nasce JÁ em repouso na home — sem fly-in. O único
  // movimento cinematográfico da abertura é o globo se aproximando do fundo
  // (AiGlobe, orquestrado por introPhase). O fly-in das NAVEGAÇÕES entre
  // estações (travelToken > 0) segue inalterado abaixo.
  const intro = useRef({ active: false, t: 0 });
  useEffect(() => {
    const t = cameraTargetFor(NODES.home.position);
    target.current = t;
    // Inicialização do proxy (fora do render — regras de refs), em repouso.
    proxyRef.current = {
      px: t.pos[0],
      py: t.pos[1],
      pz: t.pos[2],
      tx: t.look[0],
      ty: t.look[1],
      tz: t.look[2],
    };
    intro.current = { active: false, t: 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // goTo: cada navegação (travelToken > 0) NÃO viaja mais pelo trilho −Z. A
  // câmera fica num enquadramento fixo (home) e dá só um "seek" sutil na direção
  // da diagonal da tela entrante, voltando ao repouso — uma vida de câmera sem
  // mover o mundo. Quem se move agora são as telas (ActiveStationLayer). Em
  // paralelo, pulsamos a intensidade da atmosfera para marcar a transição.
  useEffect(() => {
    if (travelToken === 0) return; // intro cuida do enquadramento inicial
    const p = proxyRef.current;
    if (!p) return;

    const home = cameraTargetFor(NODES.home.position);
    target.current = home;

    gsap.killTweensOf(p);

    if (prefersReducedMotion()) {
      // Fallback: sem dolly nem pulso; o cross-fade das telas cobre a troca.
      setProxy(p, home.pos, home.look);
      intensityRef.current = 0;
      return;
    }

    // Direção da diagonal: forward empurra +X, back espelha em −X.
    const dir = useFlow.getState().lastNav === "back" ? -1 : 1;
    const pulse = { v: 0 };
    const writeIntensity = () => {
      intensityRef.current = pulse.v;
    };

    const tl = gsap.timeline();
    // 1) Seek: pequeno nudge de dolly/pan rumo à tela entrante.
    tl.to(p, {
      px: home.pos[0] + dir * 0.6,
      py: home.pos[1] + 0.1,
      pz: home.pos[2] - 0.5,
      tx: home.look[0] + dir * 0.25,
      ty: home.look[1],
      tz: home.look[2],
      duration: DURATION.travel * 0.45,
      ease: EASE.panel,
    });
    // 2) Retorno suave ao enquadramento de repouso.
    tl.to(p, {
      px: home.pos[0],
      py: home.pos[1],
      pz: home.pos[2],
      tx: home.look[0],
      ty: home.look[1],
      tz: home.look[2],
      duration: DURATION.travel * 0.7,
      ease: travelEase(),
    });
    // Pulso da atmosfera acompanhando a transição (sobe e volta a 0).
    tl.to(pulse, { v: 0.6, duration: DURATION.travel * 0.4, ease: EASE.panel, onUpdate: writeIntensity }, 0);
    tl.to(pulse, { v: 0, duration: DURATION.travel * 0.7, ease: "power2.inOut", onUpdate: writeIntensity }, ">");

    return () => {
      tl.kill();
    };
  }, [travelToken, currentNode, proxyRef, intensityRef]);

  useFrame((state, dt) => {
    const p = proxyRef.current;
    if (!p) return;
    const t = target.current;

    // Fly-in da intro por damping (não depende do ticker do GSAP).
    if (intro.current.active) {
      const lambda = 1.9;
      const clampedDt = Math.min(dt, 0.05);
      p.px = THREE.MathUtils.damp(p.px, t.pos[0], lambda, clampedDt);
      p.py = THREE.MathUtils.damp(p.py, t.pos[1], lambda, clampedDt);
      p.pz = THREE.MathUtils.damp(p.pz, t.pos[2], lambda, clampedDt);
      intro.current.t += dt;
      // Encerra quando chega perto ou após a duração máxima da intro.
      const near = Math.abs(p.pz - t.pos[2]) < 0.05;
      if (near || intro.current.t > DURATION.intro + 0.5) {
        setProxy(p, t.pos, t.look);
        intro.current.active = false;
      }
    }
    // A intensidade da atmosfera agora é dirigida pelo pulso da timeline de
    // navegação (não mais pela distância percorrida — a câmera quase não viaja).

    // Pan vertical por scroll (imersão "descendo a câmera"): desce posição E alvo
    // juntos (pan, não tilt) por progress*SCROLL_PAN, amortecido. Em telas sem
    // prontuário o progress é 0 → volta suave ao repouso. Reduced-motion: sem pan.
    const targetScrollY = reduce ? 0 : -viewScroll.progress * SCROLL_PAN;
    scrollY.current = THREE.MathUtils.damp(scrollY.current, targetScrollY, 4, dt);

    // Parallax de ponteiro (imersão): a câmera desliza minimamente com o mouse
    // — quem "anda" na tela é o FUNDO (manchas, partículas, chão), porque a
    // bola é reancorada em NDC por frame e o overlay DOM não se move. O alvo
    // acompanha pela metade → leve rotação junto do pan. Reduced-motion: fixo.
    const px = reduce ? 0 : state.pointer.x * 0.35;
    const py = reduce ? 0 : state.pointer.y * 0.2;
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, px, 3, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, py, 3, dt);

    camera.position.set(
      p.px + parallax.current.x,
      p.py + scrollY.current + parallax.current.y,
      p.pz,
    );
    camera.lookAt(
      p.tx + parallax.current.x * 0.5,
      p.ty + scrollY.current + parallax.current.y * 0.5,
      p.tz,
    );
  });

  return null;
}
