"use client";

import { useRef, useState } from "react";
import { useFlow } from "@/flow/store";
import { gsap, useGSAP } from "@/lib/gsap";
import { WireBadge } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { NewAppointmentPanel } from "./NewAppointmentPanel";
import { PillDetailPanel } from "./PillDetailPanel";
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
  const introPhase = useFlow((s) => s.introPhase);
  const rootRef = useRef<HTMLDivElement>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [activePill, setActivePill] = useState<(typeof PILLS)[number] | null>(
    null,
  );

  // Apenas um overlay por vez: abrir um fecha o outro.
  const openCompose = () => {
    setActivePill(null);
    setComposeOpen(true);
  };
  const openPill = (pill: (typeof PILLS)[number]) => {
    setComposeOpen(false);
    setActivePill(pill);
  };

  // Antes da fase "modules", os módulos ficam invisíveis (opacity-only — sem
  // transform, para preservar o backdrop-filter). O stagger anima a OPACIDADE
  // de cada VIDRO diretamente (.home-module): animar um wrapper-ancestral com
  // opacity<1 mataria o blur dos cards filhos durante o fade.
  const introHidden = introPhase === "text" || introPhase === "globe";

  useGSAP(
    () => {
      if (introPhase !== "modules") return;
      gsap.fromTo(
        ".home-module",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" },
      );
    },
    { dependencies: [introPhase], scope: rootRef },
  );

  // Novo agendamento: os módulos recuam para o lado (transform/opacity aplicados
  // DIRETO nos vidros .home-module — nunca num wrapper, que mataria o blur) e o
  // painel entra pela direita. Fechar reverte tudo.
  useGSAP(
    () => {
      // NÃO brigar com a intro: este tween escreve opacity/transform INLINE nos
      // .home-module, e inline vence a classe `opacity-0` do introHidden. Se
      // rodasse no mount (composeOpen=false → opacity:1) os módulos apareceriam
      // durante a fase de texto, antes do globo vir à frente. Só atua em repouso.
      if (introPhase !== "ready") return;
      const overlayOpen = composeOpen || activePill !== null;
      gsap.to(".home-module", {
        xPercent: overlayOpen ? -8 : 0,
        scale: overlayOpen ? 0.97 : 1,
        opacity: overlayOpen ? 0.35 : 1,
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(".new-appt-panel", {
        xPercent: composeOpen ? 0 : 100,
        opacity: composeOpen ? 1 : 0,
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(".pill-detail-panel", {
        xPercent: activePill ? 0 : 100,
        opacity: activePill ? 1 : 0,
        duration: 0.5,
        ease: "power2.out",
      });
    },
    { dependencies: [composeOpen, activePill, introPhase], scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative grid h-screen w-full max-w-[1280px] items-stretch gap-4 pt-24 pb-12"
      style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr) minmax(0,1fr)" }}
    >
      {/* ───── Esquerda — Agenda do dia (preenchida + novo agendamento) ───── */}
      <ModuleCard
        eyebrow="Agenda do dia"
        icon="bx-calendar"
        aside={
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => goTo("agenda")}
              aria-label="Abrir agenda completa"
              className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
            >
              <i className="bx bx-link-external text-xl" />
            </button>
            <button
              onClick={openCompose}
              aria-label="Novo agendamento"
              className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
            >
              <i className="bx bx-plus text-xl" />
            </button>
          </div>
        }
        className={cn("home-module orbit-pane min-h-0", introHidden && "opacity-0")}
      >
        <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {AGENDA.map((item, i) => (
            <li key={item.time}>
              <button
                onClick={() => goTo("pre-review")}
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

      {/* ───── Centro — painel da IA (container de vidro único; globo desfocado atrás) ───── */}
      <div
        className={cn(
          "home-module orbit-pane glass-panel-blue backdrop-blur-xl flex min-h-0 flex-col rounded-[28px] p-6",
          introHidden && "opacity-0",
        )}
      >
        {/* Boas-vindas + data */}
        <header className="flex items-center justify-between gap-4">
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
        <ModuleCard
          eyebrow="Pacientes Recentes"
          icon="bx-group"
          className={cn("home-module orbit-pane", introHidden && "opacity-0")}
        >
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

        <ModuleCard
          eyebrow="Pílulas do dia"
          icon="bx-capsule"
          className={cn("home-module orbit-pane min-h-0 flex-1", introHidden && "opacity-0")}
        >
          <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {PILLS.map((pill) => (
              <li key={pill.title}>
                <button
                  onClick={() => openPill(pill)}
                  className="group glass-frost-inner flex w-full items-center gap-3 rounded-[18px] p-4 text-left transition-colors hover:bg-white/65"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <WireBadge tone="mid">{pill.tag}</WireBadge>
                      <span className="font-mono text-micro text-neutral-400">
                        · {pill.meta}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <h4 className="truncate text-body font-medium text-ink">
                        {pill.title}
                      </h4>
                      <p className="truncate text-caption text-neutral-500">
                        {pill.summary}
                      </p>
                    </div>
                  </div>
                  <ActionArrow variant="ghost" />
                </button>
              </li>
            ))}
          </ul>
        </ModuleCard>
      </div>

      {/* Novo agendamento — painel que desliza sobre a Home (overlay local) */}
      <NewAppointmentPanel
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
      />

      {/* Pílula do dia — painel de detalhe (mesmo overlay deslizante) */}
      <PillDetailPanel pill={activePill} onClose={() => setActivePill(null)} />
    </div>
  );
}

// Botão de ação (ícone). Variantes:
// - "primary": preenchida com tinta (o próximo do dia, em destaque).
// - "ghost": sem borda/fundo, sutil; "acende" no hover do item.
// - "default" (legado): círculo com borda que preenche no hover (Pílulas).
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
        variant === "primary" &&
          "border-ink bg-ink text-paper",
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
