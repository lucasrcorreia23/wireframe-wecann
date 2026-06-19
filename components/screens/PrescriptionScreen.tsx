import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
} from "@/components/ui";
import { DecisionFork } from "./DecisionFork";

// `prescription` — Prescrição e conduta · decisão: Controle especial?
export function PrescriptionScreen({
  onYes,
  onNo,
}: {
  onYes?: () => void;
  onNo?: () => void;
}) {
  return (
    <ScreenShell
      zone="Consulta"
      title="Prescrição e conduta"
      lead="Marina Castro · receita, exames e documentos da consulta."
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <WireCard
            eyebrow="Receita"
            title="Medicamento, dose e posologia"
            aside={<WireBadge tone="mid">Interação</WireBadge>}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <WireField label="Medicamento" value="CBD 200mg/mL" />
                <WireField label="Dose" value="0,5 mL" mono />
                <WireField label="Posologia" value="2× ao dia" mono />
              </div>
              <div className="flex items-start gap-3 rounded-wire border border-neutral-400 bg-neutral-100 p-3">
                <WireBadge tone="mid">Alerta</WireBadge>
                <p className="text-caption text-neutral-700">
                  Interação potencial com amitriptilina — monitorar sedação.
                </p>
              </div>
            </div>
          </WireCard>

          <div className="grid grid-cols-2 gap-6">
            <WireCard eyebrow="Solicitação" title="Exames">
              <ul className="flex flex-col gap-2 text-body text-neutral-700">
                <li>Perfil hepático</li>
                <li>Hemograma completo</li>
              </ul>
            </WireCard>
            <WireCard eyebrow="Documentos" title="Atestado e laudo">
              <div className="flex flex-col gap-2">
                <WireButton variant="secondary" size="sm">
                  Gerar atestado
                </WireButton>
                <WireButton variant="secondary" size="sm">
                  Gerar laudo
                </WireButton>
              </div>
            </WireCard>
          </div>
        </div>

        {/* Tipo de receita + decisão */}
        <div className="flex flex-col gap-6">
          <WireCard eyebrow="Tipo de receita" title="Controle especial / simples">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 rounded-wire border-2 border-state-hard bg-neutral-100 p-3">
                <span className="h-3 w-3 rounded-full border-2 border-state-hard bg-state-hard" />
                <span className="text-body font-medium text-ink">
                  Controle especial
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-wire border border-neutral-300 p-3">
                <span className="h-3 w-3 rounded-full border border-neutral-400" />
                <span className="text-body text-neutral-600">Simples</span>
              </label>
            </div>
          </WireCard>

          <DecisionFork
            question="Controle especial?"
            yesLabel="Sim — confirmação reforçada"
            noLabel="Não — encerrar"
            onYes={onYes}
            onNo={onNo}
          />
        </div>
      </div>
    </ScreenShell>
  );
}
