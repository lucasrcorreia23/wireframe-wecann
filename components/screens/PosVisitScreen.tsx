"use client";

import { useState } from "react";
import { Avatar, Chip, type ChipTone, AppScreen, KpiCard, ScreenHeader, Icon } from "@/components/ui";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `pos-visit` — Pós-Consulta. Caixa de trabalho do que acontece DEPOIS da consulta:
// dúvidas, efeitos adversos, renovação de receitas, documentos e questionários de
// follow-up. Quadro KANBAN de 5 colunas + KPIs. Card de MENSAGEM abre o chat
// (estilo WhatsApp, monocromático, com estado "fora da janela 24h"); os demais
// levam ao prontuário. EA ativo / receita expirada usam o acento crítico.
// Conteúdo conforme contrato POS_CONSULTA §6.

/* ============================ DADOS (mock) ============================ */

type ColKey = "msg" | "ea" | "rec" | "doc" | "quest";

const COLUMNS: { key: ColKey; title: string; icon: string }[] = [
  { key: "msg", title: "Mensagens novas", icon: "chat" },
  { key: "ea", title: "Efeitos adversos", icon: "warning" },
  { key: "rec", title: "Renovação de receitas", icon: "prescriptions" },
  { key: "doc", title: "Documentos pendentes", icon: "description" },
  { key: "quest", title: "Questionários pós", icon: "assignment" },
];

type Card = {
  id: string;
  name: string;
  badge: { label: string; tone: ChipTone };
  preview: string;
  meta?: string;
  withinWindow?: boolean;
};

const CARDS: Record<ColKey, Card[]> = {
  msg: [
    { id: "m1", name: "Marina Castro", badge: { label: "> há 2h", tone: "muted" }, preview: "A sonolência melhorou com a redução da dose. Obrigada!", meta: "M3 · WhatsApp", withinWindow: true },
    { id: "m2", name: "André Lobo", badge: { label: "sem resposta >24h", tone: "critical" }, preview: "Ainda estou aguardando o retorno sobre a receita.", meta: "M6 · WhatsApp", withinWindow: false },
  ],
  ea: [
    { id: "e1", name: "Marina Castro", badge: { label: "relato ativo", tone: "critical" }, preview: "Sonolência diurna persistente após aumento do CBD.", meta: "Grau 1 · CTCAE" },
    { id: "e2", name: "Rui Salgado", badge: { label: "em avaliação", tone: "inset" }, preview: "Tontura leve relatada nas primeiras tomadas.", meta: "Grau 1 · CTCAE" },
  ],
  rec: [
    { id: "r1", name: "André Lobo", badge: { label: "expirada", tone: "critical" }, preview: "Tramadol 50mg · controle especial.", meta: "Venceu 12/06" },
    { id: "r2", name: "Helena Pires", badge: { label: "vence em 3d", tone: "inset" }, preview: "CBD 200mg/mL · uso contínuo.", meta: "Vence 28/06" },
    { id: "r3", name: "Carla Nunes", badge: { label: "vence em 7d", tone: "muted" }, preview: "Pregabalina 75mg.", meta: "Vence 02/07" },
  ],
  doc: [
    { id: "d1", name: "Marina Castro", badge: { label: "laudo anvisa", tone: "critical" }, preview: "Laudo para importação de CBD.", meta: "Prazo: 26/06" },
    { id: "d2", name: "Bruno Antunes", badge: { label: "atestado", tone: "muted" }, preview: "Atestado de 3 dias.", meta: "Prazo: 27/06" },
    { id: "d3", name: "Júlia Tavares", badge: { label: "relatório", tone: "muted" }, preview: "Relatório de evolução para perícia.", meta: "Prazo: 30/06" },
  ],
  quest: [
    { id: "q1", name: "Helena Pires", badge: { label: "completo", tone: "muted" }, preview: "Follow-up M3 concluído.", meta: "M3 · 9/9" },
    { id: "q2", name: "Marina Castro", badge: { label: "parcial", tone: "inset" }, preview: "Follow-up M3 em andamento.", meta: "M3 · 5/9" },
    { id: "q3", name: "Diego Farias", badge: { label: "atrasado", tone: "critical" }, preview: "Follow-up M1 não respondido.", meta: "M1 · 0/9" },
  ],
};

const KPIS: { icon: string; label: string; value: string; hint: string; accent?: boolean }[] = [
  { icon: "chat", label: "Mensagens novas", value: "2", hint: "1 sem resposta >24h" },
  { icon: "warning", label: "Efeitos adversos", value: "2", hint: "1 relato ativo · 1 em avaliação", accent: true },
  { icon: "prescriptions", label: "Renovação de receitas", value: "3", hint: "1 expirada · 1 vence em 3d", accent: true },
  { icon: "description", label: "Documentos pendentes", value: "3", hint: "1 laudo ANVISA · 1 atestado · 1 relatório" },
  { icon: "assignment", label: "Questionários pós", value: "3", hint: "1 completo · 1 parcial · 1 atrasado" },
];

const THREAD: { role: "patient" | "clinic"; text: string; at: string }[] = [
  { role: "clinic", text: "Oi, Marina! Como está a sonolência depois que ajustamos a dose da noite?", at: "09:10" },
  { role: "patient", text: "Bem melhor, doutora! Consegui dormir e acordar mais disposta.", at: "09:24" },
  { role: "patient", text: "A sonolência melhorou com a redução da dose. Obrigada!", at: "09:25" },
];

/* ============================ ÁTOMOS ============================ */

function IconButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border-[0.8px] border-neutral-200 bg-paper text-neutral-600 transition-colors hover:text-ink"
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-neutral-200 px-3 py-8 text-center">
      <Icon name="inbox" size={24} className="text-neutral-300" />
      <span className="text-caption text-neutral-400">{text}</span>
    </div>
  );
}

function KanbanCardItem({ card, onClick }: { card: Card; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-solid flex w-full flex-col gap-2 rounded-[16px] p-3 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <Avatar name={card.name} seed={card.name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{card.name}</span>
        <Chip tone={card.badge.tone}>{card.badge.label}</Chip>
      </div>
      <p className="line-clamp-2 text-caption text-neutral-600 text-pretty">{card.preview}</p>
      {card.meta ? <span className="font-mono text-micro text-neutral-400">{card.meta}</span> : null}
    </button>
  );
}

/* ============================ CHAT (WhatsApp, monocromático) ============================ */

function ChatDrawer({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const within = card?.withinWindow ?? true;

  return (
    <SlideOverPanel open={Boolean(card)} onClose={onClose} label="Conversa" className="max-w-[440px]">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Cabeçalho. */}
        <div className="flex items-center gap-3">
          <Avatar name={card?.name ?? ""} seed={card?.name} size="md" className="h-11 w-11" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body font-medium text-ink">{card?.name}</span>
            <span className="font-mono text-micro text-neutral-500">{card?.meta}</span>
          </div>
          <Chip tone="muted">WhatsApp</Chip>
        </div>

        {/* Mensagens. */}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-[16px] bg-neutral-100/60 p-3">
          {THREAD.map((m, i) => (
            <div
              key={i}
              className={cn("flex flex-col gap-0.5", m.role === "clinic" ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-[14px] px-3 py-2 text-caption text-pretty",
                  m.role === "clinic" ? "bg-ink text-paper" : "bg-paper text-neutral-700 shadow-sm",
                )}
              >
                {m.text}
              </div>
              <span className="font-mono text-micro text-neutral-400">{m.at}</span>
            </div>
          ))}
        </div>

        {/* Envio ou aviso de janela. */}
        {within ? (
          <div className="flex items-center gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreva uma resposta…"
              className="h-11 flex-1 rounded-full border border-neutral-200 bg-paper px-4 text-caption text-ink placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={!reply.trim()}
              aria-label="Enviar"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-paper disabled:opacity-40"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-[16px] border border-neutral-300 bg-neutral-100 p-3">
            <Icon name="time-five" size={18} className="mt-0.5 text-neutral-500" />
            <p className="text-caption text-neutral-600 text-pretty">
              Fora da janela de 24h do WhatsApp. Só é possível reabrir a conversa com um template
              aprovado (disparo automático do follow-up).
            </p>
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
}

/* ============================ TELA ============================ */

export function PosVisitCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [chat, setChat] = useState<Card | null>(null);

  // msg → abre o chat; demais → prontuário (Paciente 360).
  const openCard = (col: ColKey, card: Card) => {
    if (col === "msg") setChat(card);
    else goTo("pre-review");
  };

  return (
    <AppScreen>
      <ScreenHeader
        title="Pós-Consulta"
        subtitle="Dúvidas clínicas, efeitos adversos, renovação de receitas, documentos e questionários pós-consulta. Clique nos cards para ver detalhes."
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
            <IconButton icon="bx-refresh" label="Atualizar" />
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        {KPIS.map((k) => (
          <KpiCard key={k.label} icon={k.icon} label={k.label} value={k.value} hint={k.hint} accent={k.accent} />
        ))}
      </div>

      <div className="flex items-start gap-3">
        {COLUMNS.map((col) => {
          const cards = CARDS[col.key];
          return (
            <div key={col.key} className="flex min-w-0 flex-1 flex-col gap-3">
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
                  cards.map((c) => (
                    <KanbanCardItem key={c.id} card={c} onClick={() => openCard(col.key, c)} />
                  ))
                ) : (
                  <EmptyState text="Nenhum item" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ChatDrawer card={chat} onClose={() => setChat(null)} />
    </AppScreen>
  );
}
