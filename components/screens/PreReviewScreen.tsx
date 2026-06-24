"use client";

import { useState } from "react";
import { WireButton, WireBadge, Stat, Eyebrow, Avatar, ScrollTabs } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `pre-review` — Paciente 360: o perfil completo pré-consulta numa tela só (dor do
// shadowing: prontuário sem consolidação). Padrão de MÓDULO (Centro/Esquerda).
// ESQUERDA = stack "quem é ela" (identidade → condições → briefing de 60s, nunca
// recolhido e com o CTA "Iniciar consulta" à direita → alertas → indicadores).
// CENTRO = aprofundamentos em ABAS (coluna larga), preenchendo a altura. Sem cor:
// criticidade por peso de cinza. RWE visível (episódio, timepoints M1/M3/M6/M12, ★).

const PATIENT = {
  name: "Marina Castro",
  seed: "marina",
  age: 38,
  diagnosis: "Dor lombar crônica (M54.5)",
  followUp: "em acompanhamento há 8 meses",
};

const MEDS = [
  ["Tramadol 50mg", "2× ao dia · em desmame"],
  ["Amitriptilina 25mg", "à noite · há 3 meses"],
  ["CBD 200mg/mL", "0,5 mL 2×/dia · há 3 meses"],
  ["Vitamina D 7.000UI", "semanal · há 1 ano"],
];

// Linha do tempo agrupada pelo EPISÓDIO TERAPÊUTICO (entidade primária RWE).
const EPISODE = {
  title: "CBD 200mg/mL · Dor lombar crônica",
  start: "início ago/2025",
  stars: 2,
};

const TIMELINE: { tp: string; date: string; kind: string; text: string }[] = [
  { tp: "Basal", date: "28/08/2025", kind: "Consulta", text: "1ª consulta · encaminhamento e solicitação de exames." },
  { tp: "—", date: "12/12/2025", kind: "Exame", text: "Ressonância lombar · alterações degenerativas L4–L5." },
  { tp: "M1", date: "04/03/2026", kind: "Conduta", text: "Início de CBD; desmame gradual de tramadol." },
  { tp: "M3", date: "19/06/2026", kind: "Evento", text: "Sonolência diurna leve relatada (CTCAE Grau 1)." },
];

// Achados resumidos dos exames — o médico lê o relevante sem abrir cada PDF.
const EXAMS: { name: string; date: string; finding: string }[] = [
  { name: "Ressonância lombar", date: "12/12/2025", finding: "Discopatia degenerativa L4–L5; sem compressão radicular." },
  { name: "Hemograma", date: "02/03/2026", finding: "Sem alterações significativas." },
  { name: "Perfil hepático", date: "02/03/2026", finding: "TGO/TGP normais — base para monitorar CBD." },
];

// Escalas longitudinais (timepoints). Valores em cinza neutro — sem cor.
const SCALES: { code: string; label: string; max: number; mcid: string; points: { tp: string; v: number }[] }[] = [
  { code: "EVA dor", label: "Intensidade da dor", max: 10, mcid: "MCID ↓2", points: [{ tp: "Basal", v: 8 }, { tp: "M1", v: 6 }, { tp: "M3", v: 5 }] },
  { code: "PSQI sono", label: "Qualidade do sono", max: 21, mcid: "MCID ↓3", points: [{ tp: "Basal", v: 14 }, { tp: "M1", v: 11 }, { tp: "M3", v: 9 }] },
];

const PRE_HISTORY = [
  ["17/06/2026", "Respondida", "WhatsApp · 9 respostas · ★★"],
  ["01/03/2026", "Respondida", "WhatsApp · 8 respostas"],
];

const TEAM_NOTES = [
  ["Dra. Bárbara · Reumatologia", "12/12/2025", "Fibromialgia associada; sugiro abordagem multimodal."],
  ["Fisioterapia", "20/02/2026", "Ganho de mobilidade lombar; manter programa."],
];

const DOCS = [
  "Receita de controle especial · CBD",
  "Atestado · 2 dias",
  "Solicitação de exames · perfil hepático",
];

// Alertas pré-consulta — migraram do Briefing para a coluna ESQUERDA (sempre
// visíveis). Peso de cinza, nunca cor.
const ALERTS: { tone: "hard" | "mid"; label: string; text: string }[] = [
  { tone: "hard", label: "Crítico", text: "Alergia a dipirona registrada." },
  { tone: "mid", label: "Atenção", text: "Interação potencial: amitriptilina × CBD (monitorar sedação)." },
  { tone: "mid", label: "Atenção", text: "Escala PSQI vencida para reaplicação neste timepoint." },
];

const PRE_STATES: { key: string; label: string }[] = [
  { key: "respondida", label: "Respondida" },
  { key: "pendente", label: "Pendente" },
  { key: "nao-enviada", label: "Não enviada" },
  { key: "primeira", label: "1ª consulta" },
];

function StatusChips({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRE_STATES.map((s) => (
        <WireBadge
          key={s.key}
          tone={s.key === active ? "mid" : "soft"}
          className={cn(s.key !== active && "opacity-45")}
        >
          {s.label}
        </WireBadge>
      ))}
    </div>
  );
}

function ScaleBars({ points, max }: { points: { tp: string; v: number }[]; max: number }) {
  return (
    <div className="flex items-end gap-2">
      {points.map((p) => (
        <div key={p.tp} className="flex flex-col items-center gap-1">
          <div className="flex h-16 w-8 items-end overflow-hidden rounded-sm bg-white/40">
            <div
              className="w-full rounded-sm bg-neutral-400/70"
              style={{ height: `${Math.round((p.v / max) * 100)}%` }}
            />
          </div>
          <span className="font-mono text-micro text-neutral-700">{p.v}</span>
          <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
            {p.tp}
          </span>
        </div>
      ))}
    </div>
  );
}

// Seções do Paciente 360 que vivem na barra de ABAS do centro (Briefing e perfil
// ficam de fora, sempre visíveis). Cada uma traz seu meta (subtítulo/extra) e o
// conteúdo — o mesmo de antes, sem o card colapsável.
const TAB_SECTIONS: {
  key: string;
  label: string;
  icon: string;
  subtitle?: string;
  extra?: React.ReactNode;
  content: React.ReactNode;
}[] = [
  {
    key: "motivo",
    label: "Motivo",
    icon: "bx-detail",
    extra: <WireBadge tone="mid">Revisar</WireBadge>,
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-body text-neutral-700 text-pretty">
          Dor lombar refratária há 14 meses, com irradiação para o membro inferior
          direito. Interfere no sono e no trabalho; a paciente busca reduzir o uso
          de opioides e recuperar a funcionalidade no dia a dia.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-time-five">Início e curso</Eyebrow>
            <span className="text-caption text-neutral-700">Há 14 meses · progressiva</span>
          </div>
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-pulse">Intensidade</Eyebrow>
            <span className="text-caption text-neutral-700">EVA 5/10 · pior à noite</span>
          </div>
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-band-aid">Impacto</Eyebrow>
            <span className="text-caption text-neutral-700">Sono fragmentado · afastamento parcial</span>
          </div>
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-target-lock">Objetivo</Eyebrow>
            <span className="text-caption text-neutral-700">Reduzir opioides · recuperar função</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "timeline",
    label: "Linha do tempo",
    icon: "bx-history",
    subtitle: "Agrupada pelo episódio terapêutico ativo",
    extra: (
      <span className="font-mono text-caption text-neutral-400" title="Qualidade de dados RWE">
        {"★".repeat(EPISODE.stars)}{"☆".repeat(3 - EPISODE.stars)}
      </span>
    ),
    content: (
      <div className="flex flex-col gap-3">
        <div className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5">
          <span className="text-caption font-medium text-ink">
            Episódio · {EPISODE.title}
          </span>
          <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
            {EPISODE.start}
          </span>
        </div>
        <ul className="flex flex-col">
          {TIMELINE.map((e) => (
            <li
              key={e.date}
              className="flex gap-4 border-b border-dashed border-white/50 py-3 last:border-0"
            >
              <div className="flex w-24 shrink-0 flex-col gap-1">
                <span className="font-mono text-caption text-neutral-600">{e.date}</span>
                {e.tp !== "—" ? <WireBadge tone="soft">{e.tp}</WireBadge> : null}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 border-l border-white/40 pl-4">
                <Eyebrow>{e.kind}</Eyebrow>
                <span className="text-caption text-neutral-700 text-pretty">{e.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    key: "exames",
    label: "Exames",
    icon: "bx-paperclip",
    subtitle: "Achados principais dos exames recentes",
    content: (
      <ul className="flex flex-col gap-2">
        {EXAMS.map((ex) => (
          <li
            key={ex.name}
            className="glass-frost-inner flex flex-col gap-1 rounded-2xl px-3.5 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-body font-medium text-ink">{ex.name}</span>
              <span className="font-mono text-micro text-neutral-500">{ex.date}</span>
            </div>
            <span className="text-caption text-neutral-700 text-pretty">{ex.finding}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "escalas",
    label: "Escalas",
    icon: "bx-line-chart",
    subtitle: "Timepoints Basal · M1 · M3 · M6 · M12",
    content: (
      <div className="grid grid-cols-2 gap-4">
        {SCALES.map((sc) => (
          <div key={sc.code} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-body font-medium text-ink">{sc.code}</span>
              <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
                {sc.mcid}
              </span>
            </div>
            <ScaleBars points={sc.points} max={sc.max} />
            <span className="text-caption text-neutral-500">{sc.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "medicacoes",
    label: "Medicações",
    icon: "bx-capsule",
    content: (
      <ul className="flex flex-col divide-y divide-white/40">
        {MEDS.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between gap-4 py-2">
            <span className="text-body text-ink">{k}</span>
            <span className="font-mono text-caption text-neutral-500">{v}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "documentos",
    label: "Documentos",
    icon: "bx-file",
    content: (
      <ul className="flex flex-col gap-2">
        {DOCS.map((doc) => (
          <li
            key={doc}
            className="glass-frost-inner flex items-center gap-3 rounded-2xl px-3.5 py-2.5"
          >
            <i className="bx bx-file shrink-0 text-lg text-neutral-500" />
            <span className="flex-1 text-caption text-neutral-700">{doc}</span>
            <i className="bx bx-download shrink-0 text-lg text-neutral-400" />
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "pre-anamneses",
    label: "Pré-anamneses",
    icon: "bx-list-check",
    content: (
      <ul className="flex flex-col gap-2">
        {PRE_HISTORY.map(([date, status, note]) => (
          <li
            key={date}
            className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-caption text-neutral-600">{date}</span>
              <WireBadge tone="soft">{status}</WireBadge>
            </div>
            <span className="text-caption text-neutral-500">{note}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "notas",
    label: "Notas",
    icon: "bx-group",
    content: (
      <ul className="flex flex-col gap-3">
        {TEAM_NOTES.map(([who, date, text]) => (
          <li key={who} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption font-medium text-ink">{who}</span>
              <span className="font-mono text-micro text-neutral-500">{date}</span>
            </div>
            <p className="text-caption text-neutral-700 text-pretty">{text}</p>
          </li>
        ))}
      </ul>
    ),
  },
];

const TAB_OPTIONS = TAB_SECTIONS.map((s) => ({ key: s.key, label: s.label, icon: s.icon }));

// ESQUERDA — stack "quem é ela" (detalhamento da pessoa, de cima p/ baixo):
// identidade → condições → briefing de 60s (nunca recolhido, CTA à direita) →
// alertas → indicadores. Os aprofundamentos vivem nas abas do CENTRO.
export function PreReviewLeft() {
  const goTo = useFlow((s) => s.goTo);

  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      {/* Identidade — começo do detalhamento da pessoa. */}
      <ModuleCard>
        <div className="flex items-center gap-3">
          <BackButton />
          <Avatar name={PATIENT.name} seed={PATIENT.seed} size="md" className="h-12 w-12" />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-body-l font-medium leading-tight text-ink">
              {PATIENT.name}
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-neutral-500">
              <span>{PATIENT.age} anos</span>
              <span aria-hidden className="text-neutral-300">·</span>
              <span>{PATIENT.diagnosis}</span>
              <span aria-hidden className="text-neutral-300">·</span>
              <span>{PATIENT.followUp}</span>
            </div>
          </div>
        </div>
      </ModuleCard>

      {/* Condições — detalhe do perfil, logo abaixo da identidade. */}
      <ModuleCard icon="bx-plus-medical" title="Condições" size="sm">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>Fibromialgia</WireBadge>
          <WireBadge>Dor crônica</WireBadge>
          <WireBadge>Ansiedade</WireBadge>
        </div>
      </ModuleCard>

      {/* Briefing de 60s — NUNCA recolhido (ModuleCard, sem chevron); CTA à direita. */}
      <ModuleCard
        icon="bx-time-five"
        eyebrow="Briefing · 60s"
        size="sm"
        aside={
          <WireButton
            variant="primary"
            size="sm"
            onClick={() => goTo("consult")}
            className="gap-2 whitespace-nowrap"
          >
            <i className="bx bx-video text-base" />
            Iniciar consulta
          </WireButton>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-caption leading-relaxed text-neutral-700 text-pretty">
            Marina mantém dor lombar crônica refratária, hoje em
            <strong className="font-medium text-ink"> M3</strong> do episódio com CBD.
            Desde a última consulta houve melhora da dor (EVA 6 → 5) e do sono
            (PSQI 11 → 9), com desmame parcial de tramadol. Relata sonolência diurna
            leve a investigar.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/50 pt-3">
            <Eyebrow>Pré-anamnese</Eyebrow>
            <StatusChips active="respondida" />
          </div>
        </div>
      </ModuleCard>

      {/* Alertas pré-consulta. */}
      <ModuleCard icon="bx-error-circle" title="Alertas pré-consulta" size="sm">
        <ul className="flex flex-col gap-1.5">
          {ALERTS.map((a) => (
            <li
              key={a.text}
              className={cn(
                "glass-frost-inner flex items-center gap-2.5 rounded-2xl px-3 py-2.5",
                a.tone === "hard" && "border border-state-hard/40",
              )}
            >
              <WireBadge tone={a.tone}>{a.label}</WireBadge>
              <span className="text-caption text-neutral-700 text-pretty">{a.text}</span>
            </li>
          ))}
        </ul>
      </ModuleCard>

      {/* Indicadores / métricas. */}
      <ModuleCard icon="bx-bar-chart-alt-2" title="Indicadores" size="sm">
        <div className="flex flex-col gap-4">
          <Stat value="12" label="Consultas" hint="desde ago/2025" />
          <Stat value="86%" label="Aderência" hint="últimos 6 meses" />
        </div>
      </ModuleCard>
    </div>
  );
}

// CENTRO — aprofundamentos em ABAS (foco), preenchendo a altura. Identidade e
// briefing migraram para a esquerda. Abas fixas no topo; conteúdo rola por dentro.
export function PreReviewCenter() {
  const [tab, setTab] = useState(TAB_SECTIONS[0].key);
  const active = TAB_SECTIONS.find((s) => s.key === tab) ?? TAB_SECTIONS[0];

  return (
    <div className="flex h-full flex-col pt-[88px] pb-6">
      <section className="glass-panel-blue backdrop-blur-2xl flex min-h-0 flex-1 flex-col gap-4 rounded-[28px] p-6">
        <ScrollTabs options={TAB_OPTIONS} value={tab} onChange={setTab} />
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t border-white/50 pt-5">
          {active.subtitle || active.extra ? (
            <div className="flex items-center justify-between gap-3">
              {active.subtitle ? (
                <p className="text-caption text-neutral-500 text-pretty">{active.subtitle}</p>
              ) : (
                <span aria-hidden />
              )}
              {active.extra ?? null}
            </div>
          ) : null}
          {active.content}
        </div>
      </section>
    </div>
  );
}
