"use client";

import { useFlow } from "@/flow/store";
import { WireBadge, WireButton } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";

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
];

const PILLS = [
  { tag: "Farmacologia", title: "Titulação de CBD em dor neuropática", meta: "4 min" },
  { tag: "Regulatório", title: "Nova RDC para controle especial", meta: "2 min" },
];

const ATHENA_SUGGESTIONS = [
  "Revisar pré-consulta de Marina Castro",
  "Confirmar agenda das 10h",
  "2 receitas de controle especial venceram",
];

// Home — Athena (IA) CENTRAL (exceção da jornada): o globo billboarda no centro.
// Agenda do dia à esquerda; recentes + pílulas à direita. Módulos de vidro
// flutuando sobre o globo.
export function HomeScreen() {
  const goTo = useFlow((s) => s.goTo);

  return (
    <div
      className="grid h-[min(780px,86vh)] w-full max-w-[1240px] items-stretch gap-4"
      style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.25fr) minmax(0,1fr)" }}
    >
      {/* Esquerda — Agenda do dia */}
      <ModuleCard eyebrow="Agenda do dia" className="min-h-0">
        <p className="text-caption text-neutral-500">
          Quinta, 19 de junho · 7 compromissos
        </p>
        <ul className="flex flex-col gap-3">
          {AGENDA.map((item) => (
            <li
              key={item.time}
              className="flex flex-col gap-1.5 border-b border-white/40 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-caption font-medium text-ink">
                  {item.time}
                </span>
                <span className="text-body font-medium text-ink">{item.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate text-caption text-neutral-500">
                  {item.condition}
                </p>
                <WireButton
                  variant={item.urgent ? "primary" : "secondary"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => goTo("pre-review")}
                >
                  {item.urgent ? "Revisar" : "Abrir"}
                </WireButton>
              </div>
            </li>
          ))}
        </ul>
      </ModuleCard>

      {/* Centro — Athena: o GLOBO 3D é o centro visual (atrás); chat na base. */}
      <div className="flex min-h-0 flex-col justify-end gap-4">
        {/* Espaço transparente onde o globo aparece (billboard 3D atrás). */}
        <div className="flex-1" />

        <section className="glass-panel-blue flex flex-col gap-3 rounded-[28px] p-6">
          <ul className="flex flex-col gap-2">
            {ATHENA_SUGGESTIONS.map((text) => (
              <li
                key={text}
                className="glass-frost-inner rounded-2xl px-3 py-2.5 text-caption text-neutral-700"
              >
                {text}
              </li>
            ))}
          </ul>
          <div className="glass-frost-inner flex items-center gap-2 rounded-full py-2 pl-4 pr-2">
            <span className="flex-1 truncate text-caption text-neutral-400">
              Pergunte à Athena…
            </span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-paper">
              <i className="bx bx-right-arrow-alt text-lg" />
            </span>
          </div>
        </section>
      </div>

      {/* Direita — Recentes + Pílulas do dia */}
      <div className="flex min-h-0 flex-col gap-4">
        <ModuleCard eyebrow="Recentes">
          <div className="flex flex-wrap gap-2">
            {RECENT.map((p) => (
              <button
                key={p.initials}
                onClick={() => goTo("pre-review")}
                title={p.name}
                aria-label={p.name}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/45 bg-white/30 font-mono text-micro text-neutral-600 backdrop-blur-md transition-colors hover:border-ink hover:text-ink"
              >
                {p.initials}
              </button>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard eyebrow="Pílulas do dia" className="min-h-0">
          <ul className="flex flex-col gap-3">
            {PILLS.map((pill) => (
              <li
                key={pill.title}
                className="glass-frost-inner flex flex-col gap-2 rounded-[18px] p-4"
              >
                <div className="flex items-center justify-between">
                  <WireBadge tone="mid">{pill.tag}</WireBadge>
                  <span className="font-mono text-micro text-neutral-400">
                    {pill.meta}
                  </span>
                </div>
                <h4 className="text-body font-medium text-ink text-pretty">
                  {pill.title}
                </h4>
                <span className="text-caption text-neutral-500">Abrir →</span>
              </li>
            ))}
          </ul>
        </ModuleCard>
      </div>
    </div>
  );
}
