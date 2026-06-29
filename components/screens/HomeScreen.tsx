"use client";

import { useState } from "react";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { PillDetailPanel, type Pill } from "./PillDetailPanel";
import { AppointmentSummaryPanel, type Appt } from "./AppointmentSummaryPanel";
import { PATIENTS, type PatientKey } from "./appointments";

// Agenda de hoje — referencia a fonte compartilhada (PATIENTS) e adiciona só os
// campos de exibição da lista. Clicar abre o Preview da Agenda.
const TODAY_ORDER: {
  key: PatientKey;
  time: string;
  duration: string;
  convenio: string;
  modality: "presencial" | "teleconsulta";
  urgent?: boolean;
}[] = [
  { key: "marina", time: "09:30", duration: "30 min", convenio: "Unimed Nacional", modality: "presencial", urgent: true },
  { key: "andre", time: "10:15", duration: "20 min", convenio: "Bradesco Saúde", modality: "teleconsulta" },
  { key: "julia", time: "11:00", duration: "50 min", convenio: "Particular", modality: "presencial" },
  { key: "rui", time: "13:30", duration: "30 min", convenio: "SulAmérica", modality: "presencial" },
  { key: "helena", time: "14:15", duration: "20 min", convenio: "Unimed Nacional", modality: "teleconsulta" },
  { key: "bruno", time: "15:00", duration: "40 min", convenio: "Particular", modality: "presencial" },
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
];

// Sugestões da Athena (visual por ora) — dispostas em CONSTELAÇÃO 2‑3‑1 (Figma):
// 2 na 1ª linha, 3 na 2ª, 1 centralizada na 3ª. Cada pill com ícone próprio
// (bx-*) renderizado como SVG inline pelo <Icon> (vetor de verdade → Figma).
type Suggestion = { label: string; icon: string };

const SUGGESTION_ROWS: readonly (readonly Suggestion[])[] = [
  [
    { label: "Resumir paciente", icon: "bx-user" },
    { label: "Sugerir conduta", icon: "bx-bulb" },
  ],
  [
    { label: "Buscar evidência", icon: "bx-search" },
    { label: "Gerar laudo", icon: "bx-file" },
    { label: "Transcrever", icon: "bx-captions" },
  ],
  [{ label: "Casuística", icon: "bx-collection" }],
];

// HOME — duas colunas (renderizada full-bleed pelo WorkspaceShell):
//  • ESQUERDA (menor): saudação à esquerda → pílulas → próximas agendas, minimalista.
//  • DIREITA (maior): container da Athena — globo (âncora do PersistentGlobe) + status
//    + sugestões (grade 2×3) + input com pills de contexto.
export function HomeCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [selected, setSelected] = useState<Appt | null>(null);
  const [activePill, setActivePill] = useState<Pill | null>(null);

  return (
    <>
      <div className="no-scrollbar flex h-full flex-col items-center overflow-y-auto px-4 pt-[88px] pb-12">
        <div className="grid w-full max-w-[940px] grid-cols-1 items-stretch gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
          {/* ───────────── COLUNA ESQUERDA ───────────── */}
          <div className="flex flex-col gap-4">
            {/* Pílulas — card minimalista (ícone no título e nos itens) */}
            <section className="flex flex-col gap-3 rounded-[12px] border border-[#f7f7f7] bg-white px-[25px] py-[18px]">
              <h3 className="flex items-center gap-2 font-display text-[16px] font-medium text-[#131126]">
                <Icon name="bx-capsule" className="text-base text-neutral-400" />
                Pílulas
              </h3>
              <ul className="flex flex-col gap-0.5">
                {PILLS.map((pill) => (
                  <li key={pill.title}>
                    <button
                      onClick={() => setActivePill(pill)}
                      className="group flex w-full items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 text-left transition-colors hover:bg-neutral-100/70"
                    >
                      <Icon name="bx-news" className="shrink-0 text-base text-neutral-400" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#131126]">
                        {pill.title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase text-[#afafaf]">
                        {pill.meta}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Próximas agendas — card minimalista (ícone no título e nos itens) */}
            <section className="flex flex-col gap-3 rounded-[12px] border border-[#f7f7f7] bg-white px-[25px] py-[18px]">
              <h3 className="flex items-center gap-2 font-display text-[16px] font-medium text-[#131126]">
                <Icon name="bx-calendar" className="text-base text-neutral-400" />
                Agenda de hoje
              </h3>
              <ul className="flex flex-col gap-0.5">
                {TODAY_ORDER.map((slot) => {
                  const p = PATIENTS[slot.key];
                  return (
                    <li key={slot.key}>
                      <button
                        onClick={() =>
                          setSelected({
                            ...p,
                            time: slot.time,
                            duration: slot.duration,
                            convenio: slot.convenio,
                            modality: slot.modality,
                            urgent: slot.urgent,
                          })
                        }
                        className="group flex w-full items-center gap-3 rounded-[8px] px-1.5 py-1.5 text-left transition-colors hover:bg-neutral-100/70"
                      >
                        <Icon
                          name={slot.urgent ? "bx-error-circle" : "bx-time-five"}
                          className={cn(
                            "shrink-0 text-base",
                            slot.urgent ? "text-[#ff3838]" : "text-neutral-400",
                          )}
                        />
                        <span className="w-[42px] shrink-0 font-mono text-[12px] tabular-nums text-[#131126]">
                          {slot.time}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#131126]">
                          {p.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase text-[#afafaf]">
                          {p.type}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* ───────────── COLUNA DIREITA — container da Athena ───────────── */}
          <section className="relative flex min-h-[560px] flex-col rounded-[12px] border border-[#f7f7f7] bg-white p-[25px]">
            {/* Topo — saudação à esquerda, data/hora à direita */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-[25px] font-medium leading-[30px] text-[#131126]">
                  Boa tarde, Dra. Helena
                </h1>
                <p className="font-mono text-[12px] uppercase leading-[19.6px] text-[#afafaf]">
                  Você tem 7 compromissos hoje
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end font-mono uppercase leading-[19.6px] text-[#afafaf]">
                <span className="text-[14px]">Quinta, 19 de junho</span>
                <span className="text-[12px]">14:02 BRT</span>
              </div>
            </div>

            {/* Centro — globo + status + sugestões */}
            <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
              {/* Âncora do PersistentGlobe (o globo voa para cá e escala p/ este tamanho). */}
              <div data-globe-anchor className="h-[100px] w-[100px] shrink-0" />

              <div className="flex flex-col items-center gap-1.5 text-center">
                <p className="font-mono text-[25px] font-medium leading-none text-[#18181a]">athena</p>
                <p className="font-mono text-[12px] uppercase text-[#131126]">
                  Aguardando suas instruções ou comando de voz
                </p>
              </div>

              {/* Sugestões — constelação 2‑3‑1, só texto */}
              <div className="flex flex-col items-center gap-2 pt-1">
                {SUGGESTION_ROWS.map((row, i) => (
                  <div key={i} className="flex flex-wrap justify-center gap-x-10 gap-y-2">
                    {row.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        className="flex items-center gap-1.5 rounded-full px-2 py-1.5 font-mono text-[12px] text-[#afafaf] transition-colors hover:text-[#131126]"
                      >
                        <Icon name={s.icon} className="text-[14px]" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Input + pill de contexto + microfone */}
            <div className="flex flex-col gap-3 rounded-[24px] border border-[#f7f7f7] bg-white/25 p-[17px]">
              <input
                placeholder="Pergunte à Athena ou dê instruções…"
                className="w-full bg-transparent px-1 font-mono text-[12px] text-[#131126] placeholder:text-[#afafaf] focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <ContextPill label="Núcleo clínico" />
                <button
                  type="button"
                  aria-label="Comando de voz"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-[#f7f7f7] text-[#131126] transition-colors hover:bg-neutral-100/70"
                >
                  <Icon name="bx-microphone" className="text-lg" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Detalhe da pílula — overlay deslizante. */}
      <PillDetailPanel pill={activePill} onClose={() => setActivePill(null)} />

      {/* Preview Pré-Consulta — o mesmo da Agenda. */}
      <AppointmentSummaryPanel
        appt={selected}
        onClose={() => setSelected(null)}
        onGoConsult={() => goTo("consult")}
        onGoProfile={() => goTo("pre-review")}
      />
    </>
  );
}

// Pill de contexto do input — apenas o rótulo (sem o losango da marca).
function ContextPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center rounded-[40px] border border-[#f7f7f7] px-[13px] py-[9px] transition-colors hover:bg-neutral-100/70"
    >
      <span className="font-mono text-[12px] uppercase text-[#131126]">{label}</span>
    </button>
  );
}
