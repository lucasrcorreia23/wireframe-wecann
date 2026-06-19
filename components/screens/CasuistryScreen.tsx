import {
  ScreenShell,
  WireCard,
  WireBadge,
  Stat,
  Eyebrow,
} from "@/components/ui";

// `casuistry` — Casuística e evolução.
export function CasuistryScreen() {
  return (
    <ScreenShell
      zone="Pós-consulta"
      title="Casuística e evolução"
      lead="Outcomes por condição e evolução longitudinal em padrão internacional."
      actions={<WireBadge tone="soft">LGPD · anonimizado</WireBadge>}
    >
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-wire border border-neutral-200 bg-neutral-200">
        <div className="bg-paper p-5">
          <Stat value="128" label="Casos" />
        </div>
        <div className="bg-paper p-5">
          <Stat value="73%" label="Resposta favorável" />
        </div>
        <div className="bg-paper p-5">
          <Stat value="−41%" label="Dor média (PROM)" />
        </div>
        <div className="bg-paper p-5">
          <Stat value="06" label="Condições" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <WireCard
          className="col-span-2"
          eyebrow="Longitudinal"
          title="Evolução por condição"
        >
          <div className="flex h-44 items-end gap-2">
            {[4, 6, 5, 8, 7, 9, 11, 10, 12, 13, 12, 14].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col justify-end">
                <div
                  className="rounded-sm bg-neutral-300"
                  style={{ height: `${h * 10}px` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-caption text-neutral-500">
            Outcomes agregados ao longo de 12 meses.
          </p>
        </WireCard>

        <div className="flex flex-col gap-6">
          <WireCard eyebrow="Indicadores" title="Escalas validadas (PROMs)">
            <ul className="flex flex-col divide-y divide-neutral-200">
              {[
                ["BPI", "−41%"],
                ["PSQI", "−28%"],
                ["GAD-7", "−19%"],
              ].map(([scale, delta]) => (
                <li
                  key={scale}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-body text-neutral-700">{scale}</span>
                  <span className="font-mono text-caption tabular-nums text-ink">
                    {delta}
                  </span>
                </li>
              ))}
            </ul>
          </WireCard>
          <WireCard eyebrow="Pesquisa" title="Apoio a artigos">
            <Eyebrow>Evidências anonimizadas</Eyebrow>
            <p className="mt-1 text-caption text-neutral-600">
              Exportação de coortes em padrão internacional para suporte a
              pesquisas e publicações.
            </p>
          </WireCard>
        </div>
      </div>
    </ScreenShell>
  );
}
