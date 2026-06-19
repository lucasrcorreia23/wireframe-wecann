"use client";

import { useState } from "react";
import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  Eyebrow,
} from "@/components/ui";

// `report` — Relatório final · TERMINUS. Compila a jornada, pré-visualiza e
// entrega ao paciente/cliente. O estado de sucesso é um momento editorial.
export function ReportScreen() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <ScreenShell zone="Pós-consulta · terminus" title="Relatório enviado">
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center">
          {/* Checkmark hairline — animado com DrawSVG na Fase 6. */}
          <svg
            viewBox="0 0 64 64"
            className="h-16 w-16"
            fill="none"
            aria-hidden
          >
            <circle
              cx="32"
              cy="32"
              r="30"
              stroke="var(--color-neutral-300)"
              strokeWidth="1"
            />
            <path
              d="M20 33 L29 42 L45 24"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-display text-display-l font-medium text-ink">
            Relatório enviado
          </p>
          <p className="max-w-md text-body-l text-neutral-600">
            Marina Castro receberá o relatório completo da jornada por e-mail e
            no portal do paciente.
          </p>
          <WireButton variant="secondary" onClick={() => setSent(false)}>
            Ver relatório
          </WireButton>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      zone="Pós-consulta · terminus"
      title="Relatório final"
      lead="Compilação dos documentos da jornada — laudos, conduta e evolução."
      actions={
        <WireButton variant="primary" onClick={() => setSent(true)}>
          Enviar ao paciente / cliente
        </WireButton>
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <WireCard
          className="col-span-2"
          eyebrow="Compilação"
          title="Documentos da jornada"
        >
          <ul className="flex flex-col divide-y divide-neutral-200">
            {[
              ["Laudo médico", "Emitido"],
              ["Conduta e prescrição", "Controle especial"],
              ["Evolução longitudinal", "12 meses"],
              ["Escalas (PROMs)", "BPI · PSQI · GAD-7"],
            ].map(([doc, meta]) => (
              <li
                key={doc}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="text-body text-ink">{doc}</span>
                <span className="font-mono text-caption text-neutral-500">
                  {meta}
                </span>
              </li>
            ))}
          </ul>
        </WireCard>

        <WireCard
          className="col-span-3"
          eyebrow="Pré-visualização"
          title="Relatório"
          aside={<WireBadge tone="neutral">Rascunho</WireBadge>}
        >
          <div className="flex flex-col gap-4 rounded-wire border border-neutral-200 bg-paper-50 p-6">
            <Eyebrow>WeCann · relatório clínico</Eyebrow>
            <p className="font-display text-title font-medium text-ink">
              Marina Castro — dor crônica refratária
            </p>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full rounded-sm bg-neutral-200" />
              <div className="h-2 w-11/12 rounded-sm bg-neutral-200" />
              <div className="h-2 w-10/12 rounded-sm bg-neutral-200" />
              <div className="h-2 w-9/12 rounded-sm bg-neutral-200" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {["Conduta", "Evolução", "Anexos"].map((s) => (
                <div
                  key={s}
                  className="flex h-16 items-end rounded-wire border border-neutral-200 bg-paper p-2"
                >
                  <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </WireCard>
      </div>
    </ScreenShell>
  );
}
