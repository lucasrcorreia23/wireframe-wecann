"use client";

import { useState } from "react";
import { WireButton, WireBadge } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";
import {
  AppointmentSummaryPanel,
  type Appt,
} from "./AppointmentSummaryPanel";
import { PATIENTS, type PatientKey } from "./appointments";

// `agenda` — calendário estilo Google Calendar, no padrão de MÓDULO (Centro/Esquerda)
// do WorkspaceShell. ESQUERDA: criar + mini-mês + legenda. CENTRO: grade da semana;
// clicar num evento abre o Modal Preview Pré-Consulta (T-06a). Dali o médico bifurca
// para o perfil 360 (pre-review) ou inicia a consulta (consult).
const DAYS = [
  ["Seg", "16"], ["Ter", "17"], ["Qua", "18"], ["Qui", "19"],
  ["Sex", "20"], ["Sáb", "21"], ["Dom", "22"],
];
const START_HOUR = 8;
const HOURS = Array.from({ length: 10 }, (_, i) => START_HOUR + i);

// Posição de cada paciente na grade da semana (sobrescreve o slot default de hoje
// da fonte compartilhada). O conteúdo clínico/Preview vem de PATIENTS — o Modal
// Preview fica idêntico ao da Home.
const PATIENT_SLOTS: { key: PatientKey; day: number; hour: number; span: number }[] = [
  { key: "marina", day: 3, hour: 9, span: 1 },
  { key: "andre", day: 3, hour: 10, span: 1 },
  { key: "julia", day: 3, hour: 11, span: 1 },
  { key: "rui", day: 2, hour: 10, span: 1 },
  { key: "helena", day: 4, hour: 9, span: 1 },
];

const BLOCKS: Appt[] = [
  {
    kind: "block", day: 1, hour: 8, span: 2,
    title: "Bloco de retornos", sub: "Teleconsulta", type: "Teleconsulta",
    reason: "Bloco de retornos por teleconsulta (4 pacientes).",
  },
  {
    kind: "block", day: 0, hour: 14, span: 2,
    title: "Casuística", sub: "Discussão de casos", type: "Discussão",
    reason: "Discussão de casos da coorte.",
  },
];

const EVENTS: Appt[] = [
  ...PATIENT_SLOTS.map((s) => ({
    ...PATIENTS[s.key],
    day: s.day,
    hour: s.hour,
    span: s.span,
  })),
  ...BLOCKS,
];

const TONE_BAR: Record<NonNullable<Appt["tone"]>, string> = {
  neutral: "border-l-neutral-400",
  mid: "border-l-state-mid",
  hard: "border-l-state-hard",
};

const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const WEEK_INITIALS = ["S", "T", "Q", "Q", "S", "S", "D"];
const CURRENT_WEEK = new Set([16, 17, 18, 19, 20, 21, 22]);
const TODAY = 19;

// ESQUERDA — criar + mini-mês + legenda (resumos do contexto).
export function AgendaLeft() {
  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      <ModuleCard className="gap-4">
        <WireButton variant="primary" className="w-full">
          <i className="bx bx-plus mr-1.5 text-base" />
          Criar
        </WireButton>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-body font-medium text-ink">Junho 2026</span>
            <div className="flex gap-1 text-neutral-400">
              <button className="hover:text-ink" aria-label="Mês anterior">
                <i className="bx bx-chevron-left text-lg" />
              </button>
              <button className="hover:text-ink" aria-label="Próximo mês">
                <i className="bx bx-chevron-right text-lg" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEK_INITIALS.map((w, i) => (
              <span
                key={i}
                className="grid h-6 place-items-center font-mono text-micro text-neutral-400"
              >
                {w}
              </span>
            ))}
            {MONTH_DAYS.map((d) => (
              <span
                key={d}
                className={cn(
                  "grid h-7 place-items-center rounded-full font-mono text-micro",
                  d === TODAY
                    ? "bg-ink text-paper"
                    : CURRENT_WEEK.has(d)
                      ? "bg-white/55 text-ink"
                      : "text-neutral-600",
                )}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Legenda" icon="bx-palette" size="sm">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>Consulta</WireBadge>
          <WireBadge tone="mid">Pré-consulta</WireBadge>
          <WireBadge tone="hard">Controle especial</WireBadge>
        </div>
      </ModuleCard>
    </div>
  );
}

// CENTRO — grade da semana + Modal Preview (T-06a).
export function AgendaCenter() {
  const cols = `52px repeat(${DAYS.length}, minmax(0, 1fr))`;
  const goTo = useFlow((s) => s.goTo);
  const [selected, setSelected] = useState<Appt | null>(null);

  return (
    <div className="relative h-full pt-[88px] pb-6">
      <ModuleCard className="h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackButton />
            <WireButton variant="secondary" size="sm">Hoje</WireButton>
            <WireButton variant="ghost" size="sm">
              <i className="bx bx-chevron-left text-lg" />
            </WireButton>
            <WireButton variant="ghost" size="sm">
              <i className="bx bx-chevron-right text-lg" />
            </WireButton>
            <span className="font-display text-title font-medium text-ink">
              16–22 jun
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {["Dia", "Semana", "Mês"].map((v) => (
              <WireButton key={v} variant={v === "Semana" ? "primary" : "ghost"} size="sm">
                {v}
              </WireButton>
            ))}
          </div>
        </div>

        {/* Cabeçalho dos dias */}
        <div className="grid" style={{ gridTemplateColumns: cols }}>
          <div />
          {DAYS.map(([d, n], i) => (
            <div key={d} className="flex flex-col items-center gap-0.5 border-b border-white/40 pb-2">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">{d}</span>
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full font-mono text-caption",
                  i === 3 ? "bg-ink text-paper" : "text-neutral-700",
                )}
              >
                {n}
              </span>
            </div>
          ))}
        </div>

        {/* Grade horária — ScrollFade: bordas esvanecem em vez de cortar. */}
        <ScrollFade className="min-h-0 flex-1" fade={20} watch={selected?.title}>
          <div
            className="grid pt-2"
            style={{ gridTemplateColumns: cols, gridAutoRows: "3rem" }}
          >
            {HOURS.map((h, r) => (
              <div key={`row-${h}`} style={{ display: "contents" }}>
                <div
                  className="-translate-y-2 pr-2 text-right font-mono text-micro text-neutral-400"
                  style={{ gridColumn: 1, gridRow: r + 1 }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
                {DAYS.map(([d], c) => (
                  <div
                    key={`cell-${h}-${d}`}
                    className="border-b border-l border-white/30"
                    style={{ gridColumn: c + 2, gridRow: r + 1 }}
                  />
                ))}
              </div>
            ))}

            {EVENTS.map((ev) => (
              <button
                key={`${ev.day}-${ev.hour}-${ev.title}`}
                type="button"
                onClick={() => setSelected(ev)}
                className={cn(
                  "glass-frost-inner m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-lg border-l-2 px-2 py-1 text-left transition-colors hover:bg-white/60",
                  TONE_BAR[ev.tone ?? "neutral"],
                )}
                style={{
                  gridColumn: ev.day + 2,
                  gridRow: `${ev.hour - START_HOUR + 1} / span ${ev.span}`,
                }}
              >
                <span className="truncate text-caption font-medium text-ink">{ev.title}</span>
                <span className="truncate font-mono text-micro text-neutral-500">{ev.sub}</span>
              </button>
            ))}
          </div>
        </ScrollFade>
      </ModuleCard>

      <AppointmentSummaryPanel
        appt={selected}
        onClose={() => setSelected(null)}
        onGoConsult={() => goTo("consult")}
        onGoProfile={() => goTo("pre-review")}
      />
    </div>
  );
}
