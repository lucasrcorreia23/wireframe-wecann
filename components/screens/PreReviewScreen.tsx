import { WireButton, WireBadge, WireField, Stat, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { JourneyShell } from "@/components/layout/JourneyShell";
import type { ScreenProps } from "./index";

// `pre-review` — Paciente 360: o perfil completo do paciente (dados, histórico,
// tudo que ele fez). Módulos complementares à esquerda, perfil ao centro, IA à
// direita. Única ação: ir para a consulta (onContinue → consult).
const MEDS = [
  ["Tramadol 50mg", "2× ao dia · há 8 meses"],
  ["Amitriptilina 25mg", "à noite · há 3 meses"],
  ["Vitamina D 7.000UI", "semanal · há 1 ano"],
];

const HISTORY = [
  ["04/03/2026", "Retorno · Dor", "Ajuste de dose · CBD iniciado"],
  ["12/12/2025", "Reumatologia", "Diagnóstico de fibromialgia"],
  ["28/08/2025", "1ª consulta", "Encaminhamento e exames"],
];

export function PreReviewScreen({ onContinue }: ScreenProps) {
  const left = (
    <>
      <ModuleCard eyebrow="Resumo" title="Motivo e queixa" aside={<WireBadge tone="mid">Revisar</WireBadge>}>
        <p className="text-caption text-neutral-700">
          Dor lombar refratária há 14 meses · interfere no sono e no trabalho ·
          busca reduzir opioides.
        </p>
      </ModuleCard>

      <ModuleCard eyebrow="Anexos" title="Exames">
        <div className="flex flex-col gap-2">
          {["Ressonância lombar", "Hemograma", "Perfil hepático"].map((exam) => (
            <div
              key={exam}
              className="glass-frost-inner flex items-center justify-between rounded-xl px-3 py-2"
            >
              <span className="text-caption text-neutral-700">{exam}</span>
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                PDF
              </span>
            </div>
          ))}
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Resumo" title="Indicadores">
        <div className="flex flex-col gap-4">
          <Stat value="12" label="Consultas" hint="desde ago/2025" />
          <Stat value="86%" label="Aderência" hint="últimos 6 meses" />
        </div>
      </ModuleCard>
    </>
  );

  return (
    <JourneyShell left={left}>
      {/* Identidade + CTA único */}
      <ModuleCard>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/50 bg-white/40 font-mono text-caption text-neutral-700">
              MC
            </span>
            <div className="flex flex-col">
              <span className="text-body-l font-medium text-ink">Marina Castro</span>
              <span className="text-caption text-neutral-500">
                34 anos · dor crônica refratária · desde ago/2025
              </span>
            </div>
          </div>
          <WireButton variant="primary" onClick={onContinue}>
            Ir para a consulta
          </WireButton>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Clínico" title="Condições e alergias">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Condições</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              <WireBadge>Fibromialgia</WireBadge>
              <WireBadge>Dor crônica</WireBadge>
              <WireBadge>Ansiedade</WireBadge>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Alergias</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              <WireBadge tone="hard">Dipirona</WireBadge>
            </div>
          </div>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Medicações" title="Em uso">
        <ul className="flex flex-col divide-y divide-white/40">
          {MEDS.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between gap-4 py-2">
              <span className="text-body text-ink">{k}</span>
              <span className="font-mono text-caption text-neutral-500">{v}</span>
            </li>
          ))}
        </ul>
      </ModuleCard>

      <ModuleCard eyebrow="Histórico" title="Consultas anteriores">
        <ul className="flex flex-col gap-3">
          {HISTORY.map(([date, type, outcome]) => (
            <li key={date} className="flex gap-4">
              <span className="w-24 shrink-0 font-mono text-caption text-neutral-500">
                {date}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 border-l border-white/40 pl-4">
                <span className="text-body font-medium text-ink">{type}</span>
                <span className="text-caption text-neutral-600">{outcome}</span>
              </div>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </JourneyShell>
  );
}
