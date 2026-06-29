"use client";

import { useEffect, useState } from "react";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
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

// Chips de atalho (contrato 6.4) — 4 temas adaptados à prática do médico. Cada um
// dispara uma pergunta pronta à Athena (aqui, preenche o composer). "Operacional"
// vem SEM "(& receita)" porque o financeiro está desligado no MVP (contrato §2.4).
const SHORTCUTS: { label: string; query: string }[] = [
  { label: "Minha casuística", query: "Mostre minha casuística por patologia neste trimestre." },
  { label: "Outcomes clínicos", query: "Como está a resposta ao tratamento dos meus pacientes?" },
  { label: "Operacional", query: "Resumo operacional: no-show, pendências e confirmações da agenda." },
  { label: "Segurança clínica", query: "Quais pacientes precisam de reavaliação ou ajuste de medicação contínua?" },
];

// KPIs do dia (contrato 6.1) — 3 variações mutuamente exclusivas conforme a agenda.
// Wireframe: estado "com agenda" como padrão; trocar DAY_STATS revela os outros.
type DayStats = {
  todayCount: number;
  nextInMinutes: number | null; // null = agenda do dia concluída
  nextDayCount: number;
  nextDayLabel: string | null; // ex.: "qua, 30/04"
};

const DAY_STATS: DayStats = {
  todayCount: 7,
  nextInMinutes: 12,
  nextDayCount: 0,
  nextDayLabel: null,
};

function dayKpiLine(s: DayStats): string {
  if (s.todayCount > 0) {
    return s.nextInMinutes != null
      ? `${s.todayCount} atendimentos hoje · próxima em ${s.nextInMinutes} min`
      : `${s.todayCount} atendimentos hoje · agenda concluída`;
  }
  if (s.nextDayCount > 0 && s.nextDayLabel) {
    return `hoje livre · ${s.nextDayCount} agendamentos ${s.nextDayLabel}`;
  }
  return "agenda livre";
}

// HOME — duas colunas (renderizada full-bleed pelo WorkspaceShell):
//  • ESQUERDA (menor): saudação à esquerda → pílulas → próximas agendas, minimalista.
//  • DIREITA (maior): container da Athena — globo (âncora do PersistentGlobe) + KPIs do
//    dia (6.1) + "Como posso ajudá-la?" + chips de atalho (6.4, 2×2) + composer (6.3:
//    voz · LGPD · enviar).
export function HomeCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [selected, setSelected] = useState<Appt | null>(null);
  const [activePill, setActivePill] = useState<Pill | null>(null);

  // Composer (6.3) — input controlado + estado mock de ditado por voz. Sem modo
  // conversa ainda (thread / botão "parar" = 6.6/6.7, fora deste escopo): enviar
  // apenas limpa o campo.
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Cronômetro do ditado: o intervalo só roda enquanto grava; o zero é reposto no
  // toggle (evita setState síncrono dentro do efeito).
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const toggleVoice = () => {
    setSeconds(0);
    setRecording((r) => !r);
  };

  const canSend = value.trim().length > 0;
  const handleSend = () => {
    if (!canSend) return;
    setValue("");
  };
  const recLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <>
      <div className="no-scrollbar flex h-full flex-col items-center justify-center overflow-y-auto px-4 pt-6 pb-12">
        <div className="grid w-full max-w-[940px] grid-cols-1 items-stretch gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
          {/* ───────────── COLUNA ESQUERDA ───────────── */}
          <div className="flex flex-col gap-4">
            {/* Saudação — alinhada à esquerda */}
            <div className="flex flex-col gap-1 px-1">
              <h1 className="font-display text-[25px] font-medium leading-[30px] text-[#131126]">
                Boa tarde, Dra. Helena
              </h1>
              <p className="font-mono text-[12px] uppercase leading-[19.6px] text-[#afafaf]">
                7 compromissos hoje · 2 ações pendentes
              </p>
            </div>

            {/* Pílulas — card minimalista */}
            <section className="flex flex-col gap-3 rounded-[12px] border border-[#f7f7f7] bg-white px-[25px] py-[18px]">
              <h3 className="font-display text-[16px] font-medium text-[#131126]">→ Pílulas</h3>
              <ul className="flex flex-col gap-0.5">
                {PILLS.map((pill) => (
                  <li key={pill.title}>
                    <button
                      onClick={() => setActivePill(pill)}
                      className="group flex w-full items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 text-left transition-colors hover:bg-neutral-100/70"
                    >
                      <Dot />
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

            {/* Próximas agendas — card minimalista */}
            <section className="flex flex-col gap-3 rounded-[12px] border border-[#f7f7f7] bg-white px-[25px] py-[18px]">
              <h3 className="font-display text-[16px] font-medium text-[#131126]">→ Agenda de hoje</h3>
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
            {/* Topo — data/hora + KPIs do dia (6.1) à direita */}
            <div className="flex items-start justify-end">
              <div className="flex flex-col items-end font-mono uppercase leading-[19.6px] text-[#afafaf]">
                <span className="text-[14px]">Quinta, 19 de junho</span>
                <span className="text-[12px]">14:02 BRT</span>
                <span className="text-[12px] text-[#131126]">{dayKpiLine(DAY_STATS)}</span>
              </div>
            </div>

            {/* Centro — globo + saudação ("Como posso ajudá-la?") + chips de atalho */}
            <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
              {/* Âncora do PersistentGlobe (o globo voa para cá; escala p/ ~72px). */}
              <div data-globe-anchor className="h-[72px] w-[72px] shrink-0" />

              <div className="flex flex-col items-center gap-1.5 text-center">
                <p className="font-mono text-[25px] font-medium leading-none text-[#18181a]">athena</p>
                <p className="font-mono text-[12px] uppercase text-[#131126]">
                  Como posso ajudá-la, Dra. Helena?
                </p>
              </div>

              {/* Chips de atalho (6.4) — 4 temas, grade 2×2; clicar preenche o composer */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 pt-1">
                {SHORTCUTS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setValue(s.query)}
                    className="group flex items-center justify-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-neutral-100/70"
                  >
                    <Dot />
                    <span className="font-mono text-[12px] text-[#afafaf] transition-colors group-hover:text-[#131126]">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Composer (6.3/6.7) — input + barra de ações (voz · LGPD · enviar) */}
            <div className="flex flex-col gap-3 rounded-[24px] border border-[#f7f7f7] bg-white/25 p-[17px]">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pergunte à Athena ou dê instruções…"
                className="w-full bg-transparent px-1 font-mono text-[12px] text-[#131126] placeholder:text-[#afafaf] focus:outline-none"
              />
              <div className="flex items-center justify-between">
                {/* Esquerda — voz (estado mock "gravando") + LGPD */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    aria-label={recording ? "Parar gravação" : "Ditar por voz"}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-[13px] py-[9px] transition-colors",
                      recording ? "bg-neutral-100/80" : "hover:bg-neutral-100/70",
                    )}
                  >
                    <Icon
                      name="microphone"
                      size={16}
                      className={cn("text-[#131126]", recording && "animate-pulse")}
                    />
                    {recording ? (
                      <span className="font-mono text-[12px] tabular-nums text-[#131126]">
                        {recLabel}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    title="Seus dados protegidos · LGPD"
                    className="flex items-center gap-1.5 rounded-full px-[13px] py-[9px] transition-colors hover:bg-neutral-100/70"
                  >
                    <Icon name="shield" size={16} className="text-[#131126]" />
                    <span className="font-mono text-[12px] uppercase text-[#131126]">LGPD</span>
                  </button>
                </div>

                {/* Direita — enviar; gradiente da marca quando há texto */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  aria-label="Enviar"
                  className="grid size-9 shrink-0 place-items-center rounded-full transition-opacity disabled:cursor-not-allowed"
                  style={
                    canSend
                      ? { background: "linear-gradient(135deg, #7cedc4 0%, #489eff 55%, #ff3838 100%)" }
                      : { background: "#ededeb" }
                  }
                >
                  <Icon name="send" size={16} className={canSend ? "text-white" : "text-[#afafaf]"} />
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

// Pontinho multicolor (eco do globo) — usado nas pílulas, agenda e sugestões.
function Dot() {
  return (
    <span
      aria-hidden
      className="size-2 shrink-0 rounded-full"
      style={{
        background: "radial-gradient(circle at 30% 30%, #7cedc4 0%, #489eff 55%, #ff3838 100%)",
      }}
    />
  );
}
