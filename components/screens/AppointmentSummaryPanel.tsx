"use client";

import { WireButton, WireBadge, Eyebrow, Avatar, Icon } from "@/components/ui";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { cn } from "@/lib/cn";

// Modal Preview Pré-Consulta (T-06a) — o "resumo de 30s" que abre da Agenda ANTES
// do perfil completo. Resolve a dor do shadowing (agenda sem contexto): foto +
// diagnóstico principal + tempo de acompanhamento direto na pré-visualização, sem
// abrir o prontuário inteiro. Daqui o médico bifurca: perfil 360 ou iniciar consulta.
//
// `patient` é uma consulta de paciente; `block` é um bloco genérico sem paciente
// único. Neutro/sem cor: criticidade por PESO (tone mid/hard), nunca por matiz.
export type PreState = "respondida" | "pendente" | "nao-enviada" | "primeira";

export type Appt = {
  kind: "patient" | "block";
  day: number;
  hour: number;
  span: number;
  title: string;
  sub: string;
  tone?: "neutral" | "mid" | "hard";
  type?: string;
  reason?: string;
  patientMeta?: string;
  // ── Preview pré-consulta (T-06a) ──
  age?: number;
  photoSeed?: string;
  /** Diagnóstico principal: CID + nome (destaque na listagem, faltava na agenda). */
  mainDiagnosis?: { cid: string; name: string };
  /** Tempo de acompanhamento ("há 8 meses" | "1ª consulta"). */
  followUp?: string;
  /** Estado da pré-anamnese — dirige o bloco de resumo (4 estados). */
  preState?: PreState;
  /** Resumo de 30s: queixa + mudanças desde a última (pré-anamnese respondida). */
  highlights?: string[];
  /** Alertas clínicos (alergia/interação) — peso de cinza, não cor. */
  alerts?: { label: string; tone: "mid" | "hard" }[];
  // ── RWE (Fase 3) ──
  episode?: string;
  timepoint?: string;
  stars?: number;
  // ── Exibição na lista (Home · "Agenda do dia") ──
  time?: string;
  duration?: string;
  convenio?: string;
  modality?: "presencial" | "teleconsulta";
  urgent?: boolean;
};

const TONE_LABEL: Record<NonNullable<Appt["tone"]>, string> = {
  neutral: "Consulta",
  mid: "Pré-consulta",
  hard: "Controle especial",
};

// Índice do agendamento (`day`) segue a ordem das colunas da grade da Agenda:
// 0 = Seg(16) … 6 = Dom(22).
const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAY_DATES = ["16", "17", "18", "19", "20", "21", "22"];

function durationLabel(span: number) {
  return span === 1 ? "1 h" : `${span} h`;
}

function stars(n = 0) {
  const f = Math.max(0, Math.min(3, n));
  return "★".repeat(f) + "☆".repeat(3 - f);
}

// Bloco do estado da pré-anamnese — a "camada 1" da apresentação progressiva.
function PreAnamnese({ appt, onSend }: { appt: Appt; onSend: () => void }) {
  const state = appt.preState ?? "primeira";

  if (state === "respondida") {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Pré-anamnese · síntese</Eyebrow>
          {appt.stars ? (
            <span
              className="font-mono text-caption text-neutral-400"
              title="Qualidade de dados RWE"
            >
              {stars(appt.stars)}
            </span>
          ) : null}
        </div>
        <ul className="flex flex-col gap-2">
          {(appt.highlights ?? []).map((h) => (
            <li
              key={h}
              className="glass-frost-inner flex items-start gap-2.5 rounded-2xl px-3 py-2.5"
            >
              <Icon name="chevron-right" size={16} className="mt-0.5 text-neutral-400" />
              <span className="text-caption text-neutral-700 text-pretty">{h}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (state === "primeira") {
    return (
      <section className="flex items-center gap-3">
        <WireBadge>1ª consulta</WireBadge>
        <span className="text-caption text-neutral-600 text-pretty">
          Primeira consulta · sem histórico no prontuário.
        </span>
      </section>
    );
  }

  // pendente | nao-enviada
  const pending = state === "pendente";
  return (
    <section className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3">
      <div className="flex items-center gap-3">
        <WireBadge tone="mid">Pré-anamnese</WireBadge>
        <span className="text-caption text-neutral-700 text-pretty">
          {pending
            ? "Enviada · aguardando resposta do paciente."
            : "Ainda não enviada ao paciente."}
        </span>
      </div>
      {!pending ? (
        <WireButton variant="secondary" size="sm" onClick={onSend} className="shrink-0 gap-1.5">
          <Icon name="send" size={16} />
          Enviar
        </WireButton>
      ) : null}
    </section>
  );
}

export function AppointmentSummaryPanel({
  appt,
  onClose,
  onGoConsult,
  onGoProfile,
}: {
  appt: Appt | null;
  onClose: () => void;
  onGoConsult: () => void;
  onGoProfile: () => void;
}) {
  const open = appt !== null;
  const isPatient = appt?.kind === "patient";
  const tone = appt?.tone ?? "neutral";

  const dayIdx = appt ? appt.day : 0;
  // Home passa `time` (hoje); a Agenda usa a posição da grade (dia/hora).
  const when = appt
    ? appt.time
      ? `Hoje · ${appt.time}${appt.duration ? ` · ${appt.duration}` : ""}`
      : `${DAY_LABELS[dayIdx]} ${DAY_DATES[dayIdx]} · ${String(appt.hour).padStart(2, "0")}:00 · ${durationLabel(appt.span)}`
    : "";

  return (
    <SlideOverPanel
      open={open}
      onClose={onClose}
      className="max-w-[600px]"
      label="Preview da pré-consulta"
      footer={
        isPatient ? (
          <>
            <WireButton variant="ghost" onClick={onGoProfile} className="gap-2">
              <Icon name="user" size={18} />
              Ver perfil completo
            </WireButton>
            <WireButton variant="primary" onClick={onGoConsult} className="gap-2">
              <Icon name="video" size={18} />
              Iniciar consulta
            </WireButton>
          </>
        ) : (
          <WireButton variant="ghost" onClick={onClose}>
            Fechar
          </WireButton>
        )
      }
    >
      <header className="flex items-start gap-3">
        {isPatient && appt ? (
          <Avatar name={appt.title} seed={appt.photoSeed} size="md" />
        ) : (
          <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
            <Icon name="collection" size={20} />
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <Eyebrow>
            {appt?.type ?? (isPatient ? "Consulta" : "Bloco")} · {when}
          </Eyebrow>
          <h2 className="font-display text-title font-medium text-ink text-pretty">
            {appt?.title}
          </h2>
          {isPatient && (appt?.age || appt?.followUp || appt?.convenio) ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-neutral-500">
              {[
                appt?.age ? `${appt.age} anos` : null,
                appt?.followUp ?? null,
                appt?.convenio ?? null,
              ]
                .filter(Boolean)
                .map((bit, idx) => (
                  <span key={bit} className="inline-flex items-center gap-2">
                    {idx > 0 ? (
                      <span aria-hidden className="text-neutral-300">·</span>
                    ) : null}
                    {bit}
                  </span>
                ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
        >
          <Icon name="x" size={24} />
        </button>
      </header>

      <ScrollFade className="mt-6 min-h-0 flex-1 pb-24" watch={appt?.title}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <WireBadge tone={tone}>{TONE_LABEL[tone]}</WireBadge>
            {appt?.episode ? (
              <WireBadge tone="soft">
                Episódio · {appt.episode}
                {appt?.timepoint ? ` · ${appt.timepoint}` : ""}
              </WireBadge>
            ) : null}
          </div>

          {isPatient ? (
            <>
              {appt?.mainDiagnosis ? (
                <section className="flex flex-col gap-2">
                  <Eyebrow>Diagnóstico principal</Eyebrow>
                  <div className="glass-frost-inner flex items-center gap-3 rounded-2xl px-3.5 py-3">
                    <span className="shrink-0 rounded-md border border-neutral-300 bg-paper px-2 py-1 font-mono text-caption text-ink">
                      {appt.mainDiagnosis.cid}
                    </span>
                    <span className="text-body text-neutral-700 text-pretty">
                      {appt.mainDiagnosis.name}
                    </span>
                  </div>
                </section>
              ) : null}

              {appt?.alerts?.length ? (
                <section className="flex flex-col gap-2">
                  <Eyebrow icon="bx-error-circle">Alertas</Eyebrow>
                  <ul className="flex flex-col gap-1.5">
                    {appt.alerts.map((a) => (
                      <li
                        key={a.label}
                        className={cn(
                          "glass-frost-inner flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5",
                          a.tone === "hard" && "border border-state-hard/40",
                        )}
                      >
                        <WireBadge tone={a.tone}>
                          {a.tone === "hard" ? "Crítico" : "Atenção"}
                        </WireBadge>
                        <span className="text-caption text-neutral-700 text-pretty">
                          {a.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <PreAnamnese appt={appt!} onSend={onClose} />

              <section className="flex flex-col gap-2">
                <Eyebrow>Motivo</Eyebrow>
                <p className="text-body text-pretty text-neutral-700">
                  {appt?.reason ?? appt?.sub}
                </p>
              </section>
            </>
          ) : (
            <section className="flex flex-col gap-2">
              <Eyebrow>Descrição</Eyebrow>
              <p className="text-body text-pretty text-neutral-700">
                {appt?.reason ?? appt?.sub}
              </p>
            </section>
          )}
        </div>
      </ScrollFade>
    </SlideOverPanel>
  );
}
