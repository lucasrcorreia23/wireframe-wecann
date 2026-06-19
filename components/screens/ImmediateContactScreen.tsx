import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
} from "@/components/ui";

// `immediate-contact` — Contato e ajuste imediato · ramo "sim" do Grau 3.
export function ImmediateContactScreen() {
  return (
    <ScreenShell
      zone="Pós-consulta · crítico"
      title="Contato e ajuste imediato"
      lead="Marina Castro · Grau 3 · ação prioritária registrada."
      actions={<WireBadge tone="hard">Grau 3</WireBadge>}
    >
      <div className="grid grid-cols-2 gap-6">
        <WireCard eyebrow="Contato" title="Mensagem ao paciente" emphasis>
          <WireField
            label="Mensagem"
            area
            value="Identificamos um relato importante. Vamos ajustar sua conduta agora e entraremos em contato em seguida."
          />
          <WireButton variant="primary" size="sm" className="mt-3">
            Enviar mensagem
          </WireButton>
        </WireCard>

        <div className="flex flex-col gap-6">
          <WireCard eyebrow="Conduta" title="Ajuste de conduta">
            <div className="flex flex-col gap-3">
              <WireField label="Suspender" value="CBD 200mg/mL" mono />
              <WireField label="Orientação" value="Repouso e hidratação" />
            </div>
          </WireCard>

          <WireCard eyebrow="Registro" title="Notificação / registro">
            <div className="flex items-center justify-between rounded-wire border border-neutral-300 bg-paper-50 px-4 py-3">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                Evento registrado
              </span>
              <span className="font-mono text-caption text-neutral-700">
                #EV-2026-0619-0148
              </span>
            </div>
          </WireCard>
        </div>
      </div>
    </ScreenShell>
  );
}
