import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
  WireTable,
} from "@/components/ui";

// `prescription-renewal` — Renovação de receitas · ramo "não" do Grau 3.
export function PrescriptionRenewalScreen() {
  return (
    <ScreenShell
      zone="Pós-consulta"
      title="Renovação de receitas"
      lead="Renove em lote ou individualmente · controle especial exige confirmação."
      actions={
        <>
          <WireButton variant="secondary">Renovar individual</WireButton>
          <WireButton variant="primary">Renovar em lote</WireButton>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <WireField label="Filtro" value="Expiração ≤ 7 dias" className="col-span-2" />
        <WireField label="Tipo" value="Controle especial" />
        <WireField label="Tipo" value="Simples" />
      </div>

      <WireCard eyebrow="Lote" title="Receitas a expirar">
        <WireTable
          columns={[
            { key: "paciente", header: "Paciente" },
            { key: "medicamento", header: "Medicamento" },
            { key: "tipo", header: "Tipo" },
            { key: "expira", header: "Expira em", numeric: true, width: "120px" },
            { key: "sel", header: "", width: "40px" },
          ]}
          rows={[
            {
              paciente: "André Lobo",
              medicamento: "CBD 200mg/mL",
              tipo: <WireBadge tone="mid">Controle especial</WireBadge>,
              expira: "2 dias",
              sel: <span className="inline-block h-3.5 w-3.5 rounded-sm border-2 border-ink bg-ink" />,
            },
            {
              paciente: "Júlia Tavares",
              medicamento: "THC:CBD 1:20",
              tipo: <WireBadge>Simples</WireBadge>,
              expira: "5 dias",
              sel: <span className="inline-block h-3.5 w-3.5 rounded-sm border border-neutral-400" />,
            },
            {
              paciente: "Rui Salgado",
              medicamento: "CBD 50mg/mL",
              tipo: <WireBadge tone="mid">Controle especial</WireBadge>,
              expira: "6 dias",
              sel: <span className="inline-block h-3.5 w-3.5 rounded-sm border border-neutral-400" />,
            },
          ]}
        />
      </WireCard>

      <div className="grid grid-cols-2 gap-6">
        <WireCard eyebrow="Assinatura" title="Assinatura digital">
          <div className="flex h-24 items-center justify-center rounded-wire border border-dashed border-neutral-300 bg-paper-50">
            <span className="font-mono text-micro uppercase tracking-[0.12em] text-neutral-400">
              Assinar lote selecionado
            </span>
          </div>
        </WireCard>
        <WireCard eyebrow="Segurança" title="Confirmação p/ controle especial" emphasis>
          <p className="text-body text-neutral-700">
            2 receitas de controle especial exigem confirmação reforçada antes da
            assinatura.
          </p>
          <WireButton variant="primary" size="sm" className="mt-3">
            Confirmar controle especial
          </WireButton>
        </WireCard>
      </div>
    </ScreenShell>
  );
}
