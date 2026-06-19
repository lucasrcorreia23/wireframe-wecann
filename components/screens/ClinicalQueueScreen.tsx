import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
} from "@/components/ui";

// `clinical-queue` — Fila de dúvidas clínicas · ramo de `home`.
export function ClinicalQueueScreen() {
  const items = [
    {
      paciente: "Rui Salgado",
      assunto: "Ajuste de dose — CBD 200mg",
      sla: "02:10",
      tone: "hard" as const,
      slaLabel: "SLA crítico",
    },
    {
      paciente: "Júlia Tavares",
      assunto: "Dúvida sobre interação com sertralina",
      sla: "06:40",
      tone: "mid" as const,
      slaLabel: "SLA em atenção",
    },
    {
      paciente: "André Lobo",
      assunto: "Renovação de receita controlada",
      sla: "23:55",
      tone: "soft" as const,
      slaLabel: "SLA folgado",
    },
  ];

  return (
    <ScreenShell
      zone="Pré-consulta · ramo"
      title="Fila de dúvidas clínicas"
      lead="Itens encaminhados pela secretária, ordenados por urgência."
      actions={<WireField label="Filtro" value="Por urgência (SLA)" className="w-56" />}
    >
      <div className="flex flex-col gap-4">
        {items.map((it) => (
          <WireCard
            key={it.paciente}
            emphasis={it.tone === "hard"}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex flex-1 items-center gap-6">
              <div className="flex w-24 flex-col gap-1">
                <span className="font-mono text-title tabular-nums text-ink">
                  {it.sla}
                </span>
                <WireBadge tone={it.tone}>{it.slaLabel}</WireBadge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-title font-medium text-ink">
                  {it.paciente}
                </span>
                <span className="text-body text-neutral-600">{it.assunto}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <WireButton variant="ghost" size="sm">
                Agendar
              </WireButton>
              <WireButton variant="secondary" size="sm">
                Converter em conduta
              </WireButton>
              <WireButton variant="primary" size="sm">
                Responder
              </WireButton>
            </div>
          </WireCard>
        ))}
      </div>
    </ScreenShell>
  );
}
