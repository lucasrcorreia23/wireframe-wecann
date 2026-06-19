import { Eyebrow, WireButton } from "@/components/ui";

// Controle de decisão embutido na própria Screen (§3.3, §6): o toggle do fork
// chama goTo do ramo. Os callbacks são ligados ao store na Fase 2/4.
export function DecisionFork({
  question,
  yesLabel,
  noLabel,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  noLabel: string;
  onYes?: () => void;
  onNo?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-wire border-2 border-neutral-400 bg-paper p-5">
      <Eyebrow>Decisão</Eyebrow>
      <p className="font-display text-title font-medium text-ink">{question}</p>
      <div className="mt-1 flex flex-col gap-2">
        <WireButton variant="primary" onClick={onYes}>
          {yesLabel}
        </WireButton>
        <WireButton variant="secondary" onClick={onNo}>
          {noLabel}
        </WireButton>
      </div>
    </div>
  );
}
