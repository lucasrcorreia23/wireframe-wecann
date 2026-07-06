"use client";

import { useState } from "react";
import { Avatar, Chip, Icon, WireButton } from "@/components/ui";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `consult` — Tela da consulta, conforme o Figma de referência: header do paciente
// (mesma anatomia do Paciente 360) e DUAS colunas — à esquerda o card "Consulta
// agendada" (Anamnese | Exame físico, Contexto Clínico, Comorbidades e Tratamento
// com validação ✓/✗); à direita a chamada de vídeo + "Notas clínicas". Monocromático;
// o acento crítico aparece só no sinal da Athena (escala pendente do timepoint).

/* ============================ DADOS (mock) ============================ */

const PATIENT = { name: "Marina Castro", seed: "marina" };

// Timepoint do episódio (régua de acompanhamento — ver Paciente 360).
const TIMEPOINT = "M3";
const EPISODE = "CBD 200mg/mL";
const WINDOW = "janela da escala termina em 4 dias";

// Comorbidades para validação rápida durante a anamnese (✓ confirma · ✗ remove).
const COMORBIDITIES: { cid: string; name: string; meta: string }[] = [
  { cid: "M54.5", name: "Dor lombar baixa (crônica)", meta: "há 14 meses · EVA 5/10" },
  { cid: "M79.7", name: "Fibromialgia", meta: "há 2 anos" },
  { cid: "F41.1", name: "Transtorno de ansiedade generalizada", meta: "há 3 anos" },
  { cid: "G47.0", name: "Insônia", meta: "há 1 ano · em controle" },
];

const TREATMENTS: { name: string; meta: string }[] = [
  { name: "Canabidiol full-spectrum", meta: "TIPO III · SUBLINGUAL · 120 MG/DIA" },
  { name: "Tramadol 50mg", meta: "2× AO DIA · EM DESMAME" },
];

/* ============================ HEADER ============================ */

// Header do paciente — mesma anatomia do Paciente 360; ações da consulta à direita
// (Gerar documento · Compartilhar link · Encerrar consulta).
function PatientHeader() {
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);

  return (
    <div className="flex shrink-0 flex-col gap-5">
      <div className="flex items-center gap-6">
        <Avatar name={PATIENT.name} seed={PATIENT.seed} size="md" className="h-12 w-12" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
            Paciente
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => back()}
              aria-label="Voltar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[0.8px] border-neutral-300 bg-paper text-ink transition-colors hover:bg-neutral-100"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[20px] font-medium leading-tight text-ink">
                {PATIENT.name}
              </span>
              <span className="text-caption text-neutral-600">
                38 anos · M54.5 · Dra. Helena Prado · <span className="font-mono">★★☆</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ações da consulta. */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-caption font-medium text-ink transition-colors hover:bg-neutral-100"
          >
            <Icon name="description" size={20} />
            Gerar documento
          </button>
          <WireButton variant="secondary" className="gap-2">
            <Icon name="link" size={18} />
            Compartilhar link da consulta
          </WireButton>
          <WireButton variant="primary" className="gap-2" onClick={() => goTo("clinical-note")}>
            <Icon name="check-circle" size={18} />
            Encerrar consulta
          </WireButton>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-200/70" />
    </div>
  );
}

/* ============================ COLUNA ESQUERDA ============================ */

// Rótulo de bloco dentro do card (Comorbidades / Tratamento) — hairline embaixo.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-neutral-200/80 pb-2">
      <span className="text-body font-medium text-ink">{children}</span>
    </div>
  );
}

// Par de botões ✓/✗ para validação rápida de um item da anamnese.
function ConfirmButtons() {
  const [state, setState] = useState<"none" | "ok" | "no">("none");
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        aria-label="Confirmar"
        aria-pressed={state === "ok"}
        onClick={() => setState((s) => (s === "ok" ? "none" : "ok"))}
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full border-[0.8px] transition-colors duration-[180ms]",
          state === "ok"
            ? "border-ink bg-ink text-paper"
            : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink",
        )}
      >
        <Icon name="check" size={14} />
      </button>
      <button
        type="button"
        aria-label="Remover"
        aria-pressed={state === "no"}
        onClick={() => setState((s) => (s === "no" ? "none" : "no"))}
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full border-[0.8px] transition-colors duration-[180ms]",
          state === "no"
            ? "border-neutral-500 bg-neutral-200 text-ink"
            : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink",
        )}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

// Conteúdo da aba ANAMNESE: Contexto Clínico (colapsável, com o timepoint do
// episódio) · Comorbidades · Tratamento — com validação ✓/✗ por item.
function AnamneseContent() {
  const [ctxOpen, setCtxOpen] = useState(false);

  return (
    <>
      {/* Contexto Clínico — fechado resume o timepoint; aberto detalha o episódio. */}
      <div className="rounded-[16px] bg-paper shadow-[var(--shadow-tab)]">
        <button
          type="button"
          onClick={() => setCtxOpen((v) => !v)}
          aria-expanded={ctxOpen}
          className="flex w-full items-center gap-3 p-3.5 text-left"
        >
          <span className="text-body font-medium text-ink">Contexto Clínico</span>
          <span className="ml-auto shrink-0 font-mono text-micro text-neutral-500">
            {TIMEPOINT} · {EPISODE}
          </span>
          <Icon
            name="chevron-down"
            size={18}
            className={cn(
              "shrink-0 text-neutral-500 transition-transform duration-[180ms]",
              ctxOpen && "rotate-180",
            )}
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-[320ms] ease-out motion-reduce:transition-none",
            ctxOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-2.5 px-3.5 pb-3.5">
              <p className="text-caption leading-relaxed text-neutral-700 text-pretty">
                Marina está em <strong className="font-medium text-ink">{TIMEPOINT}</strong> do uso
                de {EPISODE} para dor lombar crônica. Melhora da dor (EVA 6 → 5) e do sono
                (PSQI 11 → 9); tramadol em desmame.
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip tone="inset" icon="target">
                  {TIMEPOINT} · Basal → M12
                </Chip>
                <Chip tone="muted" icon="time">
                  {WINDOW}
                </Chip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comorbidades — validação rápida. */}
      <div className="flex flex-col gap-1">
        <SectionLabel>Comorbidades</SectionLabel>
        <div className="flex flex-col">
          {COMORBIDITIES.map((c) => (
            <div
              key={c.cid}
              className="flex items-start gap-3 border-b border-neutral-200/60 py-3 last:border-0"
            >
              <span className="w-14 shrink-0 pt-0.5 font-mono text-caption font-medium text-ink">
                {c.cid}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-caption font-medium text-ink text-pretty">{c.name}</span>
                <span className="text-micro text-neutral-500">{c.meta}</span>
              </div>
              <ConfirmButtons />
            </div>
          ))}
        </div>
      </div>

      {/* Tratamento — produto do episódio + coadjuvantes. */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Tratamento</SectionLabel>
        {TREATMENTS.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-3 rounded-[14px] bg-paper px-3.5 py-2.5 shadow-[var(--shadow-tab)]"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-caption font-medium text-ink">{t.name}</span>
              <span className="font-mono text-micro uppercase tracking-[0.06em] text-neutral-500">
                {t.meta}
              </span>
            </div>
            <ConfirmButtons />
          </div>
        ))}
      </div>
    </>
  );
}

// Linha rótulo → conteúdo do exame físico.
function ERow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-neutral-200/60 py-3 first:pt-1 last:border-0">
      <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </span>
      <div className="text-caption leading-relaxed text-neutral-700">{children}</div>
    </div>
  );
}

function ExameFisicoContent() {
  return (
    <div className="flex flex-col">
      <ERow label="Sinais vitais">
        <span className="font-mono">PA 128/82 · FC 76 · FR 16 · SpO₂ 98% · Tax 36,4°C</span>
      </ERow>
      <ERow label="Antropometria">
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="muted">Peso 64kg</Chip>
          <Chip tone="muted">IMC 24,1</Chip>
        </div>
      </ERow>
      <ERow label="Aparelhos">
        <div className="flex flex-wrap gap-1.5">
          {["Cardio normal", "Resp normal", "Abd normal"].map((s) => (
            <Chip key={s} tone="dim">
              {s}
            </Chip>
          ))}
        </div>
      </ERow>
      <ERow label="Musculoesquelético">
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="inset">11/18 tender points</Chip>
          <Chip tone="inset">Lombar dolorosa</Chip>
        </div>
      </ERow>
      <ERow label="Neurológico">Força e sensibilidade preservadas · sem déficit focal.</ERow>
      <ERow label="Red flags">
        <div className="flex items-start gap-2">
          <Chip tone="critical">Atenção</Chip>
          <span>Investigar interação serotoninérgica antes de ajustar dose.</span>
        </div>
      </ERow>
    </div>
  );
}

const TABS = [
  { key: "anamnese", label: "Anamnese" },
  { key: "ef", label: "Exame físico" },
] as const;

// Card "Consulta agendada" — coluna esquerda inteira.
function AgendadaCard() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("anamnese");

  return (
    <section className="no-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto rounded-[20px] bg-[#f9f9f9] p-4">
      {/* Título + tipo da consulta. */}
      <div className="flex items-center gap-2">
        <h2 className="font-display text-[20px] font-medium text-ink">Consulta agendada</h2>
        <Icon name="help" size={16} className="text-neutral-400" />
        <button
          type="button"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-caption text-ink shadow-[var(--shadow-tab)] transition-colors hover:bg-neutral-100"
        >
          <Icon name="brain" size={15} className="text-neutral-600" />
          Neurológica
          <Icon name="chevron-down" size={14} className="text-neutral-400" />
        </button>
      </div>

      {/* Tabs ANAMNESE | EXAME FÍSICO. */}
      <div className="grid shrink-0 grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              "rounded-full px-3 py-2 text-center font-mono text-micro uppercase tracking-[0.1em] transition-colors duration-[180ms]",
              tab === t.key
                ? "bg-paper text-ink shadow-[var(--shadow-tab)]"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sinal Athena — escala estruturalmente esperada e não aplicada no timepoint. */}
      <div className="flex shrink-0 items-center gap-2 rounded-[12px] bg-critical-weak px-3 py-2">
        <Icon name="bot" size={15} className="shrink-0 text-critical" />
        <span className="min-w-0 flex-1 text-caption text-neutral-700 text-pretty">
          {TIMEPOINT} fechando sem PHQ-9 ·{" "}
          <button
            type="button"
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            aplicar agora
          </button>
        </span>
      </div>

      {tab === "anamnese" ? <AnamneseContent /> : <ExameFisicoContent />}
    </section>
  );
}

/* ============================ COLUNA DIREITA ============================ */

// Botão de controle da chamada (redondo; `danger` = encerrar).
function CallControl({
  icon,
  label,
  active = false,
  danger = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition-colors duration-[180ms]",
        danger
          ? "border-transparent bg-ink text-paper hover:bg-neutral-800"
          : active
            ? "border-white/60 bg-paper/85 text-ink"
            : "border-white/30 bg-white/15 text-paper/90 hover:bg-white/25",
      )}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

// Palco da chamada de vídeo — placeholder do paciente + controles.
function VideoPanel() {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  return (
    <div className="relative min-h-[280px] flex-[1.5] overflow-hidden rounded-[20px] bg-neutral-800">
      {/* Placeholder do paciente. */}
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-20 w-20 place-items-center rounded-full border border-paper/25 bg-paper/10 font-display text-display-m text-paper/80">
          MC
        </span>
      </div>

      {/* Self-view (PiP) — topo-direita. */}
      <div className="absolute right-3 top-3 grid h-16 w-24 place-items-center rounded-xl border border-white/25 bg-neutral-700/90 text-paper/70">
        <Icon name="user" size={22} />
        <span className="absolute bottom-1 left-1.5 font-mono text-[10px] text-paper/60">Você</span>
      </div>

      {/* Nome do paciente — rodapé-esquerda. */}
      <span className="absolute bottom-5 left-4 font-mono text-micro text-paper/70">
        {PATIENT.name}
      </span>

      {/* Controles — rodapé-centro. */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/40 to-transparent px-3 pb-4 pt-10">
        <CallControl
          icon={mic ? "microphone" : "microphone-off"}
          label="Microfone"
          active={mic}
          onClick={() => setMic((v) => !v)}
        />
        <CallControl
          icon={cam ? "video" : "video-off"}
          label="Câmera"
          active={cam}
          onClick={() => setCam((v) => !v)}
        />
        <CallControl icon="desktop" label="Compartilhar tela" />
        <CallControl icon="fullscreen" label="Tela cheia" />
        <CallControl icon="captions" label="Transcrição" active />
        <CallControl icon="phone-off" label="Encerrar chamada" danger />
      </div>
    </div>
  );
}

// Notas clínicas — editor livre (mock) com dicas de comando no rodapé.
function NotesCard() {
  return (
    <div className="flex min-h-[200px] flex-1 flex-col gap-3 rounded-[20px] bg-paper p-5 shadow-[var(--shadow-tab)]">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-display text-[20px] font-medium text-ink">Notas clínicas</span>
        <span className="text-caption italic text-neutral-400">
          (Só você consegue visualizar)
        </span>
      </div>
      <div className="flex-1 text-caption text-neutral-400">
        Escreva ou digite &quot;/&quot; para comandos…
      </div>
      <div className="flex items-center gap-4 font-mono text-micro text-neutral-400">
        <span>&quot;/&quot; blocos</span>
        <span>⌘B negrito</span>
        <span>⌘I itálico</span>
        <button
          type="button"
          aria-label="Ditar nota"
          className="ml-auto grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-ink"
        >
          <Icon name="microphone" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ============================ TELA ============================ */

export function ConsultCenter() {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col gap-5 px-8 py-6">
      <PatientHeader />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(340px,2fr)_3fr]">
        <AgendadaCard />
        <div className="flex min-h-0 flex-col gap-4">
          <VideoPanel />
          <NotesCard />
        </div>
      </div>
    </div>
  );
}
