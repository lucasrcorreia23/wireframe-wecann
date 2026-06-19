"use client";

import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow, useCanBack } from "@/flow/store";
import { NODES, GOLDEN_PATH, ZONE_LABEL } from "@/flow/graph";
import { WireButton, WireBadge, Eyebrow } from "@/components/ui";

// Stepper 2D temporário (Fase 2): percorre os nós e prova a lógica de navegação
// e os dois forks SEM 3D. Substituído pela <Experience/> na Fase 3.
export function Stepper2D() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);
  const canBack = useCanBack();

  const node = NODES[currentNode];
  const Screen = SCREENS[currentNode];
  const stepIndex = GOLDEN_PATH.indexOf(currentNode);

  // Liga os callbacks de cada tela ao store conforme o tipo de nó.
  const screenProps: ScreenProps = {};
  if (node.fork) {
    screenProps.onYes = () => goTo(node.fork!.yes.to);
    screenProps.onNo = () => goTo(node.fork!.no.to);
  }
  if (node.id === "reinforced-confirm") {
    screenProps.onConfirm = () => node.next && goTo(node.next);
    screenProps.onCancel = () => back();
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      {/* Barra de controle (temporária — substituída pelo Chrome na Fase 5) */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-neutral-200 bg-paper/90 px-8 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Eyebrow>{ZONE_LABEL[node.zone]}</Eyebrow>
          <span className="text-body font-medium text-ink">{node.title}</span>
          {node.terminus ? <WireBadge tone="hard">Terminus</WireBadge> : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-2 font-mono text-micro text-neutral-500">
            {stepIndex >= 0
              ? `${String(stepIndex + 1).padStart(2, "0")} / ${GOLDEN_PATH.length}`
              : node.id}
          </span>
          <WireButton variant="ghost" size="sm" onClick={back} >
            ← Voltar
          </WireButton>
          {node.branch ? (
            <WireButton
              variant="secondary"
              size="sm"
              onClick={() => goTo(node.branch!)}
            >
              Ramo: {NODES[node.branch].title}
            </WireButton>
          ) : null}
          {node.next && !node.fork ? (
            <WireButton
              variant="primary"
              size="sm"
              onClick={() => goTo(node.next!)}
            >
              Avançar →
            </WireButton>
          ) : null}
          {node.fork ? (
            <WireBadge tone="mid">Decisão na tela</WireBadge>
          ) : null}
        </div>
      </header>

      {/* Mini-mapa de nós (prova alcançabilidade) */}
      <nav className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 bg-paper-50 px-8 py-3">
        {(Object.keys(NODES) as Array<keyof typeof NODES>).map((id) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={
              "rounded-wire border px-2 py-1 font-mono text-micro transition-colors " +
              (id === currentNode
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink")
            }
          >
            {id}
          </button>
        ))}
      </nav>

      {/* Tela atual */}
      <main className="flex flex-1 items-start justify-center overflow-auto p-10">
        <div className="overflow-hidden rounded-wire border border-neutral-200 shadow-sm">
          <Screen {...screenProps} />
        </div>
      </main>

      <p className="px-8 pb-3 font-mono text-micro text-neutral-400">
        {canBack ? "Histórico ativo · Voltar disponível" : "Início do histórico"}
      </p>
    </div>
  );
}
