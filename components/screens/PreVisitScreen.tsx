"use client";

import { useState } from "react";
import { Avatar, Chip, type ChipTone, AppScreen, KpiCard, Segmented, ScreenHeader, Icon } from "@/components/ui";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { cn } from "@/lib/cn";

// `pre-visit` — Pré-Consulta. Caixa de entrada operacional do que chega ANTES da
// consulta (WhatsApp): mensagens, dúvidas, agendamentos e questionários. Quadro
// KANBAN de 4 colunas + KPIs; clicar num card abre o drawer (thread + sugestão
// Athena + resposta). Monocromático; só urgência usa o acento crítico.
// Conteúdo conforme contrato PREVISIT §6.

/* ============================ DADOS (mock) ============================ */

type ColKey = "messages" | "doubts" | "scheduling" | "questionnaires";

const COLUMNS: { key: ColKey; title: string; icon: string }[] = [
  { key: "messages", title: "Mensagens novas", icon: "chat" },
  { key: "doubts", title: "Dúvidas de atendimento", icon: "help" },
  { key: "scheduling", title: "Agendamentos", icon: "calendar_month" },
  { key: "questionnaires", title: "Questionários pré-consulta", icon: "assignment" },
];

type Card = {
  id: string;
  name: string;
  badge: { label: string; tone: ChipTone };
  preview: string;
  timeAgo: string;
  appointment?: string;
  quest?: string;
};

const CARDS: Record<ColKey, Card[]> = {
  messages: [
    { id: "m1", name: "Marina Castro", badge: { label: "urgência", tone: "critical" }, preview: "Estou com muita sonolência depois de aumentar o CBD, posso reduzir a dose?", timeAgo: "há 12 min", appointment: "Consulta 25/06 · 09:30" },
    { id: "m2", name: "André Lobo", badge: { label: "sem resposta >24h", tone: "inset" }, preview: "Doutora, a receita do tramadol venceu. Como faço para renovar?", timeAgo: "há 1 dia" },
    { id: "m3", name: "Júlia Tavares", badge: { label: "nova mensagem", tone: "muted" }, preview: "Bom dia! Consegui marcar o exame de sangue para amanhã.", timeAgo: "há 38 min" },
  ],
  doubts: [
    { id: "d1", name: "Rui Salgado", badge: { label: "valores", tone: "inset" }, preview: "Qual o valor da consulta de retorno por telemedicina?", timeAgo: "há 2 h" },
    { id: "d2", name: "Helena Pires", badge: { label: "escopo", tone: "muted" }, preview: "O acompanhamento inclui ajuste das outras medicações?", timeAgo: "há 3 h" },
  ],
  scheduling: [
    { id: "s1", name: "Bruno Antunes", badge: { label: "encaixe", tone: "muted" }, preview: "Tem algum horário de encaixe essa semana? A dor piorou.", timeAgo: "há 45 min" },
    { id: "s2", name: "Carla Nunes", badge: { label: "alteração", tone: "inset" }, preview: "Preciso remarcar a consulta de quinta para a próxima semana.", timeAgo: "há 1 h", appointment: "Consulta 27/06 · 14:00" },
    { id: "s3", name: "Diego Farias", badge: { label: "novo agendamento", tone: "muted" }, preview: "Gostaria de marcar primeira consulta para dor crônica.", timeAgo: "há 4 h" },
  ],
  questionnaires: [
    { id: "q1", name: "Marina Castro", badge: { label: "parcial", tone: "inset" }, preview: "Pré-anamnese M3 em andamento.", timeAgo: "há 20 min", quest: "6/9 itens · 67%" },
    { id: "q2", name: "Helena Pires", badge: { label: "completo", tone: "muted" }, preview: "Questionário pré-consulta concluído.", timeAgo: "há 2 h", quest: "9/9 itens · 100%" },
    { id: "q3", name: "Júlia Tavares", badge: { label: "enviado", tone: "muted" }, preview: "Aguardando início do questionário.", timeAgo: "há 1 dia", quest: "0/9 itens · 0%" },
  ],
};

const KPIS: { icon: string; label: string; value: string; hint: string; accent?: boolean }[] = [
  { icon: "chat", label: "Mensagens novas", value: "3", hint: "1 com urgência · 1 sem resposta >24h", accent: true },
  { icon: "help", label: "Dúvidas", value: "2", hint: "1 valores · 1 escopo" },
  { icon: "calendar_month", label: "Agendamentos", value: "3", hint: "1 encaixe · 1 alteração · 1 novo" },
  { icon: "assignment", label: "Questionários", value: "3", hint: "1 completo · 1 parcial · 1 sem início" },
];

// Thread (mock) por card. role: paciente (esq.) / clínica (dir.).
const THREADS: Record<string, { role: "patient" | "clinic"; text: string; at: string }[]> = {
  m1: [
    { role: "patient", text: "Bom dia, Dra. Aumentei o CBD para 0,5 mL 2× ao dia como combinado.", at: "08:42" },
    { role: "patient", text: "Mas estou com muita sonolência durante o dia. Posso reduzir a dose?", at: "08:43" },
  ],
};

const SUGGESTION =
  "Olá, Marina! Obrigada por avisar. A sonolência pode ser transitória nas primeiras semanas. " +
  "Por segurança, mantenha a dose da manhã e reduza a da noite para 0,3 mL até a consulta de 25/06, " +
  "quando reavaliamos juntos. Evite dirigir se sentir sono. Qualquer piora, me avise por aqui.";

/* ============================ ÁTOMOS ============================ */

function IconButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border-[0.8px] border-neutral-200 bg-paper text-neutral-600 transition-colors hover:text-ink"
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-neutral-200 px-4 py-8 text-center">
      <Icon name={icon} size={24} className="text-neutral-300" />
      <span className="text-caption text-neutral-400">{text}</span>
    </div>
  );
}

function KanbanCardItem({ card, onOpen }: { card: Card; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card-solid flex w-full flex-col gap-2 rounded-[16px] p-3 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <Avatar name={card.name} seed={card.name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{card.name}</span>
        <Chip tone={card.badge.tone}>{card.badge.label}</Chip>
      </div>
      <p className="line-clamp-2 text-caption text-neutral-600 text-pretty">{card.preview}</p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-micro text-neutral-400">{card.timeAgo}</span>
        {card.appointment ? (
          <>
            <span className="text-neutral-300">·</span>
            <span className="truncate font-mono text-micro text-neutral-500">{card.appointment}</span>
          </>
        ) : null}
        {card.quest ? (
          <>
            <span className="flex-1 text-right font-mono text-micro text-neutral-500">{card.quest}</span>
          </>
        ) : null}
      </div>
    </button>
  );
}

function KanbanColumn({
  col,
  cards,
  onOpen,
}: {
  col: { key: ColKey; title: string; icon: string };
  cards: Card[];
  onOpen: (c: Card) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-400" />
        <Icon name={col.icon} size={18} className="text-neutral-500" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{col.title}</span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-micro text-neutral-600">
          {cards.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {cards.length ? (
          cards.map((c) => <KanbanCardItem key={c.id} card={c} onOpen={() => onOpen(c)} />)
        ) : (
          <EmptyState icon="bx-message-square-dots" text="Nenhum card" />
        )}
      </div>
    </div>
  );
}

function ListView({ onOpen }: { onOpen: (c: Card) => void }) {
  const labels: Record<ColKey, string> = {
    messages: "Mensagem",
    doubts: "Dúvida",
    scheduling: "Agendamento",
    questionnaires: "Questionário",
  };
  const rows = COLUMNS.flatMap((col) => CARDS[col.key].map((c) => ({ col: col.key, c })));
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ col, c }) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onOpen(c)}
          className="card-solid flex items-center gap-3 rounded-[16px] p-3 text-left transition-shadow hover:shadow-md"
        >
          <Avatar name={c.name} seed={c.name} size="sm" />
          <span className="w-40 shrink-0 truncate text-caption font-medium text-ink">{c.name}</span>
          <Chip tone="muted">{labels[col]}</Chip>
          <Chip tone={c.badge.tone}>{c.badge.label}</Chip>
          <span className="min-w-0 flex-1 truncate text-caption text-neutral-600">{c.preview}</span>
          <span className="shrink-0 font-mono text-micro text-neutral-400">{c.timeAgo}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================ DRAWER ============================ */

function PreVisitDrawer({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const thread = card ? THREADS[card.id] ?? [] : [];

  return (
    <SlideOverPanel open={Boolean(card)} onClose={onClose} label="Conversa" className="max-w-[440px]">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Cabeçalho. */}
        <div className="flex items-center gap-3">
          <Avatar name={card?.name ?? ""} seed={card?.name} size="md" className="h-11 w-11" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body font-medium text-ink">{card?.name}</span>
            {card?.appointment ? (
              <span className="font-mono text-micro text-neutral-500">{card.appointment}</span>
            ) : null}
          </div>
          <span className="flex-1" />
          {card ? <Chip tone={card.badge.tone}>{card.badge.label}</Chip> : null}
        </div>

        {/* Thread. */}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {thread.length ? (
            thread.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-0.5",
                  m.role === "clinic" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-[16px] px-3 py-2 text-caption text-pretty",
                    m.role === "clinic"
                      ? "bg-ink text-paper"
                      : "bg-neutral-100 text-neutral-700",
                  )}
                >
                  {m.text}
                </div>
                <span className="font-mono text-micro text-neutral-400">{m.at}</span>
              </div>
            ))
          ) : (
            <div className="rounded-[16px] bg-neutral-100 px-3 py-2 text-caption text-neutral-600">
              {card?.preview}
            </div>
          )}
        </div>

        {/* Sugestão da Athena. */}
        <div className="flex flex-col gap-2 rounded-[16px] border border-neutral-200 bg-[#f9f9f9] p-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
            <Icon name="bot" size={16} /> Sugestão da Athena
          </span>
          <p className="text-caption leading-relaxed text-neutral-700 text-pretty">{SUGGESTION}</p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setReply(SUGGESTION)}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-micro font-medium text-paper"
            >
              <Icon name="check" size={16} /> Usar
            </button>
            <button
              type="button"
              onClick={() => setReply(SUGGESTION)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-micro text-ink"
            >
              <Icon name="edit" size={16} /> Editar
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-micro text-ink"
            >
              <Icon name="refresh" size={16} /> Outra
            </button>
          </div>
        </div>

        {/* Resposta. */}
        <div className="flex flex-col gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Digite uma resposta…"
            rows={3}
            className="w-full resize-none rounded-[16px] border border-neutral-200 bg-paper px-3 py-2 text-caption text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
          <div className="flex items-center gap-3">
            <span className="flex-1 font-mono text-micro text-neutral-400">Ver prontuário</span>
            <button
              type="button"
              disabled={!reply.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-caption font-medium text-paper disabled:opacity-40"
            >
              <Icon name="send" size={16} /> Enviar
            </button>
          </div>
        </div>
      </div>
    </SlideOverPanel>
  );
}

/* ============================ TELA ============================ */

export function PreVisitCenter() {
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [selected, setSelected] = useState<Card | null>(null);

  return (
    <AppScreen>
      <ScreenHeader
        title="Pré-Consulta"
        subtitle="Mensagens, dúvidas, agendamentos e questionários pré-consulta. Clique nos cards para ver detalhes."
        actions={
          <>
            <div className="flex h-10 items-center gap-2 rounded-full border-[0.8px] border-neutral-200 bg-paper px-3">
              <Icon name="search" size={18} className="text-neutral-400" />
              <input
                placeholder="Buscar paciente…"
                className="w-40 bg-transparent text-caption text-ink placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full border-[0.8px] border-neutral-200 bg-paper px-3 text-caption text-ink"
            >
              <Icon name="slider-alt" size={18} className="text-neutral-500" /> Filtros
            </button>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { key: "kanban", label: <Icon name="grid-alt" size={16} /> },
                { key: "lista", label: <Icon name="list-ul" size={16} /> },
              ]}
            />
            <IconButton icon="bx-refresh" label="Atualizar" />
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        {KPIS.map((k) => (
          <KpiCard
            key={k.label}
            icon={k.icon}
            label={k.label}
            value={k.value}
            hint={k.hint}
            accent={k.accent}
          />
        ))}
      </div>

      {view === "kanban" ? (
        <div className="flex items-start gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.key} col={col} cards={CARDS[col.key]} onOpen={setSelected} />
          ))}
        </div>
      ) : (
        <ListView onOpen={setSelected} />
      )}

      <PreVisitDrawer card={selected} onClose={() => setSelected(null)} />
    </AppScreen>
  );
}
