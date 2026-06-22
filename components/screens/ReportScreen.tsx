"use client";

import { useState } from "react";
import { WireButton, WireBadge, Stat, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { JourneyShell } from "@/components/layout/JourneyShell";

// `report` — Relatório final (Pós-consulta · terminus). Outcomes e evolução ao
// centro + escalas (PROMs); módulos de casuística/evolução/documentos à esquerda;
// IA à direita.
const DOCS = [
  ["Laudo médico", "Emitido"],
  ["Conduta e prescrição", "Controle especial"],
  ["Atestado", "2 dias"],
];

const PROMS = [
  ["BPI", "Dor"],
  ["PSQI", "Sono"],
  ["GAD-7", "Ansiedade"],
];

export function ReportScreen() {
  const [sent, setSent] = useState(false);

  const left = (
    <>
      <ModuleCard eyebrow="Casuística" title="Outcomes por condição">
        <div className="flex flex-col gap-3">
          <Stat value="32%" label="Dor (BPI)" hint="redução em 6 meses" />
          <Stat value="↓" label="Ansiedade (GAD-7)" hint="tendência de queda" />
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Evolução" title="Longitudinal">
        <div className="glass-frost-inner flex h-16 items-center rounded-xl px-3">
          <span className="font-mono text-micro text-neutral-500">
            ▁▂▃▅▆▇ 12 meses de acompanhamento
          </span>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Documentos" title="Laudos e anexos">
        <ul className="flex flex-col divide-y divide-white/40">
          {DOCS.map(([doc, meta]) => (
            <li key={doc} className="flex items-center justify-between gap-3 py-2">
              <span className="text-caption text-ink">{doc}</span>
              <span className="font-mono text-micro text-neutral-500">{meta}</span>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </>
  );

  return (
    <JourneyShell left={left}>
      {/* Cabeçalho + CTA */}
      <ModuleCard>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <Eyebrow>Pós-consulta · terminus</Eyebrow>
            <span className="font-display text-title font-medium text-ink">
              Relatório final
            </span>
          </div>
          {sent ? (
            <WireBadge tone="neutral">Enviado ✓</WireBadge>
          ) : (
            <WireButton variant="primary" onClick={() => setSent(true)}>
              Enviar ao paciente
            </WireButton>
          )}
        </div>
      </ModuleCard>

      {/* Pré-visualização do relatório */}
      <ModuleCard eyebrow="Pré-visualização" title="Relatório clínico" aside={<WireBadge tone="neutral">Rascunho</WireBadge>}>
        <div className="glass-frost-inner flex flex-col gap-4 rounded-2xl p-5">
          <p className="font-display text-body-l font-medium text-ink">
            Marina Castro — dor crônica refratária
          </p>
          <div className="flex flex-col gap-2">
            <div className="h-2 w-full rounded-sm bg-white/50" />
            <div className="h-2 w-11/12 rounded-sm bg-white/50" />
            <div className="h-2 w-10/12 rounded-sm bg-white/50" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Conduta", "Evolução", "Anexos"].map((s) => (
              <div
                key={s}
                className="flex h-14 items-end rounded-xl border border-white/40 bg-white/30 p-2"
              >
                <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ModuleCard>

      {/* Faixa de escalas (PROMs) */}
      <ModuleCard eyebrow="Escalas validadas" title="PROMs">
        <div className="grid grid-cols-3 gap-3">
          {PROMS.map(([scale, dim]) => (
            <div
              key={scale}
              className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5"
            >
              <span className="font-mono text-caption font-medium text-ink">
                {scale}
              </span>
              <span className="text-micro text-neutral-500">{dim}</span>
            </div>
          ))}
        </div>
      </ModuleCard>
    </JourneyShell>
  );
}
