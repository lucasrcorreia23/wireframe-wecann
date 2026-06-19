import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
} from "@/components/ui";

// `pre-review` — Revisão da pré-consulta.
export function PreReviewScreen() {
  return (
    <ScreenShell
      zone="Pré-consulta"
      title="Revisão da pré-consulta"
      lead="Marina Castro · 34 anos · dor crônica refratária."
      actions={
        <>
          <WireButton variant="secondary">Editar resumo</WireButton>
          <WireButton variant="primary">Validar resumo</WireButton>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <WireCard
            eyebrow="Resumo"
            title="Motivo e queixa"
            aside={<WireBadge tone="mid">Revisar</WireBadge>}
          >
            <p className="text-body text-neutral-700">
              Dor lombar persistente há 14 meses, refratária a anti-inflamatórios
              e fisioterapia. Relata interferência no sono e na rotina de trabalho.
              Busca alternativa para controle e redução de opioides.
            </p>
          </WireCard>

          <WireCard eyebrow="Histórico" title="Histórico e medicações em uso">
            <ul className="flex flex-col divide-y divide-neutral-200">
              {[
                ["Tramadol 50mg", "2× ao dia · há 8 meses"],
                ["Amitriptilina 25mg", "à noite · há 3 meses"],
                ["Fibromialgia", "diagnóstico em 2023"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <span className="text-body text-ink">{k}</span>
                  <span className="font-mono text-caption text-neutral-500">
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          </WireCard>

          <WireCard eyebrow="Anexos" title="Exames anexados">
            <div className="grid grid-cols-3 gap-4">
              {["Ressonância lombar", "Hemograma", "Perfil hepático"].map(
                (exam) => (
                  <div
                    key={exam}
                    className="flex h-24 flex-col justify-between rounded-wire border border-neutral-200 bg-paper-50 p-3"
                  >
                    <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                      PDF
                    </span>
                    <span className="text-caption text-neutral-700">{exam}</span>
                  </div>
                ),
              )}
            </div>
          </WireCard>
        </div>

        <div className="flex flex-col gap-6">
          <WireCard eyebrow="Atalho" title="Paciente 360">
            <div className="flex flex-col gap-3">
              <WireField label="Condições" value="Fibromialgia, ansiedade" />
              <WireField label="Alergias" value="Dipirona" mono />
              <WireField label="Última consulta" value="04/03/2026" mono />
              <WireButton variant="secondary" className="mt-1 w-full">
                Abrir Paciente 360
              </WireButton>
            </div>
          </WireCard>
        </div>
      </div>
    </ScreenShell>
  );
}
