"use client";

import { useState } from "react";
import { Avatar, Chip, type ChipTone, AppScreen, Segmented, ScreenHeader, Icon } from "@/components/ui";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `acompanhamento` — unifica Pré-Consulta e Pós-Consulta numa só tela. O médico
// alterna entre os cenários por um FILTRO (segmented) logo abaixo do header; as 5
// colunas são fixas nos dois cenários e o filtro só troca os cards exibidos.
// Cada coluna traz o DIAGNÓSTICO realocado logo abaixo do título (antes uma faixa
// de KPIs que poluía o topo). Cada card leva duas tags: ASSUNTO do contato (padrão
// atual) e REGRESSÃO do último contato (alerta em 24h / >48h). Clicar num card abre
// o drawer lateral de conversa (thread + Sugestão da Athena + resposta; estado
// "fora da janela 24h" no cenário pós). Monocromático; cor só em crítico.

/* ============================ DADOS (mock) ============================ */

type Scenario = "pre" | "pos";
type ColKey = "novos" | "chat" | "agendamentos" | "documentacao" | "questionarios";

const COLUMNS: { key: ColKey; title: string; icon: string }[] = [
  { key: "novos", title: "Novos Pacientes", icon: "user-plus" },
  { key: "chat", title: "Dúvidas", icon: "chat" }, // dúvidas, valor da consulta, efeitos
  { key: "agendamentos", title: "Agendamentos", icon: "calendar_month" },
  { key: "documentacao", title: "Documentação", icon: "description" }, // atestado, receitas, laudo
  { key: "questionarios", title: "Questionários", icon: "assignment" },
];

type Card = {
  id: string;
  name: string;
  scenario: Scenario;
  subject: { label: string; tone: ChipTone };
  preview: string;
  /** Horas desde o último contato — alimenta a tag de regressão e o "há Xh". */
  lastContactHrs: number;
  /** Meta opcional (consulta / progresso do questionário / prazo). */
  meta?: string;
  /** Janela de 24h do WhatsApp (cenário pós). */
  withinWindow?: boolean;
};

const CARDS: Record<ColKey, Card[]> = {
  novos: [
    { id: "n1", name: "Tiago Mendes", scenario: "pre", subject: { label: "novo cadastro", tone: "muted" }, preview: "Primeiro contato pelo site, gostaria de marcar avaliação para dor crônica.", lastContactHrs: 1 },
    { id: "n2", name: "Sofia Ramos", scenario: "pre", subject: { label: "primeira consulta", tone: "muted" }, preview: "Indicação médica; aguardando triagem inicial.", lastContactHrs: 5 },
  ],
  chat: [
    { id: "c1", name: "Marina Castro", scenario: "pre", subject: { label: "urgência", tone: "critical" }, preview: "Estou com muita sonolência depois de aumentar o CBD, posso reduzir a dose?", lastContactHrs: 0.2, meta: "Consulta 25/06 · 09:30" },
    { id: "c2", name: "Júlia Tavares", scenario: "pre", subject: { label: "nova mensagem", tone: "muted" }, preview: "Bom dia! Consegui marcar o exame de sangue para amanhã.", lastContactHrs: 0.6 },
    { id: "c3", name: "Rui Salgado", scenario: "pre", subject: { label: "valores", tone: "inset" }, preview: "Qual o valor da consulta de retorno por telemedicina?", lastContactHrs: 2 },
    { id: "c4", name: "André Lobo", scenario: "pre", subject: { label: "renovação", tone: "inset" }, preview: "Doutora, a receita do tramadol venceu. Como faço para renovar?", lastContactHrs: 30 },
    { id: "c5", name: "Paulo Reis", scenario: "pre", subject: { label: "dúvida", tone: "muted" }, preview: "Perguntou sobre efeitos colaterais do CBD e ainda não teve retorno.", lastContactHrs: 50 },
    { id: "c6", name: "Marina Castro", scenario: "pos", subject: { label: "acompanhamento", tone: "muted" }, preview: "A sonolência melhorou com a redução da dose. Obrigada!", lastContactHrs: 2, meta: "M3 · WhatsApp", withinWindow: true },
    { id: "c7", name: "André Lobo", scenario: "pos", subject: { label: "renovação", tone: "inset" }, preview: "Ainda estou aguardando o retorno sobre a receita.", lastContactHrs: 26, meta: "M6 · WhatsApp", withinWindow: false },
    { id: "c8", name: "Marina Castro", scenario: "pos", subject: { label: "efeito adverso", tone: "critical" }, preview: "Sonolência diurna persistente após aumento do CBD.", lastContactHrs: 4, meta: "Grau 1 · CTCAE", withinWindow: true },
    { id: "c9", name: "Rui Salgado", scenario: "pos", subject: { label: "efeito em avaliação", tone: "inset" }, preview: "Tontura leve relatada nas primeiras tomadas.", lastContactHrs: 6, meta: "Grau 1 · CTCAE", withinWindow: true },
  ],
  agendamentos: [
    { id: "a1", name: "Bruno Antunes", scenario: "pre", subject: { label: "encaixe", tone: "muted" }, preview: "Tem algum horário de encaixe essa semana? A dor piorou.", lastContactHrs: 0.75 },
    { id: "a2", name: "Carla Nunes", scenario: "pre", subject: { label: "alteração", tone: "inset" }, preview: "Preciso remarcar a consulta de quinta para a próxima semana.", lastContactHrs: 1, meta: "Consulta 27/06 · 14:00" },
    { id: "a3", name: "Diego Farias", scenario: "pre", subject: { label: "novo agendamento", tone: "muted" }, preview: "Gostaria de marcar primeira consulta para dor crônica.", lastContactHrs: 4 },
    { id: "a4", name: "Rui Salgado", scenario: "pos", subject: { label: "retorno", tone: "muted" }, preview: "Agendar retorno M2 conforme plano terapêutico.", lastContactHrs: 6 },
    { id: "a5", name: "Helena Pires", scenario: "pos", subject: { label: "retorno", tone: "muted" }, preview: "Confirmar retorno de acompanhamento; sem resposta ao contato.", lastContactHrs: 52 },
  ],
  documentacao: [
    { id: "d1", name: "André Lobo", scenario: "pos", subject: { label: "receita expirada", tone: "critical" }, preview: "Tramadol 50mg · controle especial.", lastContactHrs: 8, meta: "Venceu 12/06" },
    { id: "d2", name: "Helena Pires", scenario: "pos", subject: { label: "receita vence 3d", tone: "inset" }, preview: "CBD 200mg/mL · uso contínuo.", lastContactHrs: 9, meta: "Vence 28/06" },
    { id: "d3", name: "Carla Nunes", scenario: "pos", subject: { label: "receita vence 7d", tone: "muted" }, preview: "Pregabalina 75mg.", lastContactHrs: 20, meta: "Vence 02/07" },
    { id: "d4", name: "Marina Castro", scenario: "pos", subject: { label: "laudo anvisa", tone: "critical" }, preview: "Laudo para importação de CBD.", lastContactHrs: 3, meta: "Prazo: 26/06" },
    { id: "d5", name: "Bruno Antunes", scenario: "pos", subject: { label: "atestado", tone: "muted" }, preview: "Atestado de 3 dias.", lastContactHrs: 5, meta: "Prazo: 27/06" },
    { id: "d6", name: "Júlia Tavares", scenario: "pos", subject: { label: "relatório", tone: "muted" }, preview: "Relatório de evolução para perícia.", lastContactHrs: 12, meta: "Prazo: 30/06" },
  ],
  questionarios: [
    { id: "q1", name: "Marina Castro", scenario: "pre", subject: { label: "parcial", tone: "inset" }, preview: "Pré-anamnese M3 em andamento.", lastContactHrs: 0.4, meta: "6/9 itens · 67%" },
    { id: "q2", name: "Helena Pires", scenario: "pre", subject: { label: "completo", tone: "muted" }, preview: "Questionário pré-consulta concluído.", lastContactHrs: 2, meta: "9/9 itens · 100%" },
    { id: "q3", name: "Júlia Tavares", scenario: "pre", subject: { label: "sem início", tone: "muted" }, preview: "Aguardando início do questionário.", lastContactHrs: 26, meta: "0/9 itens · 0%" },
    { id: "q4", name: "Helena Pires", scenario: "pos", subject: { label: "completo", tone: "muted" }, preview: "Follow-up M3 concluído.", lastContactHrs: 3, meta: "M3 · 9/9" },
    { id: "q5", name: "Marina Castro", scenario: "pos", subject: { label: "parcial", tone: "inset" }, preview: "Follow-up M3 em andamento.", lastContactHrs: 10, meta: "M3 · 5/9" },
    { id: "q6", name: "Diego Farias", scenario: "pos", subject: { label: "atrasado", tone: "critical" }, preview: "Follow-up M1 não respondido.", lastContactHrs: 70, meta: "M1 · 0/9" },
  ],
};

// Diagnóstico sutil por cenário/coluna (herdado do `hint` dos antigos KPIs).
const DIAGNOSTICS: Record<Scenario, Partial<Record<ColKey, string>>> = {
  pre: {
    novos: "1 novo cadastro · 1 primeira consulta",
    chat: "1 urgência · 1 sem retorno >48h",
    agendamentos: "1 encaixe · 1 alteração · 1 novo",
    questionarios: "1 completo · 1 parcial · 1 sem início",
  },
  pos: {
    chat: "1 efeito adverso ativo · 1 fora da janela 24h",
    agendamentos: "2 retornos a agendar · 1 sem retorno >48h",
    documentacao: "1 receita expirada · 1 laudo ANVISA",
    questionarios: "1 completo · 1 parcial · 1 atrasado",
  },
};

// Thread (mock) por card. role: paciente (esq.) / clínica (dir.).
const THREADS: Record<string, { role: "patient" | "clinic"; text: string; at: string }[]> = {
  c1: [
    { role: "patient", text: "Bom dia, Dra. Aumentei o CBD para 0,5 mL 2× ao dia como combinado.", at: "08:42" },
    { role: "patient", text: "Mas estou com muita sonolência durante o dia. Posso reduzir a dose?", at: "08:43" },
  ],
  c6: [
    { role: "clinic", text: "Oi, Marina! Como está a sonolência depois que ajustamos a dose da noite?", at: "09:10" },
    { role: "patient", text: "Bem melhor, doutora! Consegui dormir e acordar mais disposta.", at: "09:24" },
    { role: "patient", text: "A sonolência melhorou com a redução da dose. Obrigada!", at: "09:25" },
  ],
};

const SUGGESTION =
  "Olá! Obrigada por avisar. A sonolência pode ser transitória nas primeiras semanas. " +
  "Por segurança, mantenha a dose da manhã e reduza a da noite para 0,3 mL até a próxima consulta, " +
  "quando reavaliamos juntos. Evite dirigir se sentir sono. Qualquer piora, me avise por aqui.";

/* ============================ HELPERS ============================ */

// Tag de regressão do último contato: alerta em 24h (atenção) e >48h (crítico).
function regressionTag(hrs: number): { label: string; tone: ChipTone } | null {
  if (hrs > 48) return { label: "sem retorno >48h", tone: "critical" };
  if (hrs >= 24) return { label: "sem retorno >24h", tone: "inset" };
  return null;
}

// "há Xmin" / "há Xh" / "há Xd" a partir das horas desde o último contato.
function fmtAgo(hrs: number): string {
  if (hrs < 1) return `há ${Math.round(hrs * 60)} min`;
  if (hrs < 24) return `há ${Math.round(hrs)} h`;
  return `há ${Math.round(hrs / 24)} d`;
}

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
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-neutral-200 px-4 py-8 text-center">
      <Icon name="inbox" size={24} className="text-neutral-300" />
      <span className="text-caption text-neutral-400">{text}</span>
    </div>
  );
}

function KanbanCardItem({ card, onOpen }: { card: Card; onOpen: () => void }) {
  const reg = regressionTag(card.lastContactHrs);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card-solid flex w-full flex-col gap-2 rounded-[16px] p-3 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <Avatar name={card.name} seed={card.name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{card.name}</span>
        <Chip tone={card.subject.tone}>{card.subject.label}</Chip>
      </div>
      <p className="line-clamp-2 text-caption text-neutral-600 text-pretty">{card.preview}</p>
      <div className="flex items-center gap-2">
        {reg ? <Chip tone={reg.tone}>{reg.label}</Chip> : null}
        <span className="font-mono text-micro text-neutral-400">{fmtAgo(card.lastContactHrs)}</span>
        {card.meta ? (
          <>
            <span className="text-neutral-300">·</span>
            <span className="min-w-0 flex-1 truncate font-mono text-micro text-neutral-500">{card.meta}</span>
          </>
        ) : null}
      </div>
    </button>
  );
}

function KanbanColumn({
  col,
  cards,
  diagnostic,
  onOpen,
}: {
  col: { key: ColKey; title: string; icon: string };
  cards: Card[];
  diagnostic?: string;
  onOpen: (c: Card) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {/* Título da coluna + numeral. */}
      <div className="flex items-center gap-2 px-1">
        <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-400" />
        <Icon name={col.icon} size={18} className="text-neutral-500" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{col.title}</span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-micro text-neutral-600">
          {cards.length}
        </span>
      </div>

      {/* Card sutil de diagnóstico da coluna (só quando há cards e diagnóstico). */}
      {cards.length && diagnostic ? (
        <div className="flex items-center gap-1.5 rounded-[14px] bg-neutral-100/60 px-3 py-2">
          <Icon name="sparkles" size={13} className="shrink-0 text-neutral-400" />
          <span className="min-w-0 truncate font-mono text-micro text-neutral-500">{diagnostic}</span>
        </div>
      ) : null}

      {/* Cards de acompanhamento. */}
      <div className="flex flex-col gap-3">
        {cards.length ? (
          cards.map((c) => <KanbanCardItem key={c.id} card={c} onOpen={() => onOpen(c)} />)
        ) : (
          <EmptyState text="Nenhum card" />
        )}
      </div>
    </div>
  );
}

/* ============================ DRAWER (conversa unificada) ============================ */

function AcompanhamentoDrawer({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const goTo = useFlow((s) => s.goTo);
  const [reply, setReply] = useState("");
  const thread = card ? THREADS[card.id] ?? [] : [];
  const within = card?.withinWindow ?? true;

  return (
    <SlideOverPanel open={Boolean(card)} onClose={onClose} label="Conversa" className="max-w-[440px]">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Cabeçalho. */}
        <div className="flex items-center gap-3">
          <Avatar name={card?.name ?? ""} seed={card?.name} size="md" className="h-11 w-11" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body font-medium text-ink">{card?.name}</span>
            {card?.meta ? <span className="font-mono text-micro text-neutral-500">{card.meta}</span> : null}
          </div>
          {card ? <Chip tone={card.subject.tone}>{card.subject.label}</Chip> : null}
        </div>

        {/* Thread. */}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-[16px] bg-neutral-100/60 p-3">
          {thread.length ? (
            thread.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-0.5", m.role === "clinic" ? "items-end" : "items-start")}>
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
            ))
          ) : (
            <div className="rounded-[14px] bg-paper px-3 py-2 text-caption text-neutral-600 shadow-sm">
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

        {/* Resposta ou aviso de janela 24h. */}
        {within ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Digite uma resposta…"
              rows={3}
              className="w-full resize-none rounded-[16px] border border-neutral-200 bg-paper px-3 py-2 text-caption text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo("pre-review")}
                className="flex-1 text-left font-mono text-micro text-neutral-400 transition-colors hover:text-ink"
              >
                Ver prontuário
              </button>
              <button
                type="button"
                disabled={!reply.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-caption font-medium text-paper disabled:opacity-40"
              >
                <Icon name="send" size={16} /> Enviar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2 rounded-[16px] border border-neutral-300 bg-neutral-100 p-3">
              <Icon name="time-five" size={18} className="mt-0.5 text-neutral-500" />
              <p className="text-caption text-neutral-600 text-pretty">
                Fora da janela de 24h do WhatsApp. Só é possível reabrir a conversa com um template
                aprovado (disparo automático do follow-up).
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo("pre-review")}
              className="text-left font-mono text-micro text-neutral-400 transition-colors hover:text-ink"
            >
              Ver prontuário
            </button>
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
}

/* ============================ TELA ============================ */

export function AcompanhamentoCenter() {
  const [scenario, setScenario] = useState<Scenario>("pre");
  const [selected, setSelected] = useState<Card | null>(null);

  return (
    <AppScreen>
      <ScreenHeader
        title="Acompanhamento"
        subtitle="Relacionamento com o paciente antes e depois da consulta — novos pacientes, chat, agendamentos, documentação e questionários. Clique num card para abrir a conversa."
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

      {/* Filtro de cenário — lente principal do quadro (Pré ↔ Pós). */}
      <div className="flex">
        <Segmented
          value={scenario}
          onChange={setScenario}
          options={[
            { key: "pre", label: "Pré-consulta" },
            { key: "pos", label: "Pós-consulta" },
          ]}
        />
      </div>

      <div className="flex items-start gap-4">
        {COLUMNS.map((col) => {
          const cards = CARDS[col.key].filter((c) => c.scenario === scenario);
          return (
            <KanbanColumn
              key={col.key}
              col={col}
              cards={cards}
              diagnostic={DIAGNOSTICS[scenario][col.key]}
              onOpen={setSelected}
            />
          );
        })}
      </div>

      <AcompanhamentoDrawer card={selected} onClose={() => setSelected(null)} />
    </AppScreen>
  );
}
