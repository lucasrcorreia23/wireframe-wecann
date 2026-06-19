"use client";

import { Html, Edges } from "@react-three/drei";
import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow } from "@/flow/store";
import type { FlowNode } from "@/flow/types";
import { STATION_SCALE } from "@/lib/camera";

// Footprint do placeholder 3D (estações distantes), em unidades de mundo.
const PH_W = 1160 * STATION_SCALE;
const PH_H = 760 * STATION_SCALE;

// Um plano-estação. Quando `mounted` (ativa + adjacente §5/armadilha 5), monta o
// Screen real via <Html transform>. Caso contrário, um placeholder leve mantém o
// trilho visível sem o custo de DOM 3D.
export function StationPlane({
  node,
  mounted,
  active,
}: {
  node: FlowNode;
  mounted: boolean;
  active: boolean;
}) {
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);

  if (!mounted) {
    return (
      <mesh position={node.position}>
        <planeGeometry args={[PH_W, PH_H]} />
        <meshBasicMaterial color="#f2f2f1" transparent opacity={0.55} />
        {/* moldura hairline */}
        <Edges color="#d6d6d3" />
      </mesh>
    );
  }

  const Screen = SCREENS[node.id];

  // Liga forks/confirmação ao store (mesma lógica do Stepper2D).
  const props: ScreenProps = {};
  if (node.fork) {
    props.onYes = () => goTo(node.fork!.yes.to);
    props.onNo = () => goTo(node.fork!.no.to);
  }
  if (node.id === "reinforced-confirm") {
    props.onConfirm = () => node.next && goTo(node.next);
    props.onCancel = () => back();
  }

  return (
    <Html
      transform
      center
      position={node.position}
      scale={STATION_SCALE}
      // Só a estação ativa recebe cliques; vizinhas montadas não interceptam.
      pointerEvents={active ? "auto" : "none"}
      zIndexRange={[10, 0]}
      occlude={false}
      wrapperClass="station-html"
    >
      <div className="station-reveal overflow-hidden rounded-wire border border-neutral-200 bg-paper shadow-[0_1px_2px_rgba(24,24,26,0.04)]">
        <Screen {...props} />
      </div>
    </Html>
  );
}
