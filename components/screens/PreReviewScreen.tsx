"use client";

import { useRef, useState, type ReactNode } from "react";
import { WireButton, Avatar, Eyebrow, ScrollTabs } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `pre-review` — Paciente 360 · Perfil. Redesign (Figma "v2"): ESQUERDA = sidebar
// FIXA (~311px) com identidade + contato + 3 accordions (Condições, Dados
// pessoais, Indicadores), todos RECOLHIDOS por padrão. CENTRO = topo fixo
// (Resumo do status atual + Alertas pré-consulta) + barra de ABAS com os
// aprofundamentos. Cards SÓLIDOS (#f9f9f9 · .card-solid) com sombra suave; nada
// de cor — gravidade clínica por peso de cinza.

/* ============================ DADOS (mock) ============================ */

const PATIENT = {
  name: "Marina Castro",
  seed: "marina",
  age: "38 anos",
  cid: "M54.5",
};

const CONTACT: [string, string][] = [
  ["Telefone", "(11) 98765-4321"],
  ["E-mail", "marina.castro@email.com"],
  ["Plano", "Saúde Plena · Apartamento"],
  ["Carteirinha", "0042 1187 5530"],
];

const CONDITIONS = ["Ansiedade", "Fibromialgia", "Dor crônica"];

const PERSONAL: [string, string][] = [
  ["Nascimento", "14/05/1987"],
  ["Sexo", "Feminino"],
  ["Profissão", "Arquiteta"],
  ["Estado civil", "Casada"],
  ["Cidade", "São Paulo · SP"],
  ["Endereço", "R. das Acácias, 210 · Pinheiros"],
];

const INDICATORS: { label: string; hint: string; value: string }[] = [
  { label: "Consultas", hint: "desde ago/2025", value: "12" },
  { label: "Aderência", hint: "últimos 6 meses", value: "86%" },
  { label: "EVA dor", hint: "basal → M3", value: "8 → 5" },
  { label: "PSQI sono", hint: "basal → M3", value: "14 → 9" },
];

const SUMMARY_PARAGRAPH =
  "Marina mantém dor lombar crônica refratária, hoje em §M3§ do episódio com CBD. " +
  "Desde a última consulta houve melhora da dor (EVA 6 → 5) e do sono (PSQI 11 → 9), " +
  "com desmame parcial de tramadol. Relata sonolência diurna leve a investigar.";

const PRE_STATES = ["Respondida", "Pendente", "Não enviada", "1ª consulta"];

const ALERTS: { tone: "hard" | "mid"; label: string; text: string }[] = [
  {
    tone: "hard",
    label: "Crítico",
    text: "Possível interação entre CBD e múltiplos depressores do SNC (Lexotan, Crestor, propranolol). Monitorar sedação excessiva.",
  },
  {
    tone: "mid",
    label: "Atenção",
    text: "Fluvoxamina 75mg (1,5 comprimido) foi recentemente aumentada e causou efeito adverso. Considerar redução antes de iniciar CBD.",
  },
  {
    tone: "mid",
    label: "Atenção",
    text: "Escala PSQI vencida para reaplicação neste timepoint — reaplicar antes do retorno.",
  },
];

// ── Motivo
const MOTIVE_CARDS: [string, string][] = [
  ["Início e curso", "Há 14 meses · progressiva"],
  ["Intensidade", "EVA 5/10 · pior à noite"],
  ["Impacto", "Sono fragmentado · afastamento parcial"],
  ["Objetivo", "Reduzir opioides · recuperar função"],
];

// ── Linha do tempo (episódio terapêutico). `year` para o filtro.
const TIMELINE: {
  date: string;
  year: string;
  tag?: string;
  meds?: string;
  icon: string;
  text: string;
}[] = [
  { date: "25/06/2026", year: "2026", tag: "Hoje", icon: "bx-target-lock", text: "Avaliação terapêutica em andamento — revisar evolução, resposta clínica e ajustes." },
  { date: "19/06/2026", year: "2026", tag: "M3", icon: "bx-pulse", text: "Sonolência diurna leve relatada (CTCAE Grau 1)." },
  { date: "04/03/2026", year: "2026", tag: "M1", meds: "CBD 200mg/mL", icon: "bx-capsule", text: "Início de CBD; desmame gradual de tramadol." },
  { date: "02/03/2026", year: "2026", icon: "bx-test-tube", text: "Hemograma e perfil hepático normais — base para monitorar CBD." },
  { date: "10/01/2026", year: "2026", meds: "Amitriptilina 25mg", icon: "bx-capsule", text: "Ajuste de amitriptilina por sono fragmentado." },
  { date: "12/12/2025", year: "2025", icon: "bx-scan", text: "Ressonância lombar · alterações degenerativas L4–L5." },
  { date: "28/08/2025", year: "2025", tag: "Basal", icon: "bx-detail", text: "Reavaliação · encaminhamento e solicitação de exames." },
  { date: "05/05/2025", year: "2025", meds: "Tramadol 50mg", icon: "bx-capsule", text: "Tramadol para controle da dor refratária." },
  { date: "18/09/2024", year: "2024", icon: "bx-body", text: "Fisioterapia + AINEs; resposta parcial e transitória." },
  { date: "22/05/2024", year: "2024", icon: "bx-scan", text: "Raio-X lombar · redução do espaço discal L4–L5." },
  { date: "10/03/2024", year: "2024", icon: "bx-detail", text: "1ª avaliação · dor lombar mecânica; orientação conservadora." },
];

const TIMELINE_YEARS = ["Tudo", "2026", "2025", "2024"] as const;

// ── Escalas (PRO). Valores por timepoint; basal usado para o delta.
const TIMEPOINTS = ["Basal", "Mês 1", "Mês 3", "Mês 6"] as const;
type Timepoint = (typeof TIMEPOINTS)[number];

const SCALES: {
  code: string;
  domain: string;
  label: string;
  max: number;
  better: "down";
  mcid: number;
  values: Record<Timepoint, number | null>;
}[] = [
  { code: "EVA", domain: "Dor", label: "Intensidade da dor", max: 10, better: "down", mcid: 2, values: { Basal: 8, "Mês 1": 6, "Mês 3": 5, "Mês 6": null } },
  { code: "PSQI", domain: "Sono", label: "Qualidade do sono", max: 21, better: "down", mcid: 3, values: { Basal: 14, "Mês 1": 11, "Mês 3": 9, "Mês 6": null } },
  { code: "BPI", domain: "Função", label: "Interferência na dor", max: 10, better: "down", mcid: 2, values: { Basal: 7, "Mês 1": 5, "Mês 3": 4, "Mês 6": null } },
  { code: "HAD-A", domain: "Ansiedade", label: "Ansiedade", max: 21, better: "down", mcid: 3, values: { Basal: 11, "Mês 1": 9, "Mês 3": 7, "Mês 6": null } },
];

// ── Comorbidades (CID-10 validadas)
const COMORBIDITIES: { cid: string; name: string; since: string; status: "Ativa" | "Em controle" }[] = [
  { cid: "M54.5", name: "Dor lombar baixa (crônica)", since: "há 14m", status: "Ativa" },
  { cid: "M79.7", name: "Fibromialgia", since: "há 2a", status: "Ativa" },
  { cid: "F41.1", name: "Transtorno de ansiedade generalizada", since: "há 3a", status: "Ativa" },
  { cid: "G47.0", name: "Insônia", since: "há 1a", status: "Em controle" },
];

// ── Medicações
const MEDS_ACTIVE: { name: string; note: string }[] = [
  { name: "CBD 200mg/mL", note: "0,5 mL 2×/dia · há 3 meses" },
  { name: "Tramadol 50mg", note: "2× ao dia · em desmame" },
  { name: "Amitriptilina 25mg", note: "à noite · há 3 meses" },
  { name: "Pregabalina 75mg", note: "2× ao dia · há 2 meses" },
  { name: "Vitamina D 7.000UI", note: "semanal · há 1 ano" },
  { name: "Melatonina 3mg", note: "à noite · se necessário" },
];

const MEDS_SUSPENDED: { name: string; note: string }[] = [
  { name: "Ciclobenzaprina 5mg", note: "suspensa · sonolência diurna" },
  { name: "Ibuprofeno 600mg", note: "suspenso · uso esporádico anterior" },
];

// ── Exames (agrupados)
const EXAMS: { group: string; icon: string; items: { name: string; date: string; finding: string }[] }[] = [
  {
    group: "Laboratoriais",
    icon: "bx-test-tube",
    items: [
      { name: "Hemograma", date: "02/03/2026", finding: "Sem alterações significativas." },
      { name: "Perfil hepático", date: "02/03/2026", finding: "TGO/TGP normais — base para monitorar CBD." },
      { name: "Função renal", date: "02/03/2026", finding: "Ureia e creatinina dentro da normalidade." },
      { name: "Vitamina D · TSH", date: "15/02/2026", finding: "Vit. D insuficiente (24 ng/mL); TSH normal." },
    ],
  },
  {
    group: "Imagem",
    icon: "bx-scan",
    items: [
      { name: "Ressonância lombar", date: "12/12/2025", finding: "Discopatia degenerativa L4–L5; sem compressão radicular." },
      { name: "Raio-X lombar", date: "22/05/2024", finding: "Redução do espaço discal L4–L5; sem espondilolistese." },
    ],
  },
  {
    group: "Funcional",
    icon: "bx-pulse",
    items: [
      { name: "Eletroneuromiografia MMII", date: "20/01/2026", finding: "Sem sinais de radiculopatia ativa." },
    ],
  },
];

// ── Documentos
const DOCS: { name: string; status: "Enviado" | "Pendente"; date: string }[] = [
  { name: "Receita de controle especial · CBD", status: "Enviado", date: "18/06/2026" },
  { name: "Atestado · 2 dias", status: "Enviado", date: "18/06/2026" },
  { name: "Solicitação de exames · perfil hepático", status: "Pendente", date: "10/01/2026" },
  { name: "Termo de consentimento · CBD", status: "Enviado", date: "04/03/2026" },
  { name: "Relatório médico · evolução do quadro", status: "Pendente", date: "12/12/2025" },
  { name: "Encaminhamento · Reumatologia", status: "Enviado", date: "28/08/2025" },
  { name: "Receita anterior · tramadol", status: "Enviado", date: "05/05/2025" },
];

// ── Atendimentos
const ENCOUNTERS: { who: string; kind: string; date: string; tags: string[] }[] = [
  { who: "Dra. Helena Prado", kind: "Retorno · M3 · Concluído", date: "19/06/2026", tags: ["Prescrição", "Atestado", "Laudo"] },
  { who: "Dra. Helena Prado", kind: "Retorno · M1 · Concluído", date: "04/03/2026", tags: ["Prescrição", "Laudo"] },
  { who: "Dra. Bárbara Lemes · Reumato", kind: "Interconsulta · Concluído", date: "12/12/2025", tags: ["Laudo"] },
  { who: "Dra. Helena Prado", kind: "Avaliação inicial · Concluído", date: "28/08/2025", tags: ["Solicitação"] },
];

const PRE_CONSULTS: { date: string; channel: string; stars: number }[] = [
  { date: "17/06/2026", channel: "WhatsApp · 9 respostas", stars: 2 },
  { date: "01/03/2026", channel: "WhatsApp · 8 respostas", stars: 1 },
  { date: "08/01/2026", channel: "WhatsApp · 8 respostas", stars: 1 },
  { date: "10/12/2025", channel: "WhatsApp · 7 respostas", stars: 0 },
  { date: "26/08/2025", channel: "Web · 1ª pré-anamnese", stars: 0 },
];

// ── Notas (equipe)
const TEAM_NOTES: { who: string; date: string; text: string }[] = [
  { who: "Dra. Bárbara · Reumatologia", date: "12/12/2025", text: "Fibromialgia associada; sugiro abordagem multimodal." },
  { who: "Fisioterapia", date: "20/02/2026", text: "Ganho de mobilidade lombar; manter programa." },
];

/* ============================ ÁTOMOS ============================ */

// Pílula de dado (12px mono). Pesos de cinza — nunca cor. `dim` esmaece (45%).
function Tag({
  children,
  variant = "soft",
  dim = false,
  upper = false,
  className,
}: {
  children: ReactNode;
  variant?: "soft" | "neutral" | "mid" | "hard";
  dim?: boolean;
  upper?: boolean;
  className?: string;
}) {
  const V = {
    soft: "bg-paper border-neutral-200 text-state-soft",
    neutral: "bg-paper border-neutral-200 text-neutral-600",
    mid: "bg-neutral-100 border-neutral-300 text-state-mid",
    hard: "bg-neutral-200 border-neutral-400 text-state-hard",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-[9px] py-[3px] font-mono text-micro leading-none whitespace-nowrap",
        V[variant],
        upper && "uppercase tracking-[0.08em]",
        dim && "opacity-45",
        className,
      )}
    >
      {children}
    </span>
  );
}

// Card sólido (#f9f9f9 + sombra). Base de todas as seções do Paciente 360.
function SolidCard({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("card-solid", className)}>{children}</section>;
}

// Linha rótulo → valor (contato / dados pessoais). Divisória sutil entre itens.
function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 pt-[8px] pb-[9px]",
        !last && "border-b border-white/40",
      )}
    >
      <span className="shrink-0 text-caption text-neutral-500">{label}</span>
      <span className="truncate text-right text-caption text-neutral-700">{value}</span>
    </div>
  );
}

/* ===================== ESQUERDA — SIDEBAR ===================== */

// Seção colapsável da sidebar. Anima a altura via grid-template-rows 1fr↔0fr
// (CSS puro, sem transform → preserva qualquer backdrop atrás). Default fechada.
function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SolidCard className="rounded-[20px] px-[17px] py-[13px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-9 w-full items-center justify-between gap-3 pl-1 text-left"
      >
        <span className="font-medium text-body text-ink">{title}</span>
        <i
          className={cn(
            "bx bx-chevron-down shrink-0 text-2xl text-neutral-500 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </SolidCard>
  );
}

export function PreReviewLeft() {
  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      {/* Identidade + contato — sempre visível. */}
      <SolidCard className="flex flex-col gap-4 rounded-[24px] p-[17px]">
        <div className="flex items-center gap-3">
          <BackButton />
          <Avatar name={PATIENT.name} seed={PATIENT.seed} size="md" className="h-12 w-12" />
          <div className="flex min-w-0 flex-col gap-2">
            <span className="font-display text-[20px] font-medium leading-tight text-ink">
              {PATIENT.name}
            </span>
            <div className="flex flex-wrap gap-2.5">
              <Tag variant="neutral">{PATIENT.age}</Tag>
              <Tag variant="soft">{PATIENT.cid}</Tag>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200/40 pt-[13px]">
          {CONTACT.map(([label, value], i) => (
            <InfoRow key={label} label={label} value={value} last={i === CONTACT.length - 1} />
          ))}
        </div>
      </SolidCard>

      {/* Accordions — fechados por padrão. */}
      <AccordionSection title="Condições">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Tag key={c} variant="neutral" upper>
              {c}
            </Tag>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Dados pessoais">
        <div className="flex flex-col">
          {PERSONAL.map(([label, value], i) => (
            <InfoRow key={label} label={label} value={value} last={i === PERSONAL.length - 1} />
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Indicadores">
        <div className="flex flex-col">
          {INDICATORS.map((it, i) => (
            <div
              key={it.label}
              className={cn(
                "flex items-center justify-between gap-3 pt-[8px] pb-[9px]",
                i !== INDICATORS.length - 1 && "border-b border-white/40",
              )}
            >
              <div className="flex flex-col gap-1">
                <span className="text-caption text-neutral-700">{it.label}</span>
                <span className="text-micro text-neutral-500">{it.hint}</span>
              </div>
              <span className="font-mono text-caption text-neutral-700">{it.value}</span>
            </div>
          ))}
        </div>
      </AccordionSection>
    </div>
  );
}

/* ===================== CENTRO — TOPO + ABAS ===================== */

// Resumo do status atual — header + ações + parágrafo + linha pré-anamnese.
function SummarySection() {
  const goTo = useFlow((s) => s.goTo);
  const [intro, m3, rest] = SUMMARY_PARAGRAPH.split("§");

  return (
    <SolidCard className="flex flex-col gap-2 rounded-[20px] px-[17px] py-[13px]">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <h2 className="font-display text-[20px] font-medium text-ink">Resumo do status atual</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 font-mono text-caption text-ink transition-colors hover:bg-white/50"
          >
            <i className="bx bx-send text-lg" />
            Enviar mensagem
          </button>
          <WireButton variant="primary" onClick={() => goTo("consult")} className="gap-2">
            <i className="bx bx-video text-lg" />
            Iniciar consulta
          </WireButton>
          <button
            type="button"
            aria-label="Mais ações"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/50 hover:text-ink"
          >
            <i className="bx bx-dots-vertical-rounded text-xl" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="py-3 text-caption leading-relaxed text-neutral-700 text-pretty">
          {intro}
          <strong className="font-medium text-ink">{m3}</strong>
          {rest}
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/40 pt-3 pb-1">
          <Eyebrow>Pré-anamnese</Eyebrow>
          <div className="flex flex-wrap items-center gap-1">
            {PRE_STATES.map((s, i) => (
              <Tag key={s} variant={i === 0 ? "mid" : "soft"} dim={i !== 0}>
                {s}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </SolidCard>
  );
}

// Alertas pré-consulta — carrossel horizontal (snap) + dots de paginação.
function AlertsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 12 : el.clientWidth;
    setIndex(Math.round(el.scrollLeft / step));
  };

  const goToCard = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <SolidCard className="flex flex-col gap-2 rounded-[20px] p-[13px]">
      <div className="flex min-h-9 items-center justify-between gap-3 pl-1 pr-2">
        <h3 className="font-display text-body-l font-medium text-ink">Alertas pré-consulta</h3>
        <div className="flex items-center gap-1.5">
          {ALERTS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Alerta ${i + 1}`}
              onClick={() => goToCard(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                i === index ? "w-5 bg-neutral-500" : "w-2 bg-neutral-300 hover:bg-neutral-400",
              )}
            />
          ))}
        </div>
      </div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
      >
        {ALERTS.map((a, i) => (
          <div
            key={i}
            className="glass-frost-inner flex w-[315px] shrink-0 snap-start flex-col gap-1.5 rounded-2xl p-[13px]"
          >
            <Tag variant={a.tone}>{a.label}</Tag>
            <p className="line-clamp-2 text-caption text-neutral-700 text-pretty">{a.text}</p>
          </div>
        ))}
      </div>
    </SolidCard>
  );
}

const TABS: { key: string; label: string; icon: string }[] = [
  { key: "motivo", label: "Motivo", icon: "bx-detail" },
  { key: "timeline", label: "Linha do tempo", icon: "bx-history" },
  { key: "escalas", label: "Escalas", icon: "bx-line-chart" },
  { key: "comorbidades", label: "Comorbidades", icon: "bx-plus-medical" },
  { key: "medicacoes", label: "Medicações", icon: "bx-capsule" },
  { key: "exames", label: "Exames", icon: "bx-test-tube" },
  { key: "documentos", label: "Documentos", icon: "bx-file" },
  { key: "atendimentos", label: "Atendimentos", icon: "bx-calendar-check" },
  { key: "notas", label: "Notas", icon: "bx-group" },
];

export function PreReviewCenter() {
  const [tab, setTab] = useState(TABS[0].key);

  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      <SummarySection />
      <AlertsSection />

      <SolidCard className="flex flex-col gap-4 rounded-[28px] p-[25px]">
        <ScrollTabs options={TABS} value={tab} onChange={setTab} />
        <div className="border-t border-neutral-200/40 pt-5">
          <TabContent tab={tab} />
        </div>
      </SolidCard>
    </div>
  );
}

/* ===================== CONTEÚDO DAS ABAS ===================== */

function TabContent({ tab }: { tab: string }) {
  switch (tab) {
    case "motivo":
      return <MotivoTab />;
    case "timeline":
      return <TimelineTab />;
    case "escalas":
      return <EscalasTab />;
    case "comorbidades":
      return <ComorbidadesTab />;
    case "medicacoes":
      return <MedicacoesTab />;
    case "exames":
      return <ExamesTab />;
    case "documentos":
      return <DocumentosTab />;
    case "atendimentos":
      return <AtendimentosTab />;
    case "notas":
      return <NotasTab />;
    default:
      return null;
  }
}

// Cabeçalho de aba: subtítulo (esquerda) + controle/extra (direita).
function TabHeader({ children, aside }: { children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {children ? (
        <p className="text-caption text-neutral-500 text-pretty">{children}</p>
      ) : (
        <span aria-hidden />
      )}
      {aside}
    </div>
  );
}

// Filtro de pílulas (timepoint / ano). Pílula ativa = papel + sombra.
function PillFilter<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="no-scrollbar -m-1 flex items-center gap-1 overflow-x-auto p-1">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={active}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 font-mono text-micro transition-colors duration-[180ms]",
              active
                ? "bg-paper text-ink shadow-[var(--shadow-tab)]"
                : "text-neutral-500 hover:bg-white/40 hover:text-neutral-700",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function MotivoTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Card do episódio. */}
      <div className="glass-frost-inner flex items-center gap-2.5 rounded-2xl px-3.5 py-3">
        <span className="glass-frost-inner grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-600">
          <i className="bx bx-capsule text-lg" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-body font-medium text-ink">Episódio CBD · M54.5</span>
          <span className="font-mono text-micro tracking-[0.04em] text-neutral-500">
            Dor lombar crônica
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tag variant="mid">Sucesso parcial</Tag>
          <Tag variant="soft">Baseline: naïve</Tag>
        </div>
      </div>

      <p className="py-1 text-body leading-relaxed text-neutral-700 text-pretty">
        Dor lombar refratária há 14 meses, com irradiação para o membro inferior direito.
        Interfere no sono e no trabalho; a paciente busca reduzir o uso de opioides e recuperar a
        funcionalidade no dia a dia. Relata episódios de dor aguda que surgem sem aviso prévio,
        dificultando suas atividades. Está interessada em explorar alternativas como fisioterapia
        e terapias complementares.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {MOTIVE_CARDS.map(([label, value]) => (
          <div key={label} className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3.5 py-2.5">
            <Eyebrow>{label}</Eyebrow>
            <span className="text-caption text-neutral-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineTab() {
  const [year, setYear] = useState<(typeof TIMELINE_YEARS)[number]>("Tudo");

  const all = year === "Tudo" ? TIMELINE : TIMELINE.filter((e) => e.year === year);
  // "Tudo" abre recolhido (5 primeiros + afford. de expandir, estática/mock).
  const visible = year === "Tudo" ? all.slice(0, 5) : all;
  const hiddenCount = all.length - visible.length;

  return (
    <div className="flex flex-col gap-4">
      <TabHeader aside={<PillFilter options={TIMELINE_YEARS} value={year} onChange={setYear} />}>
        Histórico clínico
      </TabHeader>

      {/* Cabeçalho do episódio. */}
      <div className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5">
        <span className="text-caption font-medium text-ink">
          Episódio · CBD 200mg/mL · Dor lombar crônica
        </span>
        <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
          início ago/2025
        </span>
      </div>

      <Eyebrow icon="bx-git-commit">
        {TIMELINE.length} eventos · evolução farmacológica
      </Eyebrow>

      <ul className="flex flex-col">
        {visible.map((e) => (
          <li
            key={e.date}
            className="flex gap-3 border-b border-dashed border-white/50 py-3 first:pt-0 last:border-0"
          >
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/50 text-neutral-500">
              <i className={cn("bx text-base", e.icon)} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-caption text-neutral-600">{e.date}</span>
                {e.tag ? <Tag variant={e.tag === "Hoje" ? "mid" : "soft"}>{e.tag}</Tag> : null}
                {e.meds ? (
                  <span className="font-mono text-micro text-neutral-400">· {e.meds}</span>
                ) : null}
              </div>
              <span className="text-caption text-neutral-700 text-pretty">{e.text}</span>
            </div>
          </li>
        ))}
      </ul>

      {year === "Tudo" && hiddenCount > 0 ? (
        <button
          type="button"
          className="self-start font-mono text-micro uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:text-ink"
        >
          + Expandir · {hiddenCount} intervenções anteriores
        </button>
      ) : null}
    </div>
  );
}

function EscalasTab() {
  const [tp, setTp] = useState<Timepoint>("Mês 3");

  return (
    <div className="flex flex-col gap-4">
      <TabHeader aside={<PillFilter options={TIMEPOINTS} value={tp} onChange={setTp} />}>
        Desfechos relatados (PRO) por timepoint
      </TabHeader>

      <div className="grid grid-cols-2 gap-3">
        {SCALES.map((sc) => {
          const v = sc.values[tp];
          const basal = sc.values["Basal"] ?? 0;
          const delta = v == null ? null : basal - v; // melhora = redução
          const mcid = delta != null && delta >= sc.mcid;
          return (
            <div
              key={sc.code}
              className="glass-frost-inner flex flex-col gap-3 rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <Eyebrow>{sc.domain} · PRO</Eyebrow>
                <span className="font-mono text-micro text-neutral-400">{tp}</span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="text-body font-medium text-ink">{sc.code}</span>
                  <span className="truncate text-caption text-neutral-500">{sc.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-display-m leading-none tabular-nums text-ink">
                    {v ?? "—"}
                  </span>
                  <span className="font-mono text-micro text-neutral-400">/{sc.max}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-white/50 pt-2.5">
                <span className="font-mono text-micro text-neutral-500">
                  {delta != null && delta > 0 ? `↓${delta}` : "—"} · basal {basal}
                </span>
                {mcid ? (
                  <span className="font-mono text-micro uppercase tracking-[0.08em] text-state-mid">
                    MCID atingido
                  </span>
                ) : (
                  <button
                    type="button"
                    className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:text-ink"
                  >
                    Validar escala
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComorbidadesTab() {
  return (
    <div className="flex flex-col gap-4">
      <Eyebrow>{COMORBIDITIES.length} validadas</Eyebrow>
      <ul className="flex flex-col">
        {COMORBIDITIES.map((c) => (
          <li
            key={c.cid}
            className="flex items-center gap-3 border-b border-dashed border-white/50 py-3 first:pt-0 last:border-0"
          >
            <span className="w-14 shrink-0 font-mono text-caption font-medium text-ink">{c.cid}</span>
            <span className="min-w-0 flex-1 truncate text-caption text-neutral-700">{c.name}</span>
            <span className="shrink-0 font-mono text-micro text-neutral-400">{c.since}</span>
            <Tag variant={c.status === "Ativa" ? "mid" : "soft"}>{c.status}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MedRow({ name, note, dim }: { name: string; note: string; dim?: boolean }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 border-b border-dashed border-white/50 py-2.5 first:pt-0 last:border-0",
        dim && "opacity-55",
      )}
    >
      <i className="bx bx-capsule shrink-0 text-lg text-neutral-400" />
      <span className="min-w-0 flex-1 truncate text-caption text-ink">{name}</span>
      <span className="shrink-0 font-mono text-micro text-neutral-500">{note}</span>
    </li>
  );
}

function MedicacoesTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Eyebrow>{MEDS_ACTIVE.length} em uso</Eyebrow>
        <ul className="flex flex-col">
          {MEDS_ACTIVE.map((m) => (
            <MedRow key={m.name} name={m.name} note={m.note} />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <Eyebrow>Suspensas</Eyebrow>
        <ul className="flex flex-col">
          {MEDS_SUSPENDED.map((m) => (
            <MedRow key={m.name} name={m.name} note={m.note} dim />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExamesTab() {
  return (
    <div className="flex flex-col gap-5">
      {EXAMS.map((group) => (
        <div key={group.group} className="flex flex-col gap-2">
          <Eyebrow icon={group.icon}>{group.group}</Eyebrow>
          <ul className="flex flex-col">
            {group.items.map((ex) => (
              <li
                key={ex.name}
                className="flex flex-col gap-1 border-b border-dashed border-white/50 py-3 first:pt-0 last:border-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-caption font-medium text-ink">{ex.name}</span>
                  <span className="shrink-0 font-mono text-micro text-neutral-500">{ex.date}</span>
                </div>
                <span className="text-caption text-neutral-600 text-pretty">{ex.finding}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DocumentosTab() {
  return (
    <ul className="flex flex-col gap-2">
      {DOCS.map((d) => (
        <li
          key={d.name}
          className="glass-frost-inner flex items-center gap-3 rounded-2xl px-3.5 py-2.5"
        >
          <i className="bx bx-file shrink-0 text-lg text-neutral-500" />
          <span className="min-w-0 flex-1 truncate text-caption text-neutral-700">{d.name}</span>
          <Tag variant={d.status === "Enviado" ? "soft" : "mid"}>{d.status}</Tag>
          <span className="shrink-0 font-mono text-micro text-neutral-400">{d.date}</span>
        </li>
      ))}
    </ul>
  );
}

function AtendimentosTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Eyebrow>{ENCOUNTERS.length} consultas</Eyebrow>
        <ul className="flex flex-col gap-2">
          {ENCOUNTERS.map((e) => (
            <li key={e.date} className="glass-frost-inner flex flex-col gap-2 rounded-2xl px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-caption font-medium text-ink">{e.who}</span>
                <span className="shrink-0 font-mono text-micro text-neutral-400">{e.date}</span>
              </div>
              <span className="text-caption text-neutral-600">{e.kind}</span>
              <div className="flex flex-wrap gap-1.5">
                {e.tags.map((t) => (
                  <Tag key={t} variant="soft">
                    {t}
                  </Tag>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow>Pré-consultas respondidas</Eyebrow>
        <ul className="flex flex-col">
          {PRE_CONSULTS.map((p) => (
            <li
              key={p.date}
              className="flex items-center gap-3 border-b border-dashed border-white/50 py-2.5 first:pt-0 last:border-0"
            >
              <span className="font-mono text-caption text-neutral-600">{p.date}</span>
              <Tag variant="soft">Respondido</Tag>
              <span className="ml-auto truncate text-micro text-neutral-500">{p.channel}</span>
              {p.stars > 0 ? (
                <span className="shrink-0 font-mono text-micro text-neutral-400">
                  {"★".repeat(p.stars)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NotasTab() {
  return (
    <ul className="flex flex-col gap-3">
      {TEAM_NOTES.map((n) => (
        <li key={n.who} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-caption font-medium text-ink">{n.who}</span>
            <span className="shrink-0 font-mono text-micro text-neutral-500">{n.date}</span>
          </div>
          <p className="text-caption text-neutral-700 text-pretty">{n.text}</p>
        </li>
      ))}
    </ul>
  );
}
