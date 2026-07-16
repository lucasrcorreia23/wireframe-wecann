"use client";

import { cn } from "@/lib/cn";
import { CHAT_SESSIONS } from "./chatData";

// Conteúdo VERBATIM do Figma "Iteração 9 de Julho" (node 6318-6313).
const PILLS = [
  {
    title: "Titulação de CBD em dor neuropática",
    summary:
      "Estudo sobre a titulação de canabidiol (CBD) no tratamento de dor neuropática, abordando a eficácia e as dosagens recomendadas. A pesquisa analisa como o CBD pode ser utilizado para aliviar a dor crônica, proporcionando uma alternativa viável para pacientes que não respondem a tratamentos convencionais.",
    meta: "4 min",
  },
  {
    title: "Nova RDC para controle especial",
    summary:
      "Nova regulamentação para o controle especial de substâncias, visando garantir a segurança e a eficácia no uso de medicamentos. Esta nova RDC estabelece diretrizes claras para a prescrição e o monitoramento de tratamentos, assegurando que os profissionais de saúde sigam protocolos rigorosos para a administração de substâncias controladas.",
    meta: "2 min",
  },
  {
    title: "Aprovação de novos medicamentos",
    summary:
      "Recentemente, a ANVISA aprovou uma nova classe de medicamentos destinados ao tratamento de doenças raras. Esta decisão representa um avanço significativo na terapia, proporcionando acesso a tratamentos inovadores que antes não estavam disponíveis para pacientes com condições específicas.",
    meta: "3 min",
  },
  {
    title: "Campanha de vacinação ampliada",
    summary:
      "O Ministério da Saúde lançou uma nova campanha de vacinação que inclui a imunização contra diversas doenças, com foco na promoção da saúde pública. A campanha visa aumentar as taxas de vacinação e conscientizar a população sobre a importância da prevenção. Serão disponibilizados locais de vacinação em diferentes regiões, facilitando o acesso a todos.",
    meta: "4 min",
  },
];

const AGENDA = [
  { time: "09:30", name: "Marina Castro", kind: "Pré-consulta", next: true },
  { time: "10:15", name: "André Lobo", kind: "Retorno", next: false },
  { time: "11:00", name: "Júlia Tavares", kind: "1ª consulta", next: false },
  { time: "13:30", name: "Rui Salgado", kind: "Controle especial", next: false },
];

const CARD =
  "orbit-pane relative flex shrink-0 flex-col gap-4 overflow-hidden rounded-[12px] border border-border-default bg-white p-4";

// Sidebar da Home. Em `collapsed` (modo chat, mock 0-174): Pílulas/Agenda
// recolhem para só o header (chevron aponta para baixo) e Sessões Recentes
// vira um CARD expandido com as 9 sessões + botão de NOVA SESSÃO (plus). Os
// [data-flip] participam do Flip disparado pela HomeScreen na transição.
export function HomeSidebar({
  collapsed,
  introHidden,
  onNewSession,
  onAskSession,
}: {
  collapsed: boolean;
  introHidden: boolean;
  onNewSession: () => void;
  /** Clicar numa sessão recente dispara a pergunta (inicia/substitui o chat). */
  onAskSession: (question: string) => void;
}) {
  return (
    <aside
      data-chat-aside
      className="no-scrollbar pt-10 flex min-h-0 flex-col gap-2 overflow-y-auto pb-10"
      style={{
        maskImage:
          "linear-gradient(to bottom, black calc(100% - 56px), transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black calc(100% - 56px), transparent 100%)",
      }}
    >
      <section
        data-flip
        className={cn("home-module", CARD, introHidden && "opacity-0")}
      >
        <span
          aria-hidden
          className="card-grad"
          style={{ "--grad-x": "96px" } as React.CSSProperties}
        />
        <SideCardTitle chevron collapsed={collapsed}>
          Pílulas de conhecimento
        </SideCardTitle>
        {!collapsed && (
          <ul className="relative flex flex-col gap-0.5">
            {PILLS.map((pill) => (
              <li key={pill.title} className="flex items-center gap-3 py-1">
                <div className="flex min-w-0 flex-1 flex-col">
                  <h4 className="truncate text-[14px] font-medium leading-[1.4] text-navy">
                    {pill.title}
                  </h4>
                  <p className="truncate text-[14px] leading-[18px] text-neutral-500">
                    {pill.summary}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] leading-[15px] uppercase text-neutral-500">
                  {pill.meta}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        data-flip
        className={cn("home-module", CARD, introHidden && "opacity-0")}
      >
        <span
          aria-hidden
          className="card-grad"
          style={{ "--grad-x": "52px" } as React.CSSProperties}
        />
        <SideCardTitle chevron collapsed={collapsed}>
          Agenda de hoje
        </SideCardTitle>
        {!collapsed && (
          <ul className="relative flex flex-col gap-0.5">
            {AGENDA.map((item) => (
              <li key={item.time} className="flex items-center gap-3 py-1.5 pr-1.5">
                <span
                  className={cn(
                    "w-[42px] shrink-0 text-[14px] font-semibold leading-[1.4]",
                    item.next ? "text-highlight" : "text-navy",
                  )}
                >
                  {item.time}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] leading-[1.4] text-navy">
                  {item.name}
                </span>
                <span className="shrink-0 text-[14px] leading-[1.4] text-neutral-500">
                  {item.kind}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {collapsed ? (
        // Modo chat: Sessões Recentes vira o card principal (mock 0-174).
        <section data-flip className={cn(CARD, "min-h-0 flex-1 shrink")}>
          <span
            aria-hidden
            className="card-grad"
            style={{ "--grad-x": "82px" } as React.CSSProperties}
          />
          <SideCardTitle onPlus={onNewSession}>Sessões Recentes</SideCardTitle>
          <ul className="no-scrollbar relative flex min-h-0 flex-col gap-3 overflow-y-auto">
            {CHAT_SESSIONS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => onAskSession(question)}
                  className="w-full truncate pr-1.5 text-left text-[12px] leading-[1.4] text-secondary transition-colors hover:text-ink"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        // Idle: seção solta (sem card) + plus para nova sessão.
        <section
          data-flip
          className={cn(
            "home-module orbit-pane flex shrink-0 flex-col gap-3 px-4 pt-2",
            introHidden && "opacity-0",
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] leading-[1.4] text-neutral-500">
              Sessões Recentes
            </h3>
            <button
              type="button"
              aria-label="Nova sessão"
              onClick={onNewSession}
              className="transition-opacity hover:opacity-60"
            >
              <img src="/figma/icon-add.svg" alt="" className="size-5" />
            </button>
          </div>
          <ul className="relative flex flex-col gap-2">
            {CHAT_SESSIONS.slice(0, 4).map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => onAskSession(question)}
                  className="w-full truncate pr-1.5 text-left text-[14px] leading-[1.4] text-secondary transition-colors hover:text-ink"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

// Título serifado dos cards (Crimson Pro 20 SemiBold) com chevron de recolher
// opcional (gira para baixo quando o card está recolhido), botão de plus
// opcional (nova sessão) e fio divisor até as bordas quando expandido.
function SideCardTitle({
  chevron,
  collapsed,
  onPlus,
  children,
}: {
  chevron?: boolean;
  collapsed?: boolean;
  onPlus?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="relative flex shrink-0 items-center justify-between">
        <h3 className="font-display text-[18px] font-semibold leading-[1.2] text-ink">
          {children}
        </h3>
        {chevron && (
          <img
            src="/figma/icon-chevron.svg"
            alt=""
            className={cn(
              "size-6 transition-transform duration-300",
              collapsed ? "rotate-90" : "-rotate-90",
            )}
          />
        )}
        {onPlus && (
          <button
            type="button"
            aria-label="Nova sessão"
            onClick={onPlus}
            className="transition-opacity hover:opacity-60"
          >
            <img src="/figma/icon-add.svg" alt="" className="size-6" />
          </button>
        )}
      </header>
      {!collapsed && (
        <div
          aria-hidden
          className="relative -mx-4 -mt-1 h-px shrink-0 bg-border-default"
        />
      )}
    </>
  );
}
