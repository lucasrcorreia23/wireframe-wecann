"use client";

import { Html, Edges } from "@react-three/drei";
import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow } from "@/flow/store";
import type { FlowNode } from "@/flow/types";
import { STATION_SCALE, PLACEHOLDER_W, PLACEHOLDER_H } from "@/lib/camera";

// Footprint do placeholder 3D (estações distantes), em unidades de mundo reais.
const PH_W = PLACEHOLDER_W;
const PH_H = PLACEHOLDER_H;

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

  // Liga forks/confirmação ao store (decisões resolvidas na própria tela §3.3).
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
      {/* Largura explícita: sem ela o wrapper CSS3D colapsa e o overflow-hidden
          recorta a tela de 1160px. As telas usam w-[1160px] (ScreenShell). */}
      <div
        style={{ width: 1160 }}
        className="station-reveal overflow-hidden rounded-wire border border-neutral-200 bg-paper shadow-[0_8px_40px_rgba(24,24,26,0.12)]"
      >
        <Screen {...props} />
      </div>
    </Html>
  );
}
