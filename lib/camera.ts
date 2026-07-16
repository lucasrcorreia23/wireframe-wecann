import type { Vec3 } from "@/flow/types";

// Distância da câmera ao plano da estação e leve elevação (sensação editorial).
export const CAM_DIST = 8.5;
export const CAM_LIFT = 0.5;

/** Escala do <Html transform> da estação. O `scale` do Html transform do drei
 *  renderiza bem menor que unidades de mundo equivalentes; calibrado empiricamente
 *  (modo ?still, repouso em CAM_DIST) para a tela preencher o viewport. */
export const STATION_SCALE = 0.16;

/** Footprint do placeholder 3D (estações distantes) em UNIDADES DE MUNDO reais —
 *  base diferente do STATION_SCALE do Html. Mantém os planos distantes discretos. */
export const PLACEHOLDER_W = 2.6;
export const PLACEHOLDER_H = 1.7;

export type CameraTarget = {
  pos: Vec3; // posição da câmera
  look: Vec3; // alvo do lookAt
};

/** Enquadramento da câmera para um plano de estação centrado em `position`. */
export function cameraTargetFor(position: Vec3): CameraTarget {
  const [x, y, zc] = position;
  return {
    pos: [x, y + CAM_LIFT, zc + CAM_DIST],
    look: [x, y, zc],
  };
}
