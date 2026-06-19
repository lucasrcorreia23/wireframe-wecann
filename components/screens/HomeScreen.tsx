import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
  WireTable,
  Stat,
} from "@/components/ui";

// `home` — Painel do dia (Home / Agenda) · entrada.
export function HomeScreen() {
  return (
    <ScreenShell
      zone="Pré-consulta"
      title="Painel do dia"
      lead="Bom dia, Dra. Helena — quinta, 19 de junho. Você tem 7 compromissos hoje."
      actions={
        <>
          <WireButton variant="secondary">Ver anamnese</WireButton>
          <WireButton variant="primary">Abrir consulta</WireButton>
        </>
      }
    >
      {/* Resumo do dia */}
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-wire border border-neutral-200 bg-neutral-200">
        <div className="bg-paper p-5">
          <Stat value="07" label="Compromissos" />
        </div>
        <div className="bg-paper p-5">
          <Stat value="04" label="Confirmados" />
        </div>
        <div className="bg-paper p-5">
          <Stat value="02" label="Aguardando" />
        </div>
        <div className="bg-paper p-5">
          <Stat value="01" label="Atenção redobrada" />
        </div>
      </div>

      {/* Filtros */}
      <WireCard eyebrow="Filtros" title="Agenda da semana">
        <div className="grid grid-cols-4 gap-4">
          <WireField label="Médico" value="Dra. Helena Prado" />
          <WireField label="Data" value="19/06/2026" mono />
          <WireField label="Modalidade" value="Todas" />
          <WireField label="Status" placeholder="Confirmado / aguardando" />
        </div>

        <div className="mt-5">
          <WireTable
            columns={[
              { key: "hora", header: "Hora", numeric: true, width: "84px" },
              { key: "paciente", header: "Paciente" },
              { key: "modalidade", header: "Modalidade" },
              { key: "status", header: "Status" },
            ]}
            rows={[
              {
                hora: "09:00",
                paciente: "André Lobo",
                modalidade: "Teleconsulta",
                status: <WireBadge tone="neutral">Confirmado</WireBadge>,
              },
              {
                hora: "09:40",
                paciente: "Marina Castro",
                modalidade: "Presencial",
                status: <WireBadge tone="soft">Aguardando</WireBadge>,
              },
              {
                hora: "10:30",
                paciente: "Júlia Tavares",
                modalidade: "Teleconsulta",
                status: <WireBadge tone="neutral">Confirmado</WireBadge>,
              },
              {
                hora: "11:15",
                paciente: "Rui Salgado",
                modalidade: "Presencial",
                status: <WireBadge tone="soft">Aguardando</WireBadge>,
              },
            ]}
          />
        </div>
      </WireCard>

      <div className="grid grid-cols-5 gap-6">
        {/* Pacientes que precisam de atenção */}
        <WireCard
          className="col-span-3"
          eyebrow="Triagem"
          title="Pacientes que precisam de atenção"
        >
          <WireTable
            columns={[
              { key: "paciente", header: "Paciente" },
              { key: "pre", header: "Pré-consulta", numeric: true, width: "120px" },
              { key: "flag", header: "Sinalização" },
            ]}
            rows={[
              {
                paciente: "Marina Castro",
                pre: "40%",
                flag: <WireBadge tone="hard">Atenção redobrada</WireBadge>,
              },
              {
                paciente: "André Lobo",
                pre: "100%",
                flag: <WireBadge tone="neutral">Completa</WireBadge>,
              },
              {
                paciente: "Rui Salgado",
                pre: "65%",
                flag: <WireBadge tone="mid">Pendências</WireBadge>,
              },
            ]}
          />
        </WireCard>

        {/* Alta relevância — Athena */}
        <WireCard
          className="col-span-2"
          eyebrow="Alta relevância"
          title="Confirmados e faltas via Athena"
          emphasis
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Stat value="04" label="Confirmados" />
              <Stat value="01" label="Faltas" />
            </div>
            <div className="flex min-h-28 items-center justify-center rounded-wire border border-dashed border-neutral-300 bg-paper-50">
              <span className="font-mono text-micro uppercase tracking-[0.12em] text-neutral-400">
                Container da Athena
              </span>
            </div>
          </div>
        </WireCard>
      </div>
    </ScreenShell>
  );
}
