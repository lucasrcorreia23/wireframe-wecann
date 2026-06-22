"use client";

import { useFlow } from "@/flow/store";
import { WireBadge, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";

// `patients` — Diretório de pacientes. Lista navegável; abrir leva ao Paciente 360.
const PATIENTS: { initials: string; name: string; condition: string; last: string; pre: string; tone: "neutral" | "mid" | "hard" }[] = [
  { initials: "MC", name: "Marina Castro", condition: "Dor crônica · fibromialgia", last: "04/03/2026", pre: "40%", tone: "hard" },
  { initials: "AL", name: "André Lobo", condition: "Fibromialgia · retorno", last: "12/12/2025", pre: "100%", tone: "neutral" },
  { initials: "JT", name: "Júlia Tavares", condition: "Insônia refratária", last: "—", pre: "20%", tone: "mid" },
  { initials: "RS", name: "Rui Salgado", condition: "Dor neuropática", last: "28/01/2026", pre: "65%", tone: "mid" },
  { initials: "HP", name: "Helena Pires", condition: "Ansiedade · dor", last: "10/02/2026", pre: "100%", tone: "neutral" },
];

export function PatientsScreen() {
  const goTo = useFlow((s) => s.goTo);

  return (
    <div className="flex w-full max-w-[920px] flex-col gap-4">
      <ModuleCard className="gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex flex-col gap-1">
              <Eyebrow>Pacientes</Eyebrow>
              <h2 className="font-display text-title font-medium text-ink">
                Diretório
              </h2>
            </div>
          </div>
          <div className="glass-frost-inner flex items-center gap-2 rounded-full px-4 py-2">
            <i className="bx bx-search text-base text-neutral-400" />
            <span className="text-caption text-neutral-400">Buscar paciente…</span>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {PATIENTS.map((p) => (
            <li key={p.name}>
              <button
                onClick={() => goTo("pre-review")}
                className="glass-frost-inner flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:border-ink/20"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/50 bg-white/40 font-mono text-micro text-neutral-700">
                  {p.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-body font-medium text-ink">{p.name}</span>
                  <span className="truncate text-caption text-neutral-600">
                    {p.condition}
                  </span>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="font-mono text-micro text-neutral-400">
                    Última: {p.last}
                  </span>
                  <WireBadge tone={p.tone}>Pré {p.pre}</WireBadge>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </div>
  );
}
