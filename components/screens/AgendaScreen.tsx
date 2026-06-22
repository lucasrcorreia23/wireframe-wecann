import { WireButton, WireBadge, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { cn } from "@/lib/cn";

// `agenda` — módulo de calendário (vista semana) estilo Google Calendar.
// Gutter de horários + 7 colunas de dias; eventos posicionados por hora/duração.
const DAYS = [
  ["Seg", "16"], ["Ter", "17"], ["Qua", "18"], ["Qui", "19"],
  ["Sex", "20"], ["Sáb", "21"], ["Dom", "22"],
];
const START_HOUR = 8;
const HOURS = Array.from({ length: 10 }, (_, i) => START_HOUR + i);

type Ev = { day: number; hour: number; span: number; title: string; sub: string; tone?: "neutral" | "mid" | "hard" };
const EVENTS: Ev[] = [
  { day: 3, hour: 9, span: 1, title: "Marina Castro", sub: "Pré-consulta · Dor", tone: "mid" },
  { day: 3, hour: 10, span: 1, title: "André Lobo", sub: "Fibromialgia" },
  { day: 3, hour: 11, span: 1, title: "Júlia Tavares", sub: "Insônia · 1ª" },
  { day: 1, hour: 8, span: 2, title: "Bloco de retornos", sub: "Teleconsulta" },
  { day: 2, hour: 10, span: 1, title: "Rui Salgado", sub: "Controle especial", tone: "hard" },
  { day: 4, hour: 9, span: 1, title: "Helena Pires", sub: "Retorno" },
  { day: 0, hour: 14, span: 2, title: "Casuística", sub: "Discussão de casos" },
];
const TONE_BAR: Record<NonNullable<Ev["tone"]>, string> = {
  neutral: "border-l-neutral-400",
  mid: "border-l-state-mid",
  hard: "border-l-state-hard",
};

export function AgendaScreen() {
  const cols = `56px repeat(${DAYS.length}, minmax(0, 1fr))`;

  return (
    <div className="flex w-full max-w-[1160px] flex-col gap-4">
      <ModuleCard className="gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WireButton variant="ghost" size="sm">←</WireButton>
            <span className="font-display text-title font-medium text-ink">Junho 2026</span>
            <WireButton variant="ghost" size="sm">→</WireButton>
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

        {/* Grade horária */}
        <div
          className="no-scrollbar grid max-h-[440px] overflow-y-auto"
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
            <div
              key={`${ev.day}-${ev.hour}-${ev.title}`}
              className={cn(
                "glass-frost-inner m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-lg border-l-2 px-2 py-1",
                TONE_BAR[ev.tone ?? "neutral"],
              )}
              style={{
                gridColumn: ev.day + 2,
                gridRow: `${ev.hour - START_HOUR + 1} / span ${ev.span}`,
              }}
            >
              <span className="truncate text-caption font-medium text-ink">{ev.title}</span>
              <span className="truncate font-mono text-micro text-neutral-500">{ev.sub}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Eyebrow>Legenda</Eyebrow>
          <WireBadge>Consulta</WireBadge>
          <WireBadge tone="mid">Pré-consulta</WireBadge>
          <WireBadge tone="hard">Controle especial</WireBadge>
        </div>
      </ModuleCard>
    </div>
  );
}
