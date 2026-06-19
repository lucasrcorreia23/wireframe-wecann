import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
} from "@/components/ui";

// `reinforced-confirm` — Confirmação reforçada · ramo "sim" de controle especial.
export function ReinforcedConfirmScreen({
  onConfirm,
  onCancel,
}: {
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  return (
    <ScreenShell
      zone="Consulta · ação sensível"
      title="Confirmação reforçada"
      lead="Prescrição de controle especial exige confirmação explícita."
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <WireCard emphasis className="border-state-hard">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <WireBadge tone="hard">Ação sensível</WireBadge>
              <span className="text-body text-neutral-600">
                Receita de controle especial — CBD 200mg/mL
              </span>
            </div>
            <p className="text-body-l text-neutral-700">
              Você está prestes a emitir uma receita de controle especial. Esta
              ação é registrada e auditada.
            </p>
            <div className="flex items-center justify-between rounded-wire border border-neutral-300 bg-paper-50 px-4 py-3">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                Registro de auditoria
              </span>
              <span className="font-mono text-caption text-neutral-700">
                #AUD-2026-0619-0093
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <WireButton variant="secondary" onClick={onCancel}>
                Cancelar
              </WireButton>
              <WireButton variant="primary" onClick={onConfirm}>
                Confirmar prescrição
              </WireButton>
            </div>
          </div>
        </WireCard>
      </div>
    </ScreenShell>
  );
}
