"use client";

import { useRef } from "react";
import { useFlow } from "@/flow/store";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { HOME_GAP, HOME_SIDEBAR_W } from "@/lib/homeLayout";

// Conteúdo do print home.png (fase "só visual": listas e chips inertes).
const PILLS = [
  {
    title: "Titulação de CBD em dor neuropática",
    summary: "Estudo sobre a titulação de canabidiol em dor neuropática",
    meta: "4 min",
  },
  {
    title: "Nova RDC para controle especial",
    summary: "Nova regulamentação para o controle especial de produtos",
    meta: "2 min",
  },
  {
    title: "Aprovação de novos medicamentos",
    summary: "Recentemente, a ANVISA aprovou novos medicamentos",
    meta: "3 min",
  },
  {
    title: "Campanha de vacinação ampliada",
    summary: "O Ministério da Saúde lançou uma campanha ampliada",
    meta: "4 min",
  },
  {
    title: "Manejo de insônia refratária",
    summary: "Abordagem abrangente para o manejo de insônia",
    meta: "5 min",
  },
];

const AGENDA = [
  { time: "09:30", name: "Marina Castro", kind: "Pré-consulta", next: true },
  { time: "10:15", name: "André Lobo", kind: "Retorno", next: false },
  { time: "11:00", name: "Júlia Tavares", kind: "1ª consulta", next: false },
  { time: "13:30", name: "Rui Salgado", kind: "Controle especial", next: false },
  { time: "14:15", name: "Helena Pires", kind: "Retorno", next: false },
  { time: "15:00", name: "Bruno Antunes", kind: "Avaliação", next: false },
  { time: "16:00", name: "João Alves", kind: "1ª consulta", next: false },
];

// Sugestões de pergunta à IA (texto do print, verbatim).
const SUGGESTIONS = [
  "Perguntar sobre evidencias primárias",
  "Pergunte sobre tratamento de doenças",
  "Perguntar sobre efeitos colaterais de drogas",
];

// Home — layout home.png: coluna principal transparente (saudação + data, a
// bola 3D billboarda no espaço central, input de chat + chips embaixo) e
// sidebar direita (Pílulas de conhecimento + Agenda de hoje). A largura da
// sidebar/gap vem de lib/homeLayout — o AiGlobe deriva a âncora X da bola das
// MESMAS réguas para alinhar com o eixo da coluna.
export function HomeScreen() {
  const introPhase = useFlow((s) => s.introPhase);
  const rootRef = useRef<HTMLDivElement>(null);

  // Antes da fase "modules", os módulos ficam invisíveis (opacity-only — sem
  // transform, para preservar o backdrop-filter). O stagger anima a OPACIDADE
  // de cada bloco diretamente (.home-module): animar um wrapper-ancestral com
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

  return (
    <div
      ref={rootRef}
      className="grid h-screen w-full pt-28 pb-10"
      style={{
        gridTemplateColumns: `minmax(0,1fr) ${HOME_SIDEBAR_W}px`,
        columnGap: HOME_GAP,
      }}
    >
      {/* ───── Coluna principal (transparente — a bola fica visível atrás) ───── */}
      <div className="orbit-pane flex min-h-0 flex-col px-6">
        <header className="flex items-start justify-between gap-6">
          <div className={cn("home-module flex flex-col gap-1.5", introHidden && "opacity-0")}>
            <h1 className="font-display text-[1.9rem] font-medium leading-tight text-ink">
              Boa tarde, Dr. Ricardo
            </h1>
            <p className="text-body text-neutral-500">Você tem 7 compromissos hoje</p>
          </div>
          <div
            className={cn(
              "home-module flex flex-col items-end gap-1 pt-1.5 text-right",
              introHidden && "opacity-0",
            )}
          >
            <span className="font-mono text-caption tracking-[0.08em] text-neutral-700">
              Quinta, 19 de junho
            </span>
            <span className="font-mono text-caption tracking-[0.08em] text-neutral-500">
              14:02 BRT
            </span>
          </div>
        </header>

        {/* Espaço da bola (billboard 3D atrás, alinhado ao eixo da coluna) */}
        <div className="flex-1" />

        {/* Input de chat + sugestões + explorar */}
        <div
          className={cn(
            "home-module mx-auto flex w-full max-w-[820px] flex-col gap-5",
            introHidden && "opacity-0",
          )}
        >
          {/* Caixa de texto ALTA (print): input no topo, ações na base. */}
          <section className="card-soft flex min-h-[150px] flex-col justify-between rounded-[18px] p-4">
            <input
              type="text"
              placeholder="Digite sua pergunta ou comando..."
              className="w-full bg-transparent px-2 pt-1.5 text-body text-ink placeholder:text-neutral-400 focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <button
                aria-label="Anexar"
                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-paper text-neutral-500 transition-colors hover:text-ink"
              >
                <i className="bx bx-plus text-lg" />
              </button>
              {/* Botão principal: navy com stroke gradiente de 4px por FORA,
                  na base (o gradiente aparece como um arco sob o botão). */}
              <span className="relative isolate inline-grid">
                <span
                  aria-hidden
                  className="brand-underline absolute inset-0 -z-10 translate-y-1 rounded-full"
                />
                <button
                  aria-label="Comando de voz"
                  className="grid h-11 w-11 place-items-center rounded-full bg-navy text-paper"
                >
                  <i className="bx bx-microphone text-xl" />
                </button>
              </span>
            </div>
          </section>

          <div className="-mx-6 flex flex-wrap justify-center gap-3">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                className="card-soft relative overflow-hidden rounded-full px-3.5 py-2 text-[0.8125rem] text-ink transition-colors hover:text-neutral-600"
              >
                {text}
                {/* Stroke gradiente COMPLETO na base: de borda a borda — o
                    overflow-hidden recorta a barra na curva do próprio pill. */}
                <span
                  aria-hidden
                  className="brand-underline absolute inset-x-0 bottom-0 h-[3px]"
                />
              </button>
            ))}
          </div>

          <button className="mx-auto flex items-center gap-1.5 text-caption text-neutral-600 transition-colors hover:text-ink">
            Explorar mais capacidades
            <i className="bx bx-chevron-down text-base" />
          </button>
        </div>
      </div>

      {/* ───── Sidebar — Pílulas de conhecimento + Agenda de hoje ───── */}
      <aside className="flex min-h-0 flex-col gap-6">
        <section
          className={cn(
            "home-module orbit-pane card-soft flex min-h-0 flex-1 flex-col gap-2 rounded-[18px] p-5",
            introHidden && "opacity-0",
          )}
        >
          <SideCardTitle icon="bx-link">Pílulas de conhecimento</SideCardTitle>
          <ul className="no-scrollbar flex min-h-0 flex-1 flex-col divide-y divide-neutral-200/70 overflow-y-auto">
            {PILLS.map((pill) => (
              <li key={pill.title} className="flex items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h4 className="truncate text-caption font-semibold text-ink">
                    {pill.title}
                  </h4>
                  <p className="truncate text-[0.8125rem] text-neutral-500">{pill.summary}</p>
                </div>
                <span className="shrink-0 font-mono text-micro uppercase text-neutral-400">
                  {pill.meta}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={cn(
            "home-module orbit-pane card-soft flex min-h-0 flex-1 flex-col gap-2 rounded-[18px] p-5",
            introHidden && "opacity-0",
          )}
        >
          <SideCardTitle icon="bx-calendar">Agenda de hoje</SideCardTitle>
          <ul className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
            {AGENDA.map((item) => (
              <li key={item.time} className="flex items-center gap-3 py-2.5">
                <span
                  className={cn(
                    "w-12 shrink-0 font-time text-caption font-medium tabular-nums",
                    item.next ? "text-highlight" : "text-ink",
                  )}
                >
                  {item.time}
                </span>
                <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">
                  {item.name}
                </span>
                <span className="shrink-0 text-caption text-neutral-400">{item.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}

// Título serifado dos cards da sidebar (ícone sutil + display face, como no print).
function SideCardTitle({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-2.5">
      <i className={cn("bx text-lg text-neutral-400", icon)} />
      <h3 className="font-display text-[1.15rem] font-medium text-ink">{children}</h3>
    </header>
  );
}
