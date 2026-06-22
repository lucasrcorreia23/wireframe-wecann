"use client";

import { useFlow } from "@/flow/store";
import { WireBadge } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
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

const PILLS = [
  { tag: "Farmacologia", title: "Titulação de CBD em dor neuropática", meta: "4 min" },
  { tag: "Regulatório", title: "Nova RDC para controle especial", meta: "2 min" },
  { tag: "Casuística", title: "Manejo de insônia refratária", meta: "5 min" },
  { tag: "Evidência", title: "Canabinoides e fibromialgia: revisão", meta: "6 min" },
  { tag: "Prática", title: "Desmame de opioides com segurança", meta: "3 min" },
];

// Chips de funcionalidades da IA (equivalentes clínicos do WeCann).
const CHIPS = [
  { label: "Resumir paciente", icon: "bx-user" },
  { label: "Sugerir conduta", icon: "bx-bulb" },
  { label: "Buscar evidência", icon: "bx-search-alt" },
  { label: "Gerar laudo", icon: "bx-receipt" },
  { label: "Transcrever", icon: "bx-microphone" },
  { label: "Casuística", icon: "bx-bar-chart-alt-2" },
];

// Home — Athena (IA) CENTRAL: coluna do meio = painel da IA (boas-vindas, globo,
// chips e chat). Agenda preenchida à esquerda; pílulas à direita. O globo 3D
// billboarda no meio da coluna central.
export function HomeScreen() {
  const goTo = useFlow((s) => s.goTo);

  return (
    <div
      className="grid h-[min(820px,calc(100vh-6rem))] w-full max-w-[1280px] items-stretch gap-4"
      style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr) minmax(0,1fr)" }}
    >
      {/* ───── Esquerda — Agenda do dia (preenchida + novo agendamento) ───── */}
      <ModuleCard
        eyebrow="Agenda do dia"
        aside={
          <button
            aria-label="Novo agendamento"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 bg-paper text-ink transition-colors hover:border-neutral-500"
          >
            <i className="bx bx-plus text-xl" />
          </button>
        }
        className="min-h-0"
      >
        <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {AGENDA.map((item) => (
            <li key={item.time}>
              <button
                onClick={() => goTo("pre-review")}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/55"
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
                  <ActionArrow urgent={item.urgent} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </ModuleCard>

      {/* ───── Centro — painel da IA (container de vidro único; globo desfocado atrás) ───── */}
      <div className="glass-panel-blue backdrop-blur-xl flex min-h-0 flex-col rounded-[28px] p-6">
        {/* Boas-vindas + data */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="font-display text-title font-medium text-ink">
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

        {/* Espaço do globo (billboard 3D atrás) */}
        <div className="flex-1" />

        {/* Estado da IA */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-display text-title font-medium text-ink">Athena pronta</p>
          <p className="text-caption text-neutral-600">
            Aguardando suas instruções ou comando de voz
          </p>
        </div>

        {/* Chips de funcionalidades */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
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

        {/* Espaço antes do chat */}
        <div className="flex-[0.4]" />

        {/* Input de chat (camada interna do container) */}
        <section className="glass-frost-inner flex flex-col gap-3 rounded-[20px] p-4">
          <input
            type="text"
            placeholder="Pergunte à Athena ou dê instruções…"
            className="w-full bg-transparent px-1 text-body text-ink placeholder:text-neutral-400 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <button className="glass-frost-inner flex items-center gap-2 rounded-full px-3 py-1.5 text-caption text-neutral-700">
              <i className="bx bx-chip text-base text-neutral-500" />
              Núcleo clínico
              <i className="bx bx-chevron-down text-base text-neutral-400" />
            </button>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-full px-2 py-1.5 text-caption text-neutral-600 hover:text-ink">
                Rápido
                <i className="bx bx-chevron-down text-base text-neutral-400" />
              </button>
              <button
                aria-label="Comando de voz"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper"
              >
                <i className="bx bx-microphone text-lg" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ───── Direita — Recentes (compacto) + Pílulas preenchendo até embaixo ───── */}
      <div className="flex min-h-0 flex-col gap-4">
        <ModuleCard eyebrow="Pacientes Recentes">
          <div className="flex flex-wrap gap-2">
            {RECENT.map((p) => (
              <button
                key={p.initials}
                onClick={() => goTo("pre-review")}
                title={p.name}
                aria-label={p.name}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/45 bg-white/30 font-mono text-micro text-neutral-600 backdrop-blur-md transition-colors hover:border-ink hover:text-ink"
              >
                {p.initials}
              </button>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard eyebrow="Pílulas do dia" className="min-h-0 flex-1">
          <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {PILLS.map((pill) => (
              <li key={pill.title}>
                <button className="group glass-frost-inner flex w-full flex-col gap-2 rounded-[18px] p-4 text-left transition-colors hover:bg-white/65">
                  <div className="flex items-center justify-between gap-2">
                    <WireBadge tone="mid">{pill.tag}</WireBadge>
                    <span className="font-mono text-micro text-neutral-400">
                      {pill.meta}
                    </span>
                  </div>
                  <h4 className="text-body font-medium text-ink text-pretty">
                    {pill.title}
                  </h4>
                  <div className="flex justify-end">
                    <ActionArrow />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </ModuleCard>
      </div>
    </div>
  );
}

// Botão de ação (ícone) com hover proprietário: a seta "acende" (preenche com
// tinta) ao passar o mouse no item. Em itens urgentes já vem preenchida.
function ActionArrow({ urgent = false }: { urgent?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-200",
        urgent
          ? "border-ink bg-ink text-paper"
          : "border-neutral-300 text-neutral-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper",
      )}
    >
      <i className="bx bx-right-arrow-alt text-lg" />
    </span>
  );
}
