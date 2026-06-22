"use client";

import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import { WireButton } from "@/components/ui";
import { cn } from "@/lib/cn";

// Telas que adotam o layout modular (módulos flutuam sobre o mundo 3D, sem o
// card fosco único). As demais mantêm o card fosco contido.
const MODULAR = new Set<string>([
  "home",
  "agenda",
  "messages",
  "patients",
  "utilities",
  "pre-review",
  "consult",
  "report",
]);

// Overlay DOM 1:1 da estação ativa — nítido, centralizado, acima do canvas.
// O mundo 3D (globo + atmosfera + planos) viaja atrás; aqui a UI fica fixa.
export function ActiveStationLayer() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);

  const node = NODES[currentNode];
  const Screen = SCREENS[currentNode];
  const isModular = MODULAR.has(currentNode);

  // Liga forks/confirmação/avanço ao store (decisões resolvidas na própria tela).
  const props: ScreenProps = {};
  if (node.fork) {
    props.onYes = () => goTo(node.fork!.yes.to);
    props.onNo = () => goTo(node.fork!.no.to);
  }
  if (node.id === "reinforced-confirm") {
    props.onConfirm = () => node.next && goTo(node.next);
    props.onCancel = () => back();
  }
  if (node.next) props.onContinue = () => goTo(node.next!);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-[3vw] py-20">
      <div
        key={currentNode}
        className={cn(
          "station-reveal station-sharp pointer-events-auto w-full max-w-[1240px]",
          isModular
            ? "bg-transparent"
            : cn(
                "overflow-hidden rounded-[40px] border border-white/50 bg-white/55",
                "shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl",
                "no-scrollbar max-h-[88vh] overflow-y-auto",
              ),
        )}
      >
        <Screen {...props} />

        {/* Avanço do caminho-ouro embutido na própria tela (sem barra flutuante).
            Telas modulares trazem seus próprios CTAs; forks resolvem na tela. */}
        {!isModular && node.next && !node.fork ? (
          <div className="flex justify-end border-t border-neutral-200 bg-white/40 px-12 py-5">
            <WireButton variant="primary" onClick={() => goTo(node.next!)}>
              Continuar → {NODES[node.next].title}
            </WireButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
