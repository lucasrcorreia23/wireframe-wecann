import type { Vec3 } from "@/flow/types";

// Distância da câmera ao plano da estação e leve elevação (sensação editorial).
export const CAM_DIST = 8.5;
export const CAM_LIFT = 0.5;

/** Escala do <Html transform>: 1160px * SCALE ≈ largura em unidades de mundo. */
export const STATION_SCALE = 0.005;

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
