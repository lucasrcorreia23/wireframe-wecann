"use client";

import { WireButton, WireBadge, Eyebrow } from "@/components/ui";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { cn } from "@/lib/cn";

// Agendamento da agenda — `patient` é uma consulta de paciente (abre perfil 360 /
// consulta); `block` é um bloco genérico (casuística, retornos) sem paciente único.
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

// Painel de resumo do agendamento — overlay local sobre a Agenda. É o próprio vidro
// (backdrop-filter próprio) e desliza pela direita via transição CSS (transform no
// PRÓPRIO painel é seguro p/ o blur; só transform em ANCESTRAL mataria o vidro dos
// filhos). Acionado ao clicar num evento da grade.
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
  const when = appt
    ? `${DAY_LABELS[dayIdx]} ${DAY_DATES[dayIdx]} · ${String(appt.hour).padStart(2, "0")}:00 · ${durationLabel(appt.span)}`
    : "";

  return (
    // backdrop=false: a Agenda recua os cards (.orbit-pane) — o recuo é o "fundo".
    <SlideOverPanel
      open={open}
      onClose={onClose}
      backdrop={false}
      className="max-w-[560px]"
      label="Resumo do agendamento"
    >
        <header className="flex items-start gap-3">
          <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
            <i
              className={cn(
                "bx text-xl",
                isPatient ? "bx-calendar-event" : "bx-collection",
              )}
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Eyebrow>
              {appt?.type ?? (isPatient ? "Consulta" : "Bloco")} · {when}
            </Eyebrow>
            <h2 className="font-display text-title font-medium text-ink text-pretty">
              {appt?.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </header>

        <ScrollFade className="mt-6 min-h-0 flex-1" watch={appt?.title}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-1.5">
              <WireBadge tone={tone}>{TONE_LABEL[tone]}</WireBadge>
            </div>

            {isPatient ? (
              <>
                <section className="flex flex-col gap-2">
                  <Eyebrow>Motivo</Eyebrow>
                  <p className="text-body text-pretty text-neutral-700">
                    {appt?.reason ?? appt?.sub}
                  </p>
                </section>

                {appt?.patientMeta ? (
                  <section className="flex flex-col gap-2">
                    <Eyebrow>Paciente</Eyebrow>
                    <p className="text-body text-pretty text-neutral-700">
                      {appt.patientMeta}
                    </p>
                  </section>
                ) : null}
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

        <footer className="mt-6 flex items-center justify-end gap-3 border-t border-white/50 pt-5">
          {isPatient ? (
            <>
              <WireButton variant="ghost" onClick={onGoConsult} className="gap-2">
                <i className="bx bx-video text-lg" />
                Ir para a consulta
              </WireButton>
              <WireButton variant="primary" onClick={onGoProfile} className="gap-2">
                <i className="bx bx-user text-lg" />
                Ver perfil 360
              </WireButton>
            </>
          ) : (
            <WireButton variant="ghost" onClick={onClose}>
              Fechar
            </WireButton>
          )}
        </footer>
    </SlideOverPanel>
  );
}
