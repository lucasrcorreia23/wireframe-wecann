"use client";

import { Fragment, useState, type ReactNode } from "react";
import { WireButton, Avatar, Eyebrow, AppScreen, Chip, AccordionRow, Icon, InfoTip } from "@/components/ui";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";
import { GenerateDocumentModal } from "./GenerateDocumentModal";

// `pre-review` — Paciente 360 · Perfil. Redesign conforme Figma (4952:10611):
// COLUNA ÚNICA centralizada (AppScreen) — header do paciente · faixa-resumo de 4
// colunas · "Resumo do status atual" · "Alertas pré-consulta" · lista em SANFONA
// (AccordionRow). Monocromático; o acento crítico aparece só no chip "Crítico" do
// alerta. Conteúdo clínico (linha do tempo, escalas, medicações, exames…)
// preservado dentro de cada seção da sanfona.

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

const PERSONAL: [string, string][] = [
  ["Nascimento", "14/05/1987"],
  ["Sexo", "Feminino"],
  ["Profissão", "Arquiteta"],
  ["Estado civil", "Casada"],
  ["Cidade", "São Paulo · SP"],
  ["Endereço", "R. das Acácias, 210 · Pinheiros"],
];

const SUMMARY_PARAGRAPH =
  "Marina mantém dor lombar crônica refratária, hoje em §M3§ do episódio com CBD. " +
  "Desde a última consulta houve melhora da dor (EVA 6 → 5) e do sono (PSQI 11 → 9), " +
  "com desmame parcial de tramadol. Relata sonolência diurna leve a investigar.";

const ALERTS: { tone: "critical" | "inset"; label: string; text: string }[] = [
  {
    tone: "critical",
    label: "Crítico",
    text: "Possível interação entre CBD e múltiplos depressores do SNC (Lexotan, Crestor, propranolol). Monitorar sedação excessiva.",
  },
  {
    tone: "inset",
    label: "Atenção",
    text: "Fluvoxamina 75mg (1,5 comprimido) foi recentemente aumentada e causou efeito adverso. Considerar redução antes de iniciar CBD.",
  },
  {
    tone: "inset",
    label: "Atenção",
    text: "M3 fechando sem PHQ-9 — escala primária esperada neste timepoint. Aplicar agora?",
  },
  {
    tone: "inset",
    label: "Atenção",
    text: "Aderência ao CBD em 86% — reforçar adesão e técnica de administração no retorno.",
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
  /** Marco do episódio (Basal → M1 → M3 → Hoje) — aparece no trilho horizontal. */
  milestone?: boolean;
}[] = [
  { date: "25/06/2026", year: "2026", tag: "Hoje", icon: "bx-target-lock", milestone: true, text: "Avaliação terapêutica em andamento — revisar evolução, resposta clínica e ajustes." },
  { date: "19/06/2026", year: "2026", tag: "M3", icon: "bx-pulse", milestone: true, text: "Sonolência diurna leve relatada (CTCAE Grau 1)." },
  { date: "04/03/2026", year: "2026", tag: "M1", meds: "CBD 200mg/mL", icon: "bx-capsule", milestone: true, text: "Início de CBD; desmame gradual de tramadol." },
  { date: "02/03/2026", year: "2026", icon: "bx-test-tube", text: "Hemograma e perfil hepático normais — base para monitorar CBD." },
  { date: "10/01/2026", year: "2026", meds: "Amitriptilina 25mg", icon: "bx-capsule", text: "Ajuste de amitriptilina por sono fragmentado." },
  { date: "12/12/2025", year: "2025", icon: "bx-scan", text: "Ressonância lombar · alterações degenerativas L4–L5." },
  { date: "28/08/2025", year: "2025", tag: "Basal", icon: "bx-detail", milestone: true, text: "Reavaliação · encaminhamento e solicitação de exames." },
  { date: "05/05/2025", year: "2025", meds: "Tramadol 50mg", icon: "bx-capsule", text: "Tramadol para controle da dor refratária." },
  { date: "18/09/2024", year: "2024", icon: "bx-body", text: "Fisioterapia + AINEs; resposta parcial e transitória." },
  { date: "22/05/2024", year: "2024", icon: "bx-scan", text: "Raio-X lombar · redução do espaço discal L4–L5." },
  { date: "10/03/2024", year: "2024", icon: "bx-detail", text: "1ª avaliação · dor lombar mecânica; orientação conservadora." },
];

const TIMELINE_YEARS = ["Tudo", "2026", "2025", "2024"] as const;

// Marcos do episódio (Basal → M1 → M3 → Hoje), do mais antigo ao mais recente,
// para o trilho horizontal. `filter` devolve cópia; `reverse` não muta TIMELINE.
const TIMELINE_MILESTONES = TIMELINE.filter((e) => e.milestone).reverse();

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
// "28/08/2025" → "28/08/25" (ano em 2 dígitos p/ o trilho).
const shortDate = (d: string) => d.replace(/\/\d{2}(\d{2})$/, "/$1");
// "19/06/2026" → "Jun 2026".
const monthYear = (d: string) => {
  const [, m, y] = d.split("/");
  const mo = MONTHS_PT[Number(m) - 1] ?? "";
  return `${mo.charAt(0).toUpperCase()}${mo.slice(1)} ${y}`;
};
// Subtítulo do handle = fase clínica atual (marco "M#" mais recente) + mês/ano.
const CURRENT_PHASE = TIMELINE.find((e) => e.milestone && /^M\d/.test(e.tag ?? ""));
const TIMELINE_SUBTITLE = CURRENT_PHASE
  ? `${CURRENT_PHASE.tag} · ${monthYear(CURRENT_PHASE.date)}`
  : undefined;

// ── Régua de acompanhamento (jornada TCLE → Pré-consulta → Basal → M1…M12).
// Prospectiva: cada passo tem estado. Os `gate`s (TCLE/Pré-consulta) são
// pré-requisitos; "Basal" é a 1ª consulta (M0). A janela do timepoint, o gate de
// enzimas e a pendência de escala são sinais derivados (mock) exibidos como status.
type StepState = "done" | "current" | "pending" | "overdue";
type ProtocolStep = {
  key: string;
  label: string;
  sub?: string;
  icon: string;
  state: StepState;
  gate?: boolean;
};
const PROTOCOL: ProtocolStep[] = [
  { key: "tcle", label: "TCLE", sub: "assinado", icon: "shield", state: "done", gate: true },
  { key: "previa", label: "Pré-consulta", sub: "completa", icon: "clipboard", state: "done", gate: true },
  { key: "basal", label: "Basal", sub: "28/08/25", icon: "flag", state: "done" },
  { key: "m1", label: "M1", sub: "04/03/26", icon: "check", state: "done" },
  { key: "m3", label: "M3", sub: "hoje", icon: "target", state: "current" },
  { key: "m6", label: "M6", sub: "set/26", icon: "time", state: "pending" },
  { key: "m12", label: "M12", sub: "mar/27", icon: "time", state: "pending" },
];

// Baseline (exposição prévia ao produto) — atributo do episódio. Timepoint atual e
// janela de aplicação da escala. Sinal Athena = escala primária esperada e não aplicada.
const BASELINE = "Sem tratamento prévio"; // alternativa: "Em uso prévio"
const CURRENT_TP = "M3";
const PROTOCOL_WINDOW = "janela da escala termina em 4 dias";
const ENZYME_GATE = "Enzimas hepáticas · reavaliar (CBD ≥ 300 mg/dia · a cada 4 meses)";

// Eventos fora da agenda (efeito adverso, internação, cirurgia de urgência, gestação…).
const PROTOCOL_EVENTS: { date: string; label: string; detail: string }[] = [
  { date: "19/06/2026", label: "Efeito adverso", detail: "Sonolência diurna · CTCAE Grau 1 (entre M1 e M3)" },
];

// ── Bateria estruturada checada em cada timepoint (M1/M3/M6/M12).
type BatteryState = "done" | "pending" | "planned";
const BATTERY_ITEMS: { key: string; label: string }[] = [
  { key: "produto", label: "Uso do produto prescrito confirmado" },
  { key: "adesao", label: "Adesão ao tratamento" },
  { key: "eq5d", label: "EQ-5D-5L · qualidade de vida" },
  { key: "pgic", label: "PGIC · mudança global percebida" },
  { key: "primaria", label: "PHQ-9 · escala primária da condição" },
  { key: "ae", label: "Efeitos adversos" },
  { key: "secundarias", label: "Escalas secundárias (configuráveis em Modelos)" },
];
const BATTERY_STATE: Record<string, Record<string, { state: BatteryState; note?: string }>> = {
  m1: {
    produto: { state: "done" }, adesao: { state: "done", note: "92%" },
    eq5d: { state: "done" }, pgic: { state: "done" }, primaria: { state: "done" },
    ae: { state: "done", note: "sem eventos" }, secundarias: { state: "done", note: "EVA · PSQI" },
  },
  m3: {
    produto: { state: "done", note: "mesmo produto" }, adesao: { state: "done", note: "86%" },
    eq5d: { state: "done" }, pgic: { state: "done" }, primaria: { state: "pending", note: "não aplicada" },
    ae: { state: "done", note: "sonolência · G1" }, secundarias: { state: "done", note: "EVA · PSQI · BPI · HAD-A" },
  },
};
// M6/M12 ainda não ocorreram → todos os itens ficam "planned".
function batteryFor(stepKey: string) {
  const map = BATTERY_STATE[stepKey];
  return BATTERY_ITEMS.map((it) => ({ ...it, ...(map?.[it.key] ?? { state: "planned" as BatteryState }) }));
}
// Pílulas do filtro de timepoint no corpo expandido da régua.
const BATTERY_TPS = ["M1", "M3", "M6", "M12"] as const;

// ── Produto de cannabis em uso (identificação — campos obrigatórios do RWE).
const PRODUCT = {
  nome: "Canabidiol Full Spectrum 200",
  fabricante: "Prati-Donaduzzi",
  cbd: "200 mg/mL",
  thc: "< 0,2 mg/mL",
  ratio: "≈ 1000:1", // calculado (CBD:THC)
  quimiotipo: "Tipo III · predominante CBD",
  via: "Sublingual",
  d0: "50 mg CBD/dia",
  dt: "120 mg CBD/dia",
  dmedia: "95 mg CBD/dia",
  minoritarios: ["CBG", "CBN"],
  terpenos: ["Mirceno", "β-cariofileno", "Limoneno"],
  custo: "R$ 480 / mês",
  origem: "Importação · autorização Anvisa",
  inicio: "04/03/2026",
  outcome: "Intensidade da dor",
};

// Estilo do nó por estado — monocromático; o acento crítico só aparece no "overdue".
const STEP_NODE: Record<StepState, string> = {
  done: "bg-neutral-100 text-neutral-500",
  current: "bg-ink text-paper ring-2 ring-neutral-300 ring-offset-2 ring-offset-paper",
  pending: "border border-neutral-200 bg-paper text-neutral-400",
  overdue: "border border-critical/40 bg-paper text-critical",
};
const STEP_LABEL: Record<StepState, string> = {
  done: "text-neutral-600",
  current: "font-medium text-ink",
  pending: "text-neutral-400",
  overdue: "text-critical",
};

// ── Escalas (PRO). Valores por timepoint; basal usado para o delta.
const TIMEPOINTS = ["Basal", "Mês 1", "Mês 3", "Mês 6"] as const;
type Timepoint = (typeof TIMEPOINTS)[number];

const SCALES: {
  code: string;
  domain: string;
  label: string;
  info: string;
  max: number;
  better: "down";
  mcid: number;
  values: Record<Timepoint, number | null>;
}[] = [
  { code: "EVA", domain: "Dor", label: "Intensidade da dor", info: "Escala Visual Analógica: o paciente marca a intensidade da dor de 0 (sem dor) a 10 (pior dor imaginável).", max: 10, better: "down", mcid: 2, values: { Basal: 8, "Mês 1": 6, "Mês 3": 5, "Mês 6": null } },
  { code: "PSQI", domain: "Sono", label: "Qualidade do sono", info: "Índice de Qualidade do Sono de Pittsburgh: avalia a qualidade do sono no último mês (0–21). Quanto menor a pontuação, melhor o sono.", max: 21, better: "down", mcid: 3, values: { Basal: 14, "Mês 1": 11, "Mês 3": 9, "Mês 6": null } },
  { code: "BPI", domain: "Função", label: "Interferência na dor", info: "Inventário Breve de Dor (Brief Pain Inventory): mede o quanto a dor interfere nas atividades diárias, como sono, trabalho e humor (0–10).", max: 10, better: "down", mcid: 2, values: { Basal: 7, "Mês 1": 5, "Mês 3": 4, "Mês 6": null } },
  { code: "HAD-A", domain: "Ansiedade", label: "Ansiedade", info: "Subescala de ansiedade da Escala Hospitalar de Ansiedade e Depressão (HADS): rastreia sintomas de ansiedade (0–21).", max: 21, better: "down", mcid: 3, values: { Basal: 11, "Mês 1": 9, "Mês 3": 7, "Mês 6": null } },
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

// ── Documentos — lista inicial; vira estado no PreReviewCenter (o wizard
// "Gerar documento" injeta itens novos no topo).
type PatientDoc = { name: string; status: "Enviado" | "Pendente"; date: string };
const INITIAL_DOCS: PatientDoc[] = [
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

// "Soft chip" do resumo da sanfona — branco, cantos 16px e sombra suave (igual ao
// Figma). `label` é o prefixo cinza (ex.: "EVA"). `icon` = Material Symbols opc.
function SoftChip({
  label,
  icon,
  children,
}: {
  label?: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[16px] bg-paper px-3 py-2.5 text-body leading-none text-ink shadow-[0_4px_13.5px_rgba(0,0,0,0.05)]">
      {icon ? <Icon name={icon} size={18} className="text-neutral-500" /> : null}
      {label ? <span className="text-caption font-medium text-neutral-500">{label}</span> : null}
      {children}
    </span>
  );
}

// Linha rótulo → valor (contato / dados pessoais). Divisória sutil entre itens.
function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-[8px] pb-[9px]",
        !last && "border-b border-white/40",
      )}
    >
      <span className="shrink-0 text-caption text-neutral-500">{label}</span>
      <span className="flex-1 truncate text-right text-caption text-neutral-700">{value}</span>
    </div>
  );
}

/* ===================== HEADER DO PACIENTE ===================== */

function PatientHeader({
  onOpenDrawer,
  onGenerateDocument,
}: {
  onOpenDrawer: () => void;
  onGenerateDocument: () => void;
}) {
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        {/* Identidade. */}
        <Avatar name={PATIENT.name} seed={PATIENT.seed} size="md" className="h-12 w-12" />
        <div className="flex flex-1 flex-col gap-2">
          <Eyebrow>Paciente</Eyebrow>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => back()}
              aria-label="Voltar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[0.8px] border-neutral-300 bg-paper text-ink transition-colors hover:bg-neutral-100"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-display text-[20px] font-medium leading-tight text-ink">
                  {PATIENT.name}
                </span>
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  aria-label="Dados pessoais do paciente"
                  className="grid place-items-center text-neutral-500 transition-colors hover:text-ink"
                >
                  <Icon name="article_person" size={18} />
                </button>
              </div>
              <span className="text-caption text-neutral-600">Pré-consulta · revisão</span>
            </div>
          </div>
        </div>

        {/* Ações. */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-caption font-medium text-ink transition-colors hover:bg-neutral-100"
          >
            <Icon name="send" size={20} />
            Enviar mensagem
          </button>
          <button
            type="button"
            onClick={onGenerateDocument}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-caption font-medium text-ink transition-colors hover:bg-neutral-100"
          >
            <Icon name="description" size={20} />
            Gerar documento
          </button>
          <WireButton variant="primary" onClick={() => goTo("consult")} className="gap-2">
            <Icon name="video_camera_front" size={20} />
            Iniciar consulta
          </WireButton>
          <button
            type="button"
            aria-label="Mais ações"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            <Icon name="dots-vertical-rounded" size={20} />
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-200/70" />
    </div>
  );
}

// Drawer de PERFIL — dados pessoais sob demanda (fora do foco clínico da tela).
function PersonalDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideOverPanel open={open} onClose={onClose} label="Dados pessoais" className="max-w-[420px]">
      <div className="flex min-h-0 flex-col gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={PATIENT.name} seed={PATIENT.seed} size="md" className="h-12 w-12" />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-[20px] font-medium leading-tight text-ink">
              {PATIENT.name}
            </span>
            <div className="flex flex-wrap gap-2">
              <Chip tone="muted">{PATIENT.age}</Chip>
              <Chip>{PATIENT.cid}</Chip>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-1">
          <Eyebrow>Contato</Eyebrow>
          <div className="flex flex-col">
            {CONTACT.map(([label, value], i) => (
              <InfoRow key={label} label={label} value={value} last={i === CONTACT.length - 1} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-1">
          <Eyebrow>Dados pessoais</Eyebrow>
          <div className="flex flex-col">
            {PERSONAL.map(([label, value], i) => (
              <InfoRow key={label} label={label} value={value} last={i === PERSONAL.length - 1} />
            ))}
          </div>
        </section>
      </div>
    </SlideOverPanel>
  );
}

/* ===================== SEÇÕES DO CENTRO ===================== */

// Card Diagnóstico | Tratamento + faixa de Sintomas — conforme o Figma de
// referência: duas colunas de conteúdo clínico e a linha de escalas embaixo.
function DiagTreatCard() {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-[#f9f9f9] p-4">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Diagnóstico — episódio + condições (dot: ativa = crítico; controle = neutro). */}
        <div className="flex flex-col gap-2.5">
          <Eyebrow>Diagnóstico</Eyebrow>
          <div className="flex flex-col gap-2 rounded-[16px] bg-paper p-3.5 shadow-[var(--shadow-tab)]">
            <div className="flex items-baseline justify-between gap-3 pb-1">
              <span className="text-body font-medium text-ink">Episódio CBD · M54.5</span>
              <span className="text-caption text-neutral-500">Dor lombar crônica</span>
            </div>
            {COMORBIDITIES.map((c) => (
              <div key={c.cid} className="flex items-center gap-3 rounded-[12px] bg-[#f9f9f9] px-3 py-2.5">
                <span className="shrink-0 font-mono text-caption font-medium text-ink">{c.cid}</span>
                <span className="min-w-0 flex-1 truncate text-caption text-neutral-700">{c.name}</span>
                <span className="shrink-0 font-mono text-micro text-neutral-400">{c.since}</span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    c.status === "Ativa" ? "bg-critical/70" : "bg-neutral-300",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tratamento — destaque do episódio CBD + coadjuvantes + lista em uso. */}
        <div className="flex flex-col gap-2.5">
          <Eyebrow>Tratamento</Eyebrow>
          <div className="flex items-center gap-2 rounded-full bg-paper px-3.5 py-2.5 shadow-[var(--shadow-tab)]">
            <Icon name="capsule" size={16} className="text-neutral-600" />
            <span className="text-caption font-medium text-ink">Tratamento CBD</span>
            <span className="ml-auto font-mono text-micro text-neutral-500">CBD 200mg/mL</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Tramadol 50mg", "Amitriptilina 25mg"].map((m) => (
              <span
                key={m}
                className="rounded-full bg-paper px-3.5 py-2 text-caption text-ink shadow-[var(--shadow-tab)]"
              >
                {m}
              </span>
            ))}
          </div>
          <Eyebrow className="mt-1">{MEDS_ACTIVE.length} em uso</Eyebrow>
          <div className="flex flex-col gap-1.5">
            {MEDS_ACTIVE.slice(0, 4).map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2 rounded-[12px] bg-paper px-3 py-2 shadow-[var(--shadow-tab)]"
              >
                <Icon name="capsule" size={15} className="shrink-0 text-neutral-500" />
                <span className="min-w-0 flex-1 truncate text-caption text-ink">{m.name}</span>
                <span className="shrink-0 font-mono text-micro text-neutral-400">{m.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sintomas — escalas atuais (valor do timepoint vigente). */}
      <div className="flex flex-col gap-2.5">
        <Eyebrow>Sintomas</Eyebrow>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SCALES.map((s) => (
            <div
              key={s.code}
              className="flex items-center justify-between gap-2 rounded-[12px] bg-paper px-3.5 py-2.5 shadow-[var(--shadow-tab)]"
            >
              <span className="text-caption text-neutral-500">{s.code}</span>
              <span className="font-mono text-body font-medium text-ink">
                {s.values["Mês 3"]}/{s.max}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Resumo do status atual — título + contagem de alertas + parágrafo + linha
// pré-anamnese (check + estrelas), conforme o Figma de referência.
function SummarySection() {
  const [intro, m3, rest] = SUMMARY_PARAGRAPH.split("§");

  return (
    <section className="flex h-full flex-col gap-4 rounded-[20px] bg-[#f9f9f9] px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[20px] font-medium text-ink">Resumo do status atual</h2>
        <span className="shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">
          {ALERTS.length} alertas encontrados
        </span>
      </div>
      <p className="flex-1 text-caption leading-relaxed text-neutral-700 text-pretty">
        {intro}
        <strong className="font-medium text-ink">{m3}</strong>
        {rest}
      </p>
      <div className="flex items-center gap-2 border-t border-neutral-200/50 pt-3">
        <Icon name="check-circle" size={16} className="text-neutral-500" />
        <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
          Pré-anamnese
        </span>
        <span className="font-mono text-caption tracking-[0.14em] text-neutral-500">★★★★☆</span>
      </div>
    </section>
  );
}

// Alertas pré-consulta — coluna lateral do Resumo (conforme Figma): cartões
// empilhados, 2 por página, com dots clicáveis de paginação.
function AlertsSection() {
  const PER_PAGE = 2;
  const pages = Math.ceil(ALERTS.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const visible = ALERTS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-3 pl-1 pr-2">
        <h3 className="flex-1 font-display text-body-l font-medium text-ink">Alertas pré-consulta</h3>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Página ${i + 1} de alertas`}
              onClick={() => setPage(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-[180ms]",
                i === page ? "w-5 bg-neutral-500" : "w-2 bg-neutral-300 hover:bg-neutral-400",
              )}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {visible.map((a, i) => (
          <div
            key={`${page}-${i}`}
            className="flex flex-1 flex-col gap-2 rounded-[16px] border-[0.8px] border-white/60 bg-[#f9f9f9] p-3.5"
          >
            <Chip tone={a.tone} className="self-start">{a.label}</Chip>
            <p className="text-caption leading-snug text-neutral-700 text-pretty">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Trilho horizontal de marcos (Basal → M1 → M3 → Hoje) — usado no resumo FECHADO
// e como visão-geral no topo do ABERTO. Nó atual (último) preenchido em ink. Cada
// nó empilha ícone + fase + data. Puramente visual (fica dentro do botão da aba).
function TimelineRail({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-1 items-start", className)}>
      {TIMELINE_MILESTONES.map((e, i) => {
        const current = i === TIMELINE_MILESTONES.length - 1;
        return (
          <Fragment key={e.date}>
            {i > 0 ? (
              <span className="mt-[15px] h-px min-w-[16px] flex-1 bg-neutral-200" />
            ) : null}
            <div className="flex w-[64px] shrink-0 flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full shadow-[var(--shadow-tab)]",
                  current ? "bg-ink text-paper" : "bg-paper text-neutral-600",
                )}
              >
                <Icon name={e.icon} size={16} />
              </span>
              <span className="text-micro font-medium leading-none text-neutral-700">{e.tag}</span>
              <span className="font-mono text-micro leading-none text-neutral-400">{shortDate(e.date)}</span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

// Card da linha do tempo — barra branca no topo nas DUAS alturas. Fechado: título +
// trilho de marcos + chevron. Aberto: o trilho recolhe (fade + colapso) e o corpo
// (lista vertical) desdobra abaixo — grid-rows 0fr↔1fr (mesmo padrão do CollapsibleCard).
function TimelineCard({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-[20px] bg-[#f9f9f9]">
      {/* Header — sempre visível, full-width, clicável. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="relative z-[1] flex w-full items-center gap-4 rounded-[20px] bg-paper p-4 text-left shadow-[var(--shadow-tab)]"
      >
        <span className="flex shrink-0 items-center gap-2 text-ink">
          <Icon name="timeline" size={18} className="text-neutral-700" />
          <span className="flex flex-col">
            <span className="text-body font-medium leading-tight">Linha do tempo</span>
            {TIMELINE_SUBTITLE ? (
              <span className="mt-0.5 font-mono text-micro leading-tight text-neutral-500">
                {TIMELINE_SUBTITLE}
              </span>
            ) : null}
          </span>
        </span>

        {/* Trilho de marcos — recolhe ao abrir. */}
        <span
          aria-hidden={open}
          className={cn(
            "min-w-0 flex-1 overflow-hidden transition-all duration-[220ms] ease-out motion-reduce:transition-none",
            open ? "max-h-0 opacity-0" : "max-h-[64px] opacity-100",
          )}
        >
          <TimelineRail />
        </span>

        <Icon
          name="chevron-down"
          size={22}
          className={cn(
            "shrink-0 text-neutral-500 transition-transform duration-[180ms] motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Corpo — desdobra a lista vertical (o trilho não reaparece aqui). */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-[420ms] ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "px-4 pb-4 pt-3 transition-all duration-[240ms] ease-out motion-reduce:transition-none",
              open ? "translate-y-0 opacity-100 delay-[80ms]" : "-translate-y-1 opacity-0",
            )}
          >
            <TimelineDetail />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== RÉGUA DE ACOMPANHAMENTO ===================== */

// Trilho horizontal da régua (TCLE · Pré-consulta · Basal · M1…M12). Nó estilizado
// por estado; conector tracejado separa os gates (pré-requisitos) do episódio.
// Puramente visual — mesma métrica do TimelineRail (fica dentro do botão da aba).
function ProtocolRail({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-1 items-start", className)}>
      {PROTOCOL.map((s, i) => {
        const boundary = i > 0 && Boolean(PROTOCOL[i - 1].gate) && !s.gate;
        return (
          <Fragment key={s.key}>
            {i > 0 ? (
              <span
                className={cn(
                  "mt-[15px] h-px min-w-[16px] flex-1",
                  boundary ? "border-t border-dashed border-neutral-300 bg-transparent" : "bg-neutral-200",
                )}
              />
            ) : null}
            <div className="flex w-[64px] shrink-0 flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full shadow-[var(--shadow-tab)]",
                  STEP_NODE[s.state],
                )}
              >
                <Icon name={s.icon} size={16} />
              </span>
              <span className={cn("text-micro font-medium leading-none", STEP_LABEL[s.state])}>{s.label}</span>
              {s.sub ? (
                <span className="font-mono text-micro leading-none text-neutral-400">{s.sub}</span>
              ) : null}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

// Marcador de estado de um item da bateria (feito · pendente · programado).
function BatteryTick({ state }: { state: BatteryState }) {
  if (state === "done")
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-neutral-200 text-neutral-600">
        <Icon name="check" size={12} />
      </span>
    );
  if (state === "pending")
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-critical-weak text-critical">
        <Icon name="warning" size={12} />
      </span>
    );
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-300">
      <Icon name="time" size={12} />
    </span>
  );
}

// Barra da régua de acompanhamento — mesma anatomia da barra "Linha do tempo"
// (título + subtítulo + trilho), porém SEM sanfona: o detalhe (bateria por
// timepoint, eventos e enzimas) abre no MODAL deslizante padrão da plataforma
// (SlideOverPanel), acionado pelo "Ver detalhes".
function ProtocolRulerCard() {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center gap-4 rounded-[20px] bg-paper p-4 shadow-[var(--shadow-tab)]">
        <span className="flex shrink-0 items-center gap-2 text-ink">
          <Icon name="target" size={18} className="text-neutral-700" />
          <span className="flex flex-col">
            <span className="text-body font-medium leading-tight">Régua de acompanhamento</span>
            <span className="mt-0.5 font-mono text-micro leading-tight text-neutral-500">
              {CURRENT_TP} · {PROTOCOL_WINDOW}
            </span>
          </span>
        </span>

        {/* Trilho da régua — sempre visível. */}
        <span className="min-w-0 flex-1">
          <ProtocolRail />
        </span>

        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-caption font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink"
        >
          Ver detalhes
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      {/* Modal — detalhe do protocolo. */}
      <SlideOverPanel
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        label="Régua de acompanhamento · detalhes"
        className="max-w-[560px]"
      >
        <div className="flex min-h-0 flex-col gap-4">
          {/* Header do modal. */}
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-paper">
              <Icon name="target" size={18} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-display text-[20px] font-medium leading-tight text-ink">
                Régua de acompanhamento
              </span>
              <span className="mt-0.5 font-mono text-micro text-neutral-500">
                {CURRENT_TP} · {PROTOCOL_WINDOW}
              </span>
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setDetailOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/60 hover:text-ink"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Corpo rolável. */}
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <ProtocolDetail />
          </div>
        </div>
      </SlideOverPanel>
    </>
  );
}

// Corpo do MODAL da régua: faixa do episódio (baseline) · bateria estruturada por
// timepoint (filtro de pílulas) · eventos fora da agenda · gate de enzimas.
// Superfícies no idioma de VIDRO do SlideOverPanel (glass-frost-inner).
function ProtocolDetail() {
  const [tp, setTp] = useState<(typeof BATTERY_TPS)[number]>("M3");
  const battery = batteryFor(tp.toLowerCase());
  return (
    <div className="flex flex-col gap-4">
      {/* Faixa do episódio — baseline (exposição prévia ao produto). */}
      <div className="glass-frost-inner flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
        <span className="text-caption font-medium text-ink">
          Episódio · CBD 200mg/mL · Baseline: {BASELINE}
        </span>
        <span className="flex-1 text-right font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
          início mar/2026
        </span>
      </div>

      <TabHeader aside={<PillFilter options={BATTERY_TPS} value={tp} onChange={setTp} />}>
        Bateria estruturada por timepoint
      </TabHeader>

      {/* Bateria do timepoint selecionado. */}
      <div className="flex flex-col gap-1.5">
        {battery.map((b) => (
          <div key={b.key} className="glass-frost-inner flex items-center gap-2 rounded-xl px-3 py-2">
            <BatteryTick state={b.state} />
            <span className="min-w-0 flex-1 text-caption text-neutral-700 text-pretty">{b.label}</span>
            {b.note ? <span className="shrink-0 font-mono text-micro text-neutral-400">{b.note}</span> : null}
          </div>
        ))}
      </div>

      {/* Eventos fora da agenda + monitoramento de enzimas hepáticas. */}
      <div className="flex flex-col gap-2">
        <Eyebrow icon="error">Eventos fora da agenda</Eyebrow>
        {PROTOCOL_EVENTS.map((e) => (
          <div key={e.date} className="flex items-start gap-2 rounded-xl border border-white/50 bg-white/40 px-3 py-2">
            <Icon name="error" size={15} className="mt-0.5 shrink-0 text-neutral-500" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-caption font-medium text-ink">{e.label}</span>
              <span className="text-caption text-neutral-600 text-pretty">{e.detail}</span>
            </div>
            <span className="shrink-0 font-mono text-micro text-neutral-400">{e.date}</span>
          </div>
        ))}
        <div className="glass-frost-inner flex items-center gap-2 rounded-xl px-3 py-2">
          <Icon name="warning" size={15} className="shrink-0 text-neutral-500" />
          <span className="text-caption text-neutral-700 text-pretty">{ENZYME_GATE}</span>
        </div>
      </div>
    </div>
  );
}

// Um campo do card de produto (rótulo micro + valor). `mono` p/ números/doses.
function ProductField({ label, children, mono = true }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-micro uppercase tracking-[0.06em] text-neutral-400">{label}</span>
      <span className={cn("text-caption text-ink", mono && "font-mono")}>{children}</span>
    </div>
  );
}

// "Produto em uso" — corpo da sanfona (Análise em Profundidade): identificação
// completa do produto de cannabis (campos obrigatórios do RWE). A sanfona já é a
// camada de disclosure — aqui os campos aparecem todos, em grade.
function ProdutoTab() {
  return (
    <div className="flex flex-col gap-4">
      <TabHeader>Identificação do produto de cannabis em uso · atualizado a cada visita</TabHeader>

      {/* Nome comercial + fabricante em destaque (mesma faixa do episódio). */}
      <div className="frost-inset flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
        <span className="text-caption font-medium text-ink">{PRODUCT.nome}</span>
        <span className="flex-1 text-right font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
          {PRODUCT.fabricante}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <ProductField label="Concentração CBD">{PRODUCT.cbd}</ProductField>
        <ProductField label="Concentração THC">{PRODUCT.thc}</ProductField>
        <ProductField label="Proporção CBD:THC">{PRODUCT.ratio}</ProductField>
        <ProductField label="Quimiotipo" mono={false}>{PRODUCT.quimiotipo}</ProductField>
        <ProductField label="Via de administração" mono={false}>{PRODUCT.via}</ProductField>
        <ProductField label="Data de início de uso">{PRODUCT.inicio}</ProductField>
        <ProductField label="Dose inicial (D0)">{PRODUCT.d0}</ProductField>
        <ProductField label="Dose atual (Dt)">{PRODUCT.dt}</ProductField>
        <ProductField label="Dose média (SAP)">{PRODUCT.dmedia}</ProductField>
        <ProductField label="Cannabinoides minoritários" mono={false}>{PRODUCT.minoritarios.join(" · ")}</ProductField>
        <ProductField label="Terpenos" mono={false}>{PRODUCT.terpenos.join(" · ")}</ProductField>
        <ProductField label="Custo mensal">{PRODUCT.custo}</ProductField>
        <ProductField label="Lote / origem" mono={false}>{PRODUCT.origem}</ProductField>
        <ProductField label="Outcome primário" mono={false}>{PRODUCT.outcome}</ProductField>
      </div>
    </div>
  );
}

// Sanfona — uma seção por linha (aba branca + corpo #f9f9f9). `summary` = resumo
// inline (chips/contagens); `body` = o conteúdo clínico completo (expandido).
// Ambos opcionais: a seção "documentos" computa os dois no PreReviewCenter
// (a lista de docs é estado — o wizard "Gerar documento" injeta itens).
const SECTIONS: {
  key: string;
  icon: string;
  title: string;
  summary?: ReactNode;
  body?: ReactNode;
}[] = [
  {
    key: "motivo",
    icon: "flag",
    title: "Motivo Inicial",
    summary: (
      <SoftChip>
        Episódio CBD · M54.5{" "}
        <span className="text-neutral-500">· Dor lombar crônica</span>
      </SoftChip>
    ),
    body: <MotivoTab />,
  },
  {
    key: "produto",
    icon: "capsule",
    title: "Produto em uso",
    summary: (
      <>
        <SoftChip icon="capsule">CBD 200mg/mL</SoftChip>
        <SoftChip>Tipo III</SoftChip>
        <SoftChip>Sublingual</SoftChip>
        <SoftChip label="Dt">120 mg/dia</SoftChip>
      </>
    ),
    body: <ProdutoTab />,
  },
  {
    key: "comorbidades",
    icon: "healing",
    title: "Comorbidades",
    summary: (
      <>
        {COMORBIDITIES.map((c) => (
          <SoftChip key={c.cid}>{c.cid}</SoftChip>
        ))}
      </>
    ),
    body: <ComorbidadesTab />,
  },
  {
    key: "escalas",
    icon: "trending_up",
    title: "Escalas de evol.",
    summary: (
      <>
        <SoftChip label="EVA">5/10</SoftChip>
        <SoftChip label="PSQI">9/21</SoftChip>
        <SoftChip label="HAD-A">7/21</SoftChip>
        <SoftChip label="BPI">4/10</SoftChip>
      </>
    ),
    body: <EscalasTab />,
  },
  {
    key: "medicacoes",
    icon: "medication",
    title: "Medicações",
    summary: (
      <>
        <SoftChip icon="medication">CBD 200mg/mL</SoftChip>
        <SoftChip>Tramadol 50mg</SoftChip>
        <SoftChip>Amitriptilina 25mg</SoftChip>
        <SoftChip>Pregabalina 75mg</SoftChip>
      </>
    ),
    body: <MedicacoesTab />,
  },
  {
    key: "exames",
    icon: "science",
    title: "Exames",
    summary: (
      <>
        <SoftChip>Hemograma</SoftChip>
        <SoftChip>Perfil hepático</SoftChip>
        <SoftChip>RM lombar</SoftChip>
        <SoftChip>ENMG MMII</SoftChip>
      </>
    ),
    body: <ExamesTab />,
  },
  {
    key: "documentos",
    icon: "description",
    title: "Documentos",
    // summary/body computados no PreReviewCenter a partir do estado `docs`.
  },
  {
    key: "atendimentos",
    icon: "event_note",
    title: "Atendimentos",
    summary: (
      <>
        <SoftChip>
          <span className="font-medium uppercase tracking-[0.06em] text-neutral-600">4 consultas</span>
        </SoftChip>
        <span className="text-caption text-neutral-500">Última 19/06 com Dra. Helena Prado</span>
      </>
    ),
    body: <AtendimentosTab />,
  },
];

export function PreReviewCenter() {
  // Sanfona: no máximo uma seção aberta. `null` = todas fechadas (estado inicial).
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [docs, setDocs] = useState<PatientDoc[]>(INITIAL_DOCS);
  const [genDocOpen, setGenDocOpen] = useState(false);

  // Documento gerado pelo wizard: entra no topo da lista como "Pendente" e a
  // sanfona Documentos abre sozinha para dar o feedback visual.
  const handleGenerate = (name: string) => {
    setDocs((prev) => [{ name, status: "Pendente" as const, date: "Hoje" }, ...prev]);
    setGenDocOpen(false);
    setOpenKey("documentos");
  };

  const pendentes = docs.filter((d) => d.status === "Pendente").length;
  const enviados = docs.length - pendentes;

  return (
    <AppScreen>
      <PatientHeader
        onOpenDrawer={() => setDrawerOpen(true)}
        onGenerateDocument={() => setGenDocOpen(true)}
      />

      {/* Resumo do status atual (esq.) + Alertas pré-consulta (dir.) — lado a lado,
          conforme o Figma de referência. */}
      <div className="grid items-stretch gap-4 lg:grid-cols-[1.65fr_1fr]">
        <SummarySection />
        <AlertsSection />
      </div>

      {/* Diagnóstico | Tratamento + Sintomas. */}
      <DiagTreatCard />

      {/* Régua de acompanhamento (protocolo TCLE→M12) — barra estática; o detalhe
          abre em modal (Ver detalhes). Linha do tempo (histórico) segue na sanfona. */}
      <ProtocolRulerCard />
      <TimelineCard
        open={openKey === "timeline"}
        onToggle={() => setOpenKey((k) => (k === "timeline" ? null : "timeline"))}
      />

      <h3 className="pl-1 pt-2 font-display text-body-l font-medium text-ink">
        Análise em Profundidade
      </h3>

      <div className="flex flex-col gap-4">
        {SECTIONS.map((s) => {
          const isDocs = s.key === "documentos";
          return (
            <AccordionRow
              key={s.key}
              icon={s.icon}
              title={s.title}
              summary={
                isDocs ? (
                  <>
                    <SoftChip>
                      <span className="font-medium uppercase tracking-[0.06em] text-neutral-600">
                        {pendentes} {pendentes === 1 ? "pendente" : "pendentes"}
                      </span>
                    </SoftChip>
                    <SoftChip>
                      <span className="font-medium uppercase tracking-[0.06em] text-neutral-600">
                        {enviados} {enviados === 1 ? "enviado" : "enviados"}
                      </span>
                    </SoftChip>
                  </>
                ) : (
                  s.summary
                )
              }
              open={openKey === s.key}
              onToggle={() => setOpenKey((k) => (k === s.key ? null : s.key))}
            >
              {isDocs ? <DocumentosTab docs={docs} /> : s.body}
            </AccordionRow>
          );
        })}
      </div>

      <PersonalDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {genDocOpen ? (
        <GenerateDocumentModal
          patient={{ ...PATIENT, diagnosis: "M54.5 · Dor lombar crônica" }}
          onClose={() => setGenDocOpen(false)}
          onGenerate={handleGenerate}
        />
      ) : null}
    </AppScreen>
  );
}

/* ===================== CONTEÚDO DAS SEÇÕES ===================== */

// Cabeçalho de seção: subtítulo (esquerda) + controle/extra (direita).
function TabHeader({ children, aside }: { children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {children ? (
        <p className="text-caption text-neutral-500 text-pretty">{children}</p>
      ) : (
        <span aria-hidden />
      )}
      <span className="flex-1" />
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
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
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
      <div className="frost-inset flex items-center gap-2.5 rounded-2xl px-3.5 py-3">
        <span className="frost-inset grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-600">
          <Icon name="capsule" size={18} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-body font-medium text-ink">Episódio CBD · M54.5</span>
          <span className="font-mono text-micro tracking-[0.04em] text-neutral-500">
            Dor lombar crônica
          </span>
        </div>
        <span className="flex-1" />
        <div className="flex items-center gap-2">
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
          <div key={label} className="frost-inset flex flex-col gap-1 rounded-xl px-3.5 py-2.5">
            <Eyebrow>{label}</Eyebrow>
            <span className="text-caption text-neutral-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineDetail() {
  const [year, setYear] = useState<(typeof TIMELINE_YEARS)[number]>("Tudo");
  // Aberto mostra TODOS os eventos (sem disclosure); os filtros de ano recortam a lista.
  const events = year === "Tudo" ? TIMELINE : TIMELINE.filter((e) => e.year === year);

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho do corpo + filtro por ano. */}
      <TabHeader aside={<PillFilter options={TIMELINE_YEARS} value={year} onChange={setYear} />}>
        Evolução farmacológica do episódio
      </TabHeader>

      {/* Faixa do episódio. */}
      <div className="frost-inset flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
        <span className="text-caption font-medium text-ink">
          Episódio · CBD 200mg/mL · Dor lombar crônica
        </span>
        <span className="flex-1 text-right font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
          início ago/2025
        </span>
      </div>

      <Eyebrow>{events.length} eventos · evolução farmacológica</Eyebrow>

      {/* Timeline vertical: espinha contínua; nó atual (Hoje) em ink. */}
      <ul className="flex flex-col">
        {events.map((e, i) => {
          const current = e.tag === "Hoje";
          const last = i === events.length - 1;
          return (
            <li key={e.date} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                    current ? "bg-ink text-paper" : "bg-neutral-100 text-neutral-500",
                  )}
                >
                  <Icon name={e.icon} size={15} />
                </span>
                {!last ? <span className="mt-1 w-px flex-1 bg-neutral-200" /> : null}
              </div>
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-1",
                  last ? "pb-0" : "pb-5",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-caption text-neutral-600">{e.date}</span>
                  {e.tag ? (
                    <Tag variant={current ? "mid" : "soft"} upper>
                      {e.tag}
                    </Tag>
                  ) : null}
                  {e.meds ? <Tag variant="soft">+ {e.meds}</Tag> : null}
                </div>
                <span className="text-caption text-neutral-700 text-pretty">{e.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
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
          const delta = v == null ? null : basal - v;
          const mcid = delta != null && delta >= sc.mcid;
          return (
            <div
              key={sc.code}
              className="frost-inset flex flex-col gap-3 rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <Eyebrow className="flex-1">{sc.domain} · PRO</Eyebrow>
                <span className="font-mono text-micro text-neutral-400">{tp}</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5 text-body font-medium text-ink">
                    {sc.code}
                    <InfoTip text={sc.info} />
                  </span>
                  <span className="truncate text-caption text-neutral-500">{sc.label}</span>
                </div>
                <span className="flex-1" />
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-display-m leading-none tabular-nums text-ink">
                    {v ?? "—"}
                  </span>
                  <span className="font-mono text-micro text-neutral-400">/{sc.max}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-neutral-200/70 pt-2.5">
                <span className="font-mono text-micro text-neutral-500">
                  {delta != null && delta > 0 ? `↓${delta}` : "—"} · basal {basal}
                </span>
                <span className="flex-1" />
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
            className="flex items-center gap-3 border-b border-dashed border-neutral-200/70 py-3 first:pt-0 last:border-0"
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
        "flex items-center gap-3 border-b border-dashed border-neutral-200/70 py-2.5 first:pt-0 last:border-0",
        dim && "opacity-55",
      )}
    >
      <Icon name="capsule" size={18} className="text-neutral-400" />
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
                className="flex flex-col gap-1 border-b border-dashed border-neutral-200/70 py-3 first:pt-0 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{ex.name}</span>
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

function DocumentosTab({ docs }: { docs: PatientDoc[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {docs.map((d, i) => (
        <li
          key={`${d.name}-${i}`}
          className="frost-inset flex items-center gap-3 rounded-2xl px-3.5 py-2.5"
        >
          <Icon name="file" size={18} className="text-neutral-500" />
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
            <li key={e.date} className="frost-inset flex flex-col gap-2 rounded-2xl px-3.5 py-3">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{e.who}</span>
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
              className="flex items-center gap-3 border-b border-dashed border-neutral-200/70 py-2.5 first:pt-0 last:border-0"
            >
              <span className="font-mono text-caption text-neutral-600">{p.date}</span>
              <Tag variant="soft">Respondido</Tag>
              <span className="flex-1 truncate text-right text-micro text-neutral-500">{p.channel}</span>
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
