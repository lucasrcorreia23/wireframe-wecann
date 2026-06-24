"use client";

import { useState } from "react";
import { useFlow } from "@/flow/store";
import { WireBadge } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { NewAppointmentPanel } from "./NewAppointmentPanel";
import { PillDetailPanel, type Pill } from "./PillDetailPanel";
import { cn } from "@/lib/cn";

const RECENT = [
  { initials: "MC", name: "Marina Castro" },
  { initials: "AL", name: "André Lobo" },
  { initials: "JT", name: "Júlia Tavares" },
  { initials: "RS", name: "Rui Salgado" },
  { initials: "HP", name: "Helena Pires" },
];

const AGENDA = [
  { time: "09:30", name: "Marina Castro", condition: "Dor crônica · pré 40%", urgent: true },
  { time: "10:15", name: "André Lobo", condition: "Fibromialgia · retorno", urgent: false },
  { time: "11:00", name: "Júlia Tavares", condition: "Insônia · 1ª consulta", urgent: false },
  { time: "13:30", name: "Rui Salgado", condition: "Dor neuropática · controle", urgent: false },
  { time: "14:15", name: "Helena Pires", condition: "Ansiedade · retorno", urgent: false },
  { time: "15:00", name: "Bruno Antunes", condition: "Avaliação inicial", urgent: false },
];

const PILLS: Pill[] = [
  {
    tag: "Farmacologia",
    title: "Titulação de CBD em dor neuropática",
    meta: "4 min",
    summary:
      "Protocolo de titulação lenta (start low, go slow) do canabidiol em dor neuropática. O objetivo é encontrar a menor dose eficaz com o menor número de efeitos adversos, reavaliando a resposta em janelas curtas antes de cada incremento.",
    keyPoints: [
      "Início 5–10 mg/dia, com incrementos a cada 7 dias conforme resposta.",
      "Reavaliar dor, sono e efeitos adversos a cada janela de titulação.",
      "Atenção a interações com anticoagulantes e anticonvulsivantes.",
    ],
    source: "Pain Medicine, 2024 · Revisão sistemática (n=1.240)",
  },
  {
    tag: "Regulatório",
    title: "Nova RDC para controle especial",
    meta: "2 min",
    summary:
      "Resumo das mudanças na escrituração e na prescrição de produtos de Cannabis sob controle especial, com o que muda na rotina do consultório e os prazos de adequação dos serviços.",
    keyPoints: [
      "Escrituração digital passa a ser obrigatória para controle especial.",
      "Prescrição mantém validade de 30 dias, com retenção da 2ª via.",
      "Prazo de adequação dos serviços definido em 180 dias.",
    ],
    source: "RDC 660/2022 — Anvisa",
  },
  {
    tag: "Casuística",
    title: "Manejo de insônia refratária",
    meta: "5 min",
    summary:
      "Caso clínico de insônia refratária à primeira linha, conduzido com canabinoides associados à higiene do sono. Discute a escolha da razão THC:CBD, o horário de administração e os critérios de reavaliação.",
    keyPoints: [
      "Razão THC:CBD ajustada para predomínio noturno.",
      "Administração 60–90 min antes de dormir.",
      "Higiene do sono mantida como base do tratamento.",
    ],
    source: "Caso clínico WeCann · Núcleo de sono",
  },
  {
    tag: "Evidência",
    title: "Canabinoides e fibromialgia: revisão",
    meta: "6 min",
    summary:
      "Síntese das evidências atuais sobre canabinoides em fibromialgia: desfechos de dor, sono e qualidade de vida, força da recomendação e as principais lacunas metodológicas dos estudos.",
    keyPoints: [
      "Benefício mais consistente em sono e qualidade de vida.",
      "Efeito sobre a dor de magnitude pequena a moderada.",
      "Evidência limitada pela heterogeneidade dos estudos.",
    ],
    source: "Cochrane Database, 2023 · Meta-análise",
  },
  {
    tag: "Prática",
    title: "Desmame de opioides com segurança",
    meta: "3 min",
    summary:
      "Passo a passo de desmame de opioides apoiado por canabinoides, com cronograma de redução percentual e manejo da síndrome de abstinência durante a transição.",
    keyPoints: [
      "Redução de 10–25% da dose a cada 1–2 semanas.",
      "Canabinoides auxiliam no controle dos sintomas de abstinência.",
      "Monitorar risco de recaída e dor de rebote.",
    ],
    source: "Diretriz SBED, 2023",
  },
];

// Ações rápidas da Home (o copiloto Athena vive na coluna direita do shell).
const CHIPS = [
  { label: "Resumir paciente", icon: "bx-user" },
  { label: "Sugerir conduta", icon: "bx-bulb" },
  { label: "Buscar evidência", icon: "bx-search-alt" },
  { label: "Gerar laudo", icon: "bx-receipt" },
];

// CENTRO — "Painel do dia" (foco principal): boas-vindas, ações rápidas e a
// AGENDA do dia. O overlay de novo agendamento desliza em tela cheia (padrão da
// pílula, com scrim desfocado). A IA acompanha pela coluna direita do shell.
export function HomeCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-4">
        {/* Boas-vindas + data */}
        <header className="flex items-end justify-between gap-4 px-1">
          <div className="flex flex-col">
            <h1 className="font-display text-display-m font-medium text-ink">
              Boa tarde, Dra. Helena
            </h1>
            <p className="text-caption text-neutral-500">
              7 compromissos hoje · 2 ações pendentes
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-caption font-medium text-ink">Quinta, 19 de junho</span>
            <span className="font-mono text-micro text-neutral-500">14:02 BRT</span>
          </div>
        </header>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-2 px-1">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              className="glass-frost-inner flex items-center gap-2 rounded-full px-3.5 py-2 text-caption text-neutral-700 transition-colors hover:text-ink"
            >
              <i className={`bx ${chip.icon} text-base text-neutral-500`} />
              {chip.label}
            </button>
          ))}
        </div>

        {/* Agenda do dia — foco principal */}
        <ModuleCard
          eyebrow="Agenda do dia"
          icon="bx-calendar"
          size="lg"
          className="min-h-0 flex-1"
          aside={
            <button
              onClick={() => setComposeOpen(true)}
              aria-label="Novo agendamento"
              className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
            >
              <i className="bx bx-plus text-xl" />
            </button>
          }
        >
          <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {AGENDA.map((item, i) => (
              <li key={item.time}>
                <button
                  onClick={() => goTo("consult")}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/55"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-body font-medium text-ink">{item.name}</span>
                    <span className="truncate text-caption text-neutral-500">
                      {item.condition}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-mono text-caption font-medium text-ink">
                      {item.time}
                    </span>
                    <ActionArrow variant={i === 0 ? "primary" : "ghost"} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </ModuleCard>
      </div>

      {/* Overlay deslizante (padrão da pílula) — tela cheia, scrim desfocado. */}
      <NewAppointmentPanel open={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  );
}

// ESQUERDA — apoio: pacientes recentes (resumo) + pílulas do dia.
export function HomeLeft() {
  const goTo = useFlow((s) => s.goTo);
  const [activePill, setActivePill] = useState<Pill | null>(null);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-4">
        <ModuleCard eyebrow="Pacientes recentes" icon="bx-group" size="sm" className="shrink-0">
          <div className="flex flex-wrap gap-2">
            {RECENT.map((p) => (
              <button
                key={p.initials}
                onClick={() => goTo("consult")}
                title={p.name}
                aria-label={p.name}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/45 bg-white/30 font-mono text-micro text-neutral-600 backdrop-blur-md transition-colors hover:border-ink hover:text-ink"
              >
                {p.initials}
              </button>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard eyebrow="Pílulas do dia" icon="bx-capsule" size="md">
          <ul className="flex flex-col gap-3">
            {PILLS.map((pill) => (
              <li key={pill.title}>
                <button
                  onClick={() => setActivePill(pill)}
                  className="group glass-frost-inner flex w-full flex-col gap-1.5 rounded-[18px] p-3.5 text-left transition-colors hover:bg-white/65"
                >
                  <div className="flex items-center gap-2">
                    <WireBadge tone="mid">{pill.tag}</WireBadge>
                    <span className="font-mono text-micro text-neutral-400">
                      · {pill.meta}
                    </span>
                  </div>
                  <h4 className="text-body font-medium text-ink text-balance">
                    {pill.title}
                  </h4>
                  <p className="line-clamp-2 text-caption text-neutral-500">
                    {pill.summary}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </ModuleCard>
      </div>

      {/* Detalhe da pílula — overlay deslizante (tela cheia, scrim desfocado). */}
      <PillDetailPanel pill={activePill} onClose={() => setActivePill(null)} />
    </>
  );
}

// Botão de ação (ícone). Variantes:
// - "primary": preenchida com tinta (o próximo do dia, em destaque).
// - "ghost": sem borda/fundo, sutil; "acende" no hover do item.
function ActionArrow({
  variant = "default",
}: {
  variant?: "primary" | "ghost" | "default";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-200",
        variant === "primary" && "border-ink bg-ink text-paper",
        variant === "ghost" &&
          "border-transparent text-neutral-400 group-hover:text-ink",
        variant === "default" &&
          "border-neutral-300 text-neutral-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper",
      )}
    >
      <i className="bx bx-right-arrow-alt text-lg" />
    </span>
  );
}
