"use client";

import { useState } from "react";
import { WireButton, WireBadge, Stat, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const goTo = useFlow((s) => s.goTo);

  // Confirma o envio: marca como enviado, fecha o modal e volta pra Home (terminus).
  const confirmSend = () => {
    setSent(true);
    setConfirmOpen(false);
    goTo("home");
  };

  const left = (
    <>
      <ModuleCard icon="bx-bar-chart-alt-2" title="Outcomes por condição">
        <div className="flex flex-col gap-3">
          <Stat value="32%" label="Dor (BPI)" hint="redução em 6 meses" />
          <Stat value="↓" label="Ansiedade (GAD-7)" hint="tendência de queda" />
        </div>
      </ModuleCard>

      <ModuleCard icon="bx-line-chart" title="Evolução longitudinal">
        <div className="glass-frost-inner flex h-16 items-center rounded-xl px-3">
          <span className="font-mono text-micro text-neutral-500">
            ▁▂▃▅▆▇ 12 meses de acompanhamento
          </span>
        </div>
      </ModuleCard>

      <ModuleCard icon="bx-file" title="Laudos e anexos">
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

  // Modal de confirmação de envio — encerramento da consulta (terminus).
  // Vai pelo slot `overlay`: irmão fora da superfície de scroll, ancorado ao box
  // do shell (scrim nunca é ancestral do vidro → blur intacto).
  const overlay = (
    <>
      {/* Scrim — escurece o fundo sem borrar. */}
      <div
        onClick={() => setConfirmOpen(false)}
        aria-hidden
        className={cn(
          "absolute inset-0 z-20 bg-[#e6e6e4]/45 transition-opacity duration-300",
          confirmOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Card centralizado. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!confirmOpen}
        className={cn(
          "glass-panel-blue backdrop-blur-2xl absolute inset-0 z-30 m-auto flex h-fit max-h-full w-full max-w-[480px] flex-col rounded-[28px] p-7",
          "transition-[transform,opacity] duration-300 ease-out",
          confirmOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <header className="flex items-start gap-3">
          <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
            <i className="bx bx-send text-xl" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Eyebrow>Pós-consulta · encerramento</Eyebrow>
            <h2 className="font-display text-title font-medium text-ink text-pretty">
              Enviar relatório final?
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            aria-label="Fechar"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </header>

        <p className="mt-5 text-caption text-neutral-600 text-pretty">
          O relatório, laudos e prescrição vão para Marina Castro pelo app e
          e-mail. O questionário de seguimento (PROM) é disparado em 7 dias e a
          consulta é encerrada.
        </p>

        <ul className="mt-5 flex flex-col divide-y divide-white/40">
          {DOCS.map(([doc, meta]) => (
            <li key={doc} className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2 text-caption text-ink">
                <i className="bx bx-check text-base text-neutral-500" />
                {doc}
              </span>
              <span className="font-mono text-micro text-neutral-500">{meta}</span>
            </li>
          ))}
        </ul>

        <footer className="mt-7 flex items-center justify-end gap-3 border-t border-white/50 pt-5">
          <WireButton variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </WireButton>
          <WireButton variant="primary" onClick={confirmSend} className="gap-2">
            <i className="bx bx-send text-lg" />
            Enviar e ir para home
          </WireButton>
        </footer>
      </div>
    </>
  );

  return (
    <JourneyShell left={left} overlay={overlay}>
      {/* Cabeçalho + CTA */}
      <ModuleCard>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex flex-col">
              <Eyebrow icon="bx-flag">Pós-consulta · terminus</Eyebrow>
              <span className="font-display text-title font-medium text-ink">
                Relatório final
              </span>
            </div>
          </div>
          {sent ? (
            <WireBadge tone="neutral">Enviado ✓</WireBadge>
          ) : (
            <WireButton variant="primary" onClick={() => setConfirmOpen(true)}>
              Enviar ao paciente
            </WireButton>
          )}
        </div>
      </ModuleCard>

      {/* Pré-visualização do relatório */}
      <ModuleCard icon="bx-show" title="Relatório clínico" aside={<WireBadge tone="neutral">Rascunho</WireBadge>}>
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
      <ModuleCard icon="bx-list-check" title="Escalas validadas (PROMs)">
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
