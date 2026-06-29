"use client";

import { useState } from "react";
import { AppScreen, ScreenHeader, Eyebrow, Avatar, Chip, WireButton, WireField, Icon } from "@/components/ui";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `patients` — Pacientes (lista mestre). Sidebar de filtros (4 seções, com
// contagem) + cabeçalho dinâmico + busca + tabela rica de 6 colunas (Paciente ·
// Idade · Diagnóstico · Último atendimento · Status FUP · Ações) + paginação +
// modal de cadastro em 5 passos. Monocromático. Conteúdo conforme contrato
// PACIENTES §6.

/* ============================ DADOS (mock) ============================ */

const FILTER_SECTIONS: {
  title: string;
  items: { key: string; label: string; icon: string; count: number }[];
}[] = [
  {
    title: "Janela operacional",
    items: [
      { key: "agendados_hoje", label: "Agendados hoje", icon: "bx-calendar-check", count: 12 },
      { key: "proximos_30d", label: "Próximos 30 dias", icon: "bx-calendar", count: 47 },
      { key: "onboarding_pendente", label: "Onboarding pendente", icon: "bx-user-plus", count: 3 },
    ],
  },
  {
    title: "Risco de abandono",
    items: [
      { key: "sem_consulta_6m", label: "Sem consulta >6m", icon: "bx-time", count: 31 },
      { key: "sem_consulta_12m", label: "Sem consulta >12m", icon: "bx-error", count: 18 },
      { key: "sem_consulta_18m", label: "Sem consulta >18m", icon: "bx-error-circle", count: 9 },
    ],
  },
  {
    title: "Compliance & FUP",
    items: [
      { key: "fup_atrasado", label: "FUP M1–M12 atrasado", icon: "bx-clipboard", count: 7 },
      { key: "receita_vencida_7d", label: "Receita vencida <7d", icon: "bx-capsule", count: 5 },
      { key: "tcle_pendente", label: "TCLE pendente", icon: "bx-shield", count: 11 },
      { key: "nps_pendente", label: "Formulário NPS", icon: "bx-smile", count: 0 },
    ],
  },
  {
    title: "Perfil clínico",
    items: [
      { key: "top_cids", label: "Top CIDs", icon: "bx-plus-medical", count: 0 },
      { key: "top_tratamentos", label: "Top tratamentos", icon: "bx-capsule", count: 0 },
      { key: "coortes_ativas", label: "Coortes ativas", icon: "bx-star", count: 4 },
      { key: "casos_publicaveis", label: "Casos publicáveis", icon: "bx-microscope", count: 6 },
    ],
  },
];

const FILTER_TITLES: Record<string, string> = {
  all: "Pacientes",
  agendados_hoje: "Agendados hoje",
  proximos_30d: "Próximos 30 dias",
  onboarding_pendente: "Onboarding pendente",
  sem_consulta_6m: "Sem consulta há mais de 6 meses",
  sem_consulta_12m: "Sem consulta há mais de 12 meses",
  sem_consulta_18m: "Sem consulta há mais de 18 meses",
  fup_atrasado: "FUP M1–M12 atrasado",
  receita_vencida_7d: "Receita vencida em menos de 7 dias",
  tcle_pendente: "TCLE pendente",
};

type FupStatus = "completo" | "em_andamento" | "atrasado" | "aguardando";

const PATIENTS: {
  name: string;
  sex: "F" | "M";
  age: number;
  cid: string;
  cidText: string;
  last: string;
  lastRel: string;
  recency: "now" | "weeks" | "months" | "long" | "none";
  stars: number;
  phone: boolean;
  fup: { milestone: string; status: FupStatus; done: number; total: number; pct: number; steps: number; stepsDone: number } | null;
}[] = [
  { name: "Marina Castro", sex: "F", age: 38, cid: "M54.5", cidText: "Dor lombar baixa (crônica)", last: "hoje 09:30", lastRel: "hoje", recency: "now", stars: 2, phone: true, fup: { milestone: "M3", status: "atrasado", done: 3, total: 9, pct: 33, steps: 4, stepsDone: 1 } },
  { name: "André Lobo", sex: "M", age: 52, cid: "M79.7", cidText: "Fibromialgia", last: "12/12/2025", lastRel: "há 6 m", recency: "months", stars: 0, phone: true, fup: { milestone: "M6", status: "completo", done: 9, total: 9, pct: 100, steps: 4, stepsDone: 4 } },
  { name: "Júlia Tavares", sex: "F", age: 29, cid: "G47.0", cidText: "Insônia refratária", last: "sem consulta", lastRel: "—", recency: "none", stars: 0, phone: false, fup: null },
  { name: "Rui Salgado", sex: "M", age: 61, cid: "G44.2", cidText: "Cefaleia tensional", last: "28/01/2026", lastRel: "há 5 m", recency: "months", stars: 1, phone: true, fup: { milestone: "M1", status: "em_andamento", done: 5, total: 9, pct: 56, steps: 4, stepsDone: 2 } },
  { name: "Helena Pires", sex: "F", age: 44, cid: "F41.1", cidText: "Ansiedade generalizada", last: "10/02/2026", lastRel: "há 4 m", recency: "weeks", stars: 3, phone: true, fup: { milestone: "M3", status: "aguardando", done: 0, total: 9, pct: 0, steps: 4, stepsDone: 0 } },
  { name: "Bruno Antunes", sex: "M", age: 47, cid: "M54.5", cidText: "Dor lombar baixa (crônica)", last: "05/05/2025", lastRel: "há 13 m", recency: "long", stars: 0, phone: true, fup: null },
];

const RECENCY_DOT: Record<string, string> = {
  now: "bg-ink",
  weeks: "bg-neutral-600",
  months: "bg-neutral-400",
  long: "bg-neutral-300",
  none: "bg-neutral-200",
};

const FUP_LABEL: Record<FupStatus, string> = {
  completo: "completo",
  em_andamento: "em andamento",
  atrasado: "atrasado",
  aguardando: "aguardando",
};

const STEPS = ["Identificação", "Contato", "Convênio", "Perfil clínico", "Origem & tags"];

/* ============================ SIDEBAR ============================ */

function FilterSidebar({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col gap-5">
      {FILTER_SECTIONS.map((sec) => (
        <div key={sec.title} className="flex flex-col gap-1.5">
          <Eyebrow>{sec.title}</Eyebrow>
          <div className="flex flex-col gap-0.5">
            {sec.items.map((it) => {
              const on = it.key === active;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => onChange(it.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-[12px] px-2 py-1.5 text-left transition-colors",
                    on ? "bg-neutral-100 text-ink" : "text-neutral-600 hover:bg-neutral-100/60",
                  )}
                >
                  <Icon name={it.icon} size={16} className={on ? "text-ink" : "text-neutral-400"} />
                  <span className="min-w-0 flex-1 truncate text-caption">{it.label}</span>
                  {it.count > 0 ? (
                    <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 font-mono text-micro text-neutral-600">
                      {it.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}

/* ============================ TABELA ============================ */

function FupCell({ fup }: { fup: (typeof PATIENTS)[number]["fup"] }) {
  if (!fup) return <span className="text-caption italic text-neutral-400">sem FUP</span>;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-caption font-medium text-ink">{fup.milestone}</span>
        <Chip tone={fup.status === "atrasado" ? "inset" : "muted"}>{FUP_LABEL[fup.status]}</Chip>
      </div>
      <span className="font-mono text-micro text-neutral-500">
        {fup.done}/{fup.total} itens · {fup.pct}%
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: fup.steps }).map((_, i) => (
          <span
            key={i}
            className={cn("h-1 w-5 rounded-full", i < fup.stepsDone ? "bg-ink" : "bg-neutral-200")}
          />
        ))}
      </div>
    </div>
  );
}

function PatientsTable({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="card-solid flex flex-col rounded-[20px]">
      {/* Cabeçalho. */}
      <div className="flex items-center gap-3 border-b border-neutral-200/70 px-4 py-2.5">
        <span className="min-w-0 flex-1 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Paciente</span>
        <span className="w-16 shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Idade</span>
        <span className="w-52 shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Diagnóstico</span>
        <span className="w-28 shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Último</span>
        <span className="w-40 shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Status FUP</span>
        <span className="w-16 shrink-0 text-right font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Ações</span>
      </div>

      {PATIENTS.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-3 border-b border-neutral-200/50 px-4 py-3 last:border-0"
        >
          {/* Paciente. */}
          <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
            <Avatar name={p.name} seed={p.name} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-caption font-medium text-ink">{p.name}</span>
                {p.stars > 0 ? (
                  <span className="shrink-0 font-mono text-micro text-neutral-400">{"★".repeat(p.stars)}</span>
                ) : null}
              </span>
            </div>
          </button>
          {/* Idade. */}
          <span className="w-16 shrink-0 font-mono text-caption text-neutral-600">
            {p.recency === "none" && p.last === "sem consulta" ? "—" : `${p.age}a ${p.sex}`}
          </span>
          {/* Diagnóstico. */}
          <span className="flex w-52 shrink-0 items-center gap-1.5">
            <span className="font-mono text-caption font-medium text-ink">{p.cid}</span>
            <span className="min-w-0 truncate text-micro text-neutral-500">{p.cidText}</span>
          </span>
          {/* Último atendimento. */}
          <span className="flex w-28 shrink-0 items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", RECENCY_DOT[p.recency])} />
            <span className="truncate font-mono text-micro text-neutral-600">{p.lastRel}</span>
          </span>
          {/* FUP. */}
          <div className="w-40 shrink-0">
            <FupCell fup={p.fup} />
          </div>
          {/* Ações. */}
          <div className="flex w-16 shrink-0 items-center justify-end gap-1">
            {p.phone ? (
              <button
                type="button"
                aria-label="WhatsApp"
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
              >
                <Icon name="whatsapp" size={18} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpen}
              aria-label="Prontuário"
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
            >
              <Icon name="file" size={18} />
            </button>
          </div>
        </div>
      ))}

      {/* Paginação. */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex-1 font-mono text-micro text-neutral-500">Mostrando 1–6 de 128</span>
        <button type="button" disabled aria-label="Anterior" className="grid h-8 w-8 place-items-center rounded-full text-neutral-300">
          <Icon name="chevron-left" size={18} />
        </button>
        <span className="font-mono text-micro text-neutral-600">1 / 22</span>
        <button type="button" aria-label="Próxima" className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
          <Icon name="chevron-right" size={18} />
        </button>
      </div>
    </div>
  );
}

/* ============================ MODAL DE CADASTRO ============================ */

function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div onClick={onClose} aria-hidden className="absolute inset-0 bg-[#e6e6e4]/50 backdrop-blur-sm" />
      <div className="relative flex max-h-[calc(100dvh-3rem)] w-full max-w-[720px] flex-col gap-5 overflow-hidden rounded-[24px] bg-paper p-6 shadow-[var(--shadow-card)]">
        {/* Cabeçalho + passos. */}
        <div className="flex items-center gap-3">
          <h2 className="flex-1 font-display text-title font-medium text-ink">Cadastrar paciente</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className="flex flex-1 items-center gap-2"
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-micro",
                  i === step ? "bg-ink text-paper" : i < step ? "bg-neutral-300 text-ink" : "bg-neutral-100 text-neutral-500",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("min-w-0 truncate text-micro", i === step ? "text-ink" : "text-neutral-400")}>{s}</span>
              {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-neutral-200" /> : null}
            </button>
          ))}
        </div>

        {/* Campos do passo. */}
        <div className="no-scrollbar grid grid-cols-2 gap-4 overflow-y-auto py-1">
          {step === 0 && (
            <>
              <WireField label="Nome completo *" value="Maria Teste" />
              <WireField label="Nome social" value="" />
              <WireField label="CPF *" value="000.000.000-00" mono />
              <WireField label="Nascimento *" value="14/05/1987" mono />
              <WireField label="Sexo biológico *" value="Feminino" />
              <WireField label="Estado civil" value="Casada" />
            </>
          )}
          {step === 1 && (
            <>
              <WireField label="WhatsApp *" value="(11) 98765-4321" mono />
              <WireField label="Telefone alternativo" value="" mono />
              <WireField label="E-mail" value="maria@email.com" />
              <WireField label="Contato de emergência" value="João Teste · (11) 91234-5678" />
            </>
          )}
          {step === 2 && (
            <>
              <WireField label="Convênio" value="Saúde Plena" />
              <WireField label="Plano" value="Apartamento" />
              <WireField label="Carteirinha" value="0042 1187 5530" mono />
              <WireField label="Validade" value="12/2027" mono />
            </>
          )}
          {step === 3 && (
            <>
              <WireField label="Diagnóstico principal (CID)" value="M54.5 · Dor lombar" />
              <WireField label="Comorbidades" value="Fibromialgia, ansiedade" />
              <WireField label="Alergias" value="Dipirona, AINEs" />
              <WireField label="Medicações em uso" value="CBD, amitriptilina" area />
            </>
          )}
          {step === 4 && (
            <>
              <WireField label="Origem (referral)" value="Indicação médica" />
              <div className="col-span-2 flex flex-col gap-1.5">
                <Eyebrow>Tags operacionais</Eyebrow>
                <div className="flex flex-wrap gap-2">
                  {["Atenção redobrada", "Acompanhante obrigatório", "Comunicação por telefone", "Reagendamentos frequentes", "Encaixe prioritário", "Encaminhado por colega"].map((t) => (
                    <Chip key={t} tone="muted">{t}</Chip>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé. */}
        <div className="flex items-center gap-3 border-t border-neutral-200/70 pt-4">
          <WireButton variant="ghost">Salvar como rascunho</WireButton>
          <span className="flex-1" />
          {step > 0 ? (
            <WireButton variant="secondary" onClick={() => setStep((s) => s - 1)}>Voltar</WireButton>
          ) : null}
          {step < STEPS.length - 1 ? (
            <WireButton variant="primary" onClick={() => setStep((s) => s + 1)}>Continuar</WireButton>
          ) : (
            <WireButton variant="primary" onClick={onClose}>Salvar paciente</WireButton>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ TELA ============================ */

export function PatientsCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [filter, setFilter] = useState("agendados_hoje");
  const [register, setRegister] = useState(false);

  const title = FILTER_TITLES[filter] ?? "Pacientes";

  return (
    <AppScreen>
      <ScreenHeader
        title={title}
        subtitle="1.284 pacientes · ordenados por horário"
        actions={
          <>
            <WireButton variant="primary" onClick={() => setRegister(true)} className="gap-2">
              <Icon name="user-plus" size={18} /> Cadastrar paciente
            </WireButton>
            <WireButton variant="secondary" onClick={() => goTo("agenda")} className="gap-2">
              <Icon name="calendar-plus" size={18} /> Novo agendamento
            </WireButton>
          </>
        }
      />

      <div className="flex items-start gap-6">
        <FilterSidebar active={filter} onChange={setFilter} />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Busca + filtros avançados. */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-full border-[0.8px] border-neutral-200 bg-paper px-4">
              <Icon name="search" size={18} className="text-neutral-400" />
              <input
                placeholder="Buscar por nome, CPF, telefone ou CID…"
                className="flex-1 bg-transparent text-caption text-ink placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <WireButton variant="secondary" className="gap-2">
              <Icon name="slider-alt" size={18} /> Filtros avançados
            </WireButton>
          </div>

          <PatientsTable onOpen={() => goTo("pre-review")} />
        </div>
      </div>

      <RegisterModal open={register} onClose={() => setRegister(false)} />
    </AppScreen>
  );
}
