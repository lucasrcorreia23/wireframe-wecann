import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
} from "@/components/ui";
import { DecisionFork } from "./DecisionFork";

// `clinical-safety` — Segurança clínica · decisão: Grau 3 (crítico)?
export function ClinicalSafetyScreen({
  onYes,
  onNo,
}: {
  onYes?: () => void;
  onNo?: () => void;
}) {
  const reports = [
    { paciente: "Marina Castro", grau: "Grau 3", tone: "hard" as const, relato: "Sonolência intensa e queda relatada." },
    { paciente: "Rui Salgado", grau: "Grau 2", tone: "mid" as const, relato: "Náusea persistente após aumento de dose." },
    { paciente: "André Lobo", grau: "Grau 1", tone: "soft" as const, relato: "Boca seca leve, sem impacto funcional." },
  ];

  return (
    <ScreenShell
      zone="Pós-consulta"
      title="Segurança clínica"
      lead="Relatos ordenados por criticidade · escala validada de segurança (PROM)."
      actions={<WireField label="Filtro" value="Por gravidade (Grau 1/2/3)" className="w-64" />}
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          {reports.map((r) => (
            <WireCard
              key={r.paciente}
              emphasis={r.tone === "hard"}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <WireBadge tone={r.tone}>{r.grau}</WireBadge>
                <div className="flex flex-col gap-1">
                  <span className="text-title font-medium text-ink">
                    {r.paciente}
                  </span>
                  <span className="text-body text-neutral-600">{r.relato}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <WireButton variant="secondary" size="sm">
                  Ajustar conduta
                </WireButton>
                <WireButton variant="ghost" size="sm">
                  Contatar paciente
                </WireButton>
              </div>
            </WireCard>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <WireCard eyebrow="PROM" title="Escala de segurança">
            <div className="flex items-end justify-between gap-2">
              {[2, 3, 5, 4, 6, 8].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-sm bg-neutral-300"
                  style={{ height: `${h * 8}px` }}
                />
              ))}
            </div>
            <p className="mt-3 text-caption text-neutral-500">
              Tendência de eventos nas últimas 6 semanas.
            </p>
          </WireCard>

          <DecisionFork
            question="Grau 3 (crítico)?"
            yesLabel="Sim — contato imediato"
            noLabel="Não — renovação de receitas"
            onYes={onYes}
            onNo={onNo}
          />
        </div>
      </div>
    </ScreenShell>
  );
}
