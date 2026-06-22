"use client";

import { Edges } from "@react-three/drei";
import type { FlowNode } from "@/flow/types";
import { PLACEHOLDER_W, PLACEHOLDER_H } from "@/lib/camera";

// Um plano-estação: placeholder 3D leve que marca a posição do nó no trilho −Z.
// A tela real é renderizada como overlay DOM (ActiveStationLayer), não em 3D.
export function StationPlane({
  node,
  active,
}: {
  node: FlowNode;
  active: boolean;
}) {
  return (
    <mesh position={node.position}>
      <planeGeometry args={[PLACEHOLDER_W, PLACEHOLDER_H]} />
      <meshBasicMaterial
        color={active ? "#e8e8e6" : "#f2f2f1"}
        transparent
        opacity={active ? 0.7 : 0.45}
      />
      <Edges color={active ? "#8a8a85" : "#d6d6d3"} />
    </mesh>
  );
}
