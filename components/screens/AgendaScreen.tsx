"use client";

import { useState } from "react";
import { AppScreen, ScreenHeader, Eyebrow, Avatar, Chip, KpiCard, Segmented, WireButton, Icon } from "@/components/ui";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `agenda` — tela operacional do dia a dia (alta densidade). Cabeçalho + faixa de
// KPIs (seletor de médico + 4 KPIs) + lateral (mini-calendário + alertas) +
// alternador de visão (Dia/Semana/Mês/Consultório) + visão Dia (lista rica).
// Monocromático: a "cor do médico" vira ponto/iniciais em cinza. Conteúdo conforme
// contrato AGENDA §6.

/* ============================ DADOS (mock) ============================ */

type View = "dia" | "semana" | "mes" | "consultorio";
type Status = "booked" | "arrived" | "fulfilled" | "cancelled" | "noshow";

const STATUS_LABEL: Record<Status, string> = {
  booked: "Agendado",
  arrived: "Chegou",
  fulfilled: "Realizada",
  cancelled: "Cancelada",
  noshow: "Faltou",
};

const MODALITY_ICON: Record<string, string> = {
  in_person: "bx-map",
  tele: "bx-video",
  hybrid: "bx-phone",
};

const DAY_APPTS: {
  time: string;
  name: string;
  age: string;
  type: string;
  modality: "in_person" | "tele" | "hybrid";
  status: Status;
  previsit: number;
  stars: number;
  room: string;
}[] = [
  { time: "09:00", name: "Marina Castro", age: "38a F", type: "Pré-consulta", modality: "tele", status: "arrived", previsit: 100, stars: 2, room: "Sala 1" },
  { time: "09:30", name: "André Lobo", age: "52a M", type: "Retorno", modality: "in_person", status: "booked", previsit: 50, stars: 3, room: "Sala 1" },
  { time: "10:15", name: "Júlia Tavares", age: "29a F", type: "1ª consulta", modality: "in_person", status: "booked", previsit: 0, stars: 0, room: "Sala 2" },
  { time: "11:00", name: "Rui Salgado", age: "61a M", type: "Retorno", modality: "tele", status: "fulfilled", previsit: 100, stars: 1, room: "Sala 1" },
  { time: "14:00", name: "Helena Pires", age: "44a F", type: "Controle especial", modality: "in_person", status: "booked", previsit: 50, stars: 3, room: "Sala 2" },
  { time: "15:00", name: "Bruno Antunes", age: "47a M", type: "Avaliação", modality: "hybrid", status: "cancelled", previsit: 0, stars: 0, room: "Sala 1" },
];

const KPIS = [
  { icon: "event", label: "Agendados", value: "184", hint: "47 esta semana · 14 hoje" },
  { icon: "check_circle", label: "Confirmados", value: "132", hint: "72% · 9 hoje · 5 aguardando" },
  { icon: "assignment_turned_in", label: "Pré-consultas concluídas", value: "98", hint: "73% do total" },
  { icon: "event_busy", label: "Sem confirmação amanhã", value: "6", hint: "pacientes a confirmar" },
];

const ALERTS: { type: "danger" | "info"; icon: string; title: string; sub: string }[] = [
  { type: "danger", icon: "bx-error", title: "6 sem confirmação", sub: "para amanhã (qua, 20 jun)" },
  { type: "info", icon: "bx-video", title: "4 telemedicinas hoje", sub: "verifique os links de acesso" },
  { type: "danger", icon: "bx-time", title: "3 seguimentos atrasados", sub: "FUP M1–M12 a reaplicar" },
];

const WEEK_INITIALS = ["S", "T", "Q", "Q", "S", "S", "D"];
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const CURRENT_WEEK = new Set([16, 17, 18, 19, 20, 21, 22]);
const TODAY = 19;

const WEEK_DAYS = [
  ["Seg", "16"], ["Ter", "17"], ["Qua", "18"], ["Qui", "19"],
  ["Sex", "20"], ["Sáb", "21"], ["Dom", "22"],
];

/* ============================ LATERAL ============================ */

function MiniCalendar() {
  return (
    <div className="flex flex-col gap-2 rounded-[20px] bg-[#f9f9f9] p-4">
      <div className="flex items-center gap-2">
        <span className="flex-1 text-caption font-medium text-ink">Junho 2026</span>
        <button aria-label="Mês anterior" className="text-neutral-400 hover:text-ink">
          <Icon name="chevron-left" size={18} />
        </button>
        <button aria-label="Próximo mês" className="text-neutral-400 hover:text-ink">
          <Icon name="chevron-right" size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEK_INITIALS.map((w, i) => (
          <span key={i} className="grid h-6 place-items-center font-mono text-micro text-neutral-400">{w}</span>
        ))}
        {MONTH_DAYS.map((d) => (
          <button
            key={d}
            className={cn(
              "grid h-7 place-items-center rounded-full font-mono text-micro",
              d === TODAY ? "bg-ink text-paper" : CURRENT_WEEK.has(d) ? "bg-paper text-ink" : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertsPanel() {
  return (
    <div className="flex flex-col gap-2 rounded-[20px] bg-[#f9f9f9] p-4">
      <Eyebrow>Alertas da agenda</Eyebrow>
      <div className="flex flex-col gap-2">
        {ALERTS.map((a) => (
          <div key={a.title} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
                a.type === "danger" ? "bg-critical-weak text-critical" : "bg-neutral-100 text-neutral-500",
              )}
            >
              <Icon name={a.icon} size={16} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-caption font-medium text-ink">{a.title}</span>
              <span className="text-micro text-neutral-500">{a.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ VISÕES ============================ */

function DiaView({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      {DAY_APPTS.map((a) => (
        <div
          key={a.time + a.name}
          className="card-solid flex items-center gap-3 rounded-[16px] px-4 py-3"
        >
          <div className="flex w-14 shrink-0 flex-col items-center">
            <span className="font-mono text-caption font-medium text-ink">{a.time}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
          </div>
          <Avatar name={a.name} seed={a.name} size="sm" />
          <button onClick={onOpen} className="flex min-w-0 flex-1 flex-col text-left">
            <span className="flex items-center gap-2">
              <span className="truncate text-caption font-medium text-ink">{a.name}</span>
              <span className="font-mono text-micro text-neutral-400">{a.age}</span>
            </span>
            <span className="truncate text-micro text-neutral-500">{a.type}</span>
          </button>
          <span className="hidden items-center gap-1.5 md:flex">
            <Icon name={MODALITY_ICON[a.modality]} size={16} className="text-neutral-500" />
            {a.previsit > 0 ? <Chip tone="muted">{a.previsit}% pré-consulta</Chip> : null}
            {a.stars > 0 ? (
              <span className="font-mono text-micro text-neutral-400">{"★".repeat(a.stars)}</span>
            ) : null}
          </span>
          <Chip tone={a.status === "cancelled" || a.status === "noshow" ? "inset" : "muted"}>
            {STATUS_LABEL[a.status]}
          </Chip>
          <button aria-label="Mais ações" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-ink">
            <Icon name="dots-vertical-rounded" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SemanaView({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex gap-2">
      {WEEK_DAYS.map(([d, n], i) => {
        const appts = DAY_APPTS.filter((_, idx) => idx % 7 === i % 3); // distribuição mock
        return (
          <div key={d} className="flex min-w-0 flex-1 flex-col gap-2">
            <div className={cn("flex flex-col items-center gap-0.5 rounded-[12px] py-1.5", i === 3 ? "bg-neutral-100" : "")}>
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">{d}</span>
              <span className={cn("text-caption", i === 3 ? "font-medium text-ink" : "text-neutral-600")}>{n}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {appts.length ? (
                appts.map((a) => (
                  <button
                    key={a.name}
                    onClick={onOpen}
                    className="card-solid flex flex-col gap-0.5 rounded-[10px] px-2 py-1.5 text-left"
                  >
                    <span className="font-mono text-micro text-neutral-500">{a.time}</span>
                    <span className="truncate text-micro font-medium text-ink">{a.name.split(" ")[0]}</span>
                  </button>
                ))
              ) : (
                <span className="py-2 text-center text-micro text-neutral-300">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MesView() {
  const lead = 6; // jun/2026 começa no domingo (mock)
  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEK_INITIALS.map((w, i) => (
        <span key={i} className="grid h-7 place-items-center font-mono text-micro uppercase text-neutral-400">{w}</span>
      ))}
      {Array.from({ length: lead }).map((_, i) => (
        <span key={`pad-${i}`} />
      ))}
      {MONTH_DAYS.map((d) => (
        <div
          key={d}
          className={cn(
            "flex h-20 flex-col gap-1 rounded-[10px] border border-neutral-200/70 p-1.5",
            d === TODAY ? "bg-neutral-100" : "bg-paper",
          )}
        >
          <span className={cn("font-mono text-micro", d === TODAY ? "font-medium text-ink" : "text-neutral-500")}>{d}</span>
          {d % 3 === 0 ? (
            <span className="flex gap-0.5">
              {Array.from({ length: (d % 4) + 1 }).map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              ))}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ConsultorioView({ onOpen }: { onOpen: () => void }) {
  const rooms = ["Sala 1", "Sala 2", "Sem consultório"];
  return (
    <div className="flex gap-3">
      {rooms.map((room) => {
        const appts = DAY_APPTS.filter((a) => a.room === room);
        return (
          <div key={room} className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <span className="flex-1 text-caption font-medium text-ink">{room}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-micro text-neutral-600">{appts.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {appts.length ? (
                appts.map((a) => (
                  <button key={a.name} onClick={onOpen} className="card-solid flex flex-col gap-0.5 rounded-[12px] px-3 py-2 text-left">
                    <span className="font-mono text-micro text-neutral-500">{a.time}</span>
                    <span className="truncate text-caption font-medium text-ink">{a.name}</span>
                    <span className="text-micro text-neutral-500">{a.type}</span>
                  </button>
                ))
              ) : (
                <span className="rounded-[12px] border border-dashed border-neutral-200 py-6 text-center text-micro text-neutral-300">
                  Sem atendimentos
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ TELA ============================ */

export function AgendaCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [view, setView] = useState<View>("dia");

  return (
    <AppScreen>
      <ScreenHeader
        title="Agenda"
        subtitle="Hoje · ter, 19 jun · 14 atendimentos · 9 confirmados"
        actions={
          <>
            <WireButton variant="secondary" className="gap-2">
              <Icon name="slider-alt" size={18} /> Filtros
            </WireButton>
            <WireButton variant="secondary" onClick={() => goTo("patients")} className="gap-2">
              <Icon name="user-plus" size={18} /> Cadastrar paciente
            </WireButton>
            <WireButton variant="primary" className="gap-2">
              <Icon name="plus" size={18} /> Novo agendamento
            </WireButton>
          </>
        }
      />

      {/* KPIs + seletor de médico. */}
      <div className="flex flex-wrap gap-3">
        <button className="card-solid flex min-w-[180px] flex-1 items-center gap-3 rounded-[20px] p-4 text-left">
          <span className="h-7 w-7 shrink-0 rounded-full bg-neutral-700" />
          <div className="flex min-w-0 flex-1 flex-col">
            <Eyebrow>Médico</Eyebrow>
            <span className="truncate text-caption font-medium text-ink">Dra. Helena Prado · você</span>
          </div>
          <Icon name="chevron-down" size={18} className="text-neutral-400" />
        </button>
        {KPIS.map((k) => (
          <KpiCard key={k.label} icon={k.icon} label={k.label} value={k.value} hint={k.hint} />
        ))}
      </div>

      {/* Corpo: lateral + visão. */}
      <div className="flex items-start gap-6">
        <aside className="flex w-[240px] shrink-0 flex-col gap-4">
          <MiniCalendar />
          <AlertsPanel />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Alternador de visão + navegação de data. */}
          <div className="flex items-center gap-3">
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { key: "dia", label: "Dia" },
                { key: "semana", label: "Semana" },
                { key: "mes", label: "Mês" },
                { key: "consultorio", label: "Consultório" },
              ]}
            />
            <span className="flex-1" />
            <Chip tone="inset">Hoje</Chip>
            <button aria-label="Anterior" className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
              <Icon name="chevron-left" size={18} />
            </button>
            <span className="font-mono text-caption text-neutral-600">ter, 19 jun</span>
            <button aria-label="Próximo" className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          {view === "dia" && <DiaView onOpen={() => goTo("pre-review")} />}
          {view === "semana" && <SemanaView onOpen={() => goTo("pre-review")} />}
          {view === "mes" && <MesView />}
          {view === "consultorio" && <ConsultorioView onOpen={() => goTo("pre-review")} />}
        </div>
      </div>
    </AppScreen>
  );
}
