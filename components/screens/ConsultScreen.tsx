import {
  ScreenShell,
  WireCard,
  WireBadge,
  WireField,
  Eyebrow,
} from "@/components/ui";

// `consult` — Tela de consulta · ativa painéis companheiros.
export function ConsultScreen() {
  return (
    <ScreenShell
      zone="Consulta"
      title="Tela de consulta"
      lead="Marina Castro · consulta em andamento · adaptável por especialidade e paciente."
      actions={<WireBadge tone="mid">Transcrevendo</WireBadge>}
    >
      {/* Cabeçalho: resumo da pré-consulta */}
      <WireCard eyebrow="Cabeçalho" title="Resumo da pré-consulta">
        <p className="text-body text-neutral-700">
          Dor lombar refratária há 14 meses · uso atual de tramadol e
          amitriptilina · busca por redução de opioides.
        </p>
      </WireCard>

      <div className="grid grid-cols-3 gap-6">
        {/* Paciente 360 lateral (expandir) */}
        <WireCard
          eyebrow="Painel companheiro"
          title="Paciente 360"
          aside={
            <span className="font-mono text-micro text-neutral-400">expandir</span>
          }
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Eyebrow>Condições e alergias</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                <WireBadge>Fibromialgia</WireBadge>
                <WireBadge>Ansiedade</WireBadge>
                <WireBadge tone="mid">Alergia: dipirona</WireBadge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Eyebrow>Medicações ativas</Eyebrow>
              <ul className="flex flex-col gap-1 font-mono text-caption text-neutral-700">
                <li>Tramadol 50mg · 2×/dia</li>
                <li>Amitriptilina 25mg · noite</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Eyebrow>Timeline e exames</Eyebrow>
              <div className="flex h-16 items-center rounded-wire border border-dashed border-neutral-300 bg-paper-50 px-3">
                <span className="font-mono text-micro text-neutral-400">
                  ●──●──●── ressonância · hemograma
                </span>
              </div>
            </div>
          </div>
        </WireCard>

        {/* Transcrição em tempo real */}
        <WireCard
          className="col-span-2"
          eyebrow="Painel companheiro"
          title="Transcrição em tempo real"
          aside={<WireBadge tone="soft">Modelo selecionado</WireBadge>}
        >
          <div className="flex flex-col gap-3">
            {[
              ["Médica", "Como tem sido a dor desde a última visita?"],
              ["Paciente", "Continua forte à noite, atrapalha o sono."],
              ["Médica", "E o tramadol, está ajudando no controle?"],
            ].map(([who, line], i) => (
              <div key={i} className="flex gap-3">
                <span className="w-20 shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">
                  {who}
                </span>
                <p className="text-body text-neutral-700">{line}</p>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-neutral-200 pt-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-state-mid" />
              <span className="font-mono text-micro text-neutral-500">
                Capturando — somente do modelo selecionado
              </span>
            </div>
          </div>
        </WireCard>
      </div>

      <WireField
        label="Adaptação"
        value="Layout adaptado para Dor / Reumatologia"
        className="max-w-md"
      />
    </ScreenShell>
  );
}
