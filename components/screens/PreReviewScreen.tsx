"use client";

import { useState } from "react";
import { WireButton, WireBadge, Stat, Eyebrow, Avatar, ScrollTabs, Segmented } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { Icon } from "@/components/ui/Icon";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `pre-review` — Paciente 360: o perfil completo pré-consulta numa tela só (dor do
// shadowing: prontuário sem consolidação). Padrão de MÓDULO (Centro/Esquerda).
// ESQUERDA = stack "quem é ela" (identidade → condições → dados pessoais → contato e
// convênio). CENTRO (coluna principal) = briefing de 60s no TOPO (CTA "Iniciar consulta"
// à direita) → alertas pré-consulta (horizontal) → indicadores (horizontal) →
// aprofundamentos em ABAS, preenchendo a altura.
//
// PRINCÍPIOS (não a "bagunça" densa/colorida de prontuário): evolução, não navegação ·
// a tela evolui conforme o contexto · conteúdo agrupado por relevância. SEM COR:
// criticidade por PESO de cinza + ícone (nunca matiz). Os artifícios ilustrativos
// (nós/conectores na timeline, setas de delta, MCID, "Validar escala") seguem essa
// régua — calmos, no sistema vidro/cinza.

const PATIENT = {
  name: "Marina Castro",
  seed: "marina",
  age: 38,
  diagnosis: "Dor lombar crônica",
  cid: "M54.5",
  followUp: "em acompanhamento há 8 meses",
};

// Detalhamento da pessoa — coluna ESQUERDA. Pares label↔valor exibidos em linhas.
const PERSONAL: [string, string][] = [
  ["Nascimento", "14/05/1987"],
  ["Sexo", "Feminino"],
  ["Profissão", "Arquiteta"],
  ["Estado civil", "Casada"],
  ["Cidade", "São Paulo · SP"],
  ["Endereço", "R. das Acácias, 210 · Pinheiros"],
];

const CONTACT: [string, string][] = [
  ["Telefone", "(11) 98765-4321"],
  ["E-mail", "marina.castro@email.com"],
  ["Plano", "Saúde Plena · Apartamento"],
  ["Carteirinha", "0042 1187 5530"],
];

// Comorbidades ativas (CID-10) — diagnósticos validados. Criticidade pelo tom do
// badge (mid = ativa, soft = controlada), nunca por cor.
const COMORBIDITIES: { cid: string; name: string; since: string; status: "Ativa" | "Em controle" }[] = [
  { cid: "M54.5", name: "Dor lombar baixa (crônica)", since: "há 14m", status: "Ativa" },
  { cid: "M79.7", name: "Fibromialgia", since: "há 2a", status: "Ativa" },
  { cid: "F41.1", name: "Transtorno de ansiedade generalizada", since: "há 8m", status: "Ativa" },
  { cid: "G47.0", name: "Insônia", since: "há 6m", status: "Em controle" },
];

// Medicações em duas faixas: em uso (peso de ink) e suspensas (cinza). `cannabis`
// recebe ícone/marcador próprio (folha) — sem cor.
const MEDS: { name: string; dose: string; status: "uso" | "suspensa"; cannabis?: boolean }[] = [
  { name: "CBD 200mg/mL", dose: "0,5 mL 2×/dia · há 3 meses", status: "uso", cannabis: true },
  { name: "Tramadol 50mg", dose: "2× ao dia · em desmame", status: "uso" },
  { name: "Amitriptilina 25mg", dose: "à noite · há 3 meses", status: "uso" },
  { name: "Pregabalina 75mg", dose: "2× ao dia · há 2 meses", status: "uso" },
  { name: "Vitamina D 7.000UI", dose: "semanal · há 1 ano", status: "uso" },
  { name: "Melatonina 3mg", dose: "à noite · se necessário", status: "uso" },
  { name: "Ciclobenzaprina 5mg", dose: "suspensa · sonolência diurna", status: "suspensa" },
  { name: "Ibuprofeno 600mg", dose: "suspenso · uso esporádico anterior", status: "suspensa" },
];

// Linha do tempo agrupada pelo EPISÓDIO TERAPÊUTICO (entidade primária RWE).
const EPISODE = {
  title: "CBD 200mg/mL · Dor lombar crônica",
  start: "início ago/2025",
  stars: 2,
};

// Ícone do nó por TIPO de evento — a "cor" semântica vem do ícone, não de matiz.
const KIND_ICON: Record<string, string> = {
  "Consulta atual": "bx-pulse",
  Consulta: "bx-message-square-detail",
  Conduta: "bx-capsule",
  Exame: "bx-test-tube",
  Evento: "bx-error-circle",
};

// Histórico clínico (mais recente → mais antigo). `current` marca a consulta de hoje
// (nó preenchido). `med` exibe a pílula "+ medicação" introduzida na conduta.
const TIMELINE: { tp: string; date: string; kind: string; text: string; med?: string; current?: boolean }[] = [
  { tp: "Hoje", date: "25/06/2026", kind: "Consulta atual", text: "Avaliação terapêutica em andamento — revisar evolução, resposta clínica e ajustes.", current: true },
  { tp: "M3", date: "19/06/2026", kind: "Evento", text: "Sonolência diurna leve relatada (CTCAE Grau 1)." },
  { tp: "M1", date: "04/03/2026", kind: "Conduta", text: "Início de CBD; desmame gradual de tramadol.", med: "CBD 200mg/mL" },
  { tp: "—", date: "02/03/2026", kind: "Exame", text: "Hemograma e perfil hepático normais — base para monitorar CBD." },
  { tp: "—", date: "10/01/2026", kind: "Conduta", text: "Ajuste de amitriptilina por sono fragmentado.", med: "Amitriptilina 25mg" },
  { tp: "—", date: "12/12/2025", kind: "Exame", text: "Ressonância lombar · alterações degenerativas L4–L5." },
  { tp: "Basal", date: "28/08/2025", kind: "Consulta", text: "Reavaliação · encaminhamento e solicitação de exames." },
  { tp: "—", date: "05/05/2025", kind: "Conduta", text: "Tramadol para controle da dor refratária.", med: "Tramadol 50mg" },
  { tp: "—", date: "18/09/2024", kind: "Conduta", text: "Fisioterapia + AINEs; resposta parcial e transitória." },
  { tp: "—", date: "22/05/2024", kind: "Exame", text: "Raio-X lombar · redução do espaço discal L4–L5." },
  { tp: "—", date: "10/03/2024", kind: "Consulta", text: "1ª avaliação · dor lombar mecânica; orientação conservadora." },
];

// Exames agrupados por CATEGORIA (laboratoriais · imagem · funcionais). Cada
// categoria traz um status discreto; o médico lê o achado sem abrir o PDF.
const EXAM_CATS: { key: string; label: string; icon: string; status: string }[] = [
  { key: "lab", label: "Laboratoriais", icon: "bx-test-tube", status: "recente há 1m" },
  { key: "imagem", label: "Imagem", icon: "bx-body", status: "normais" },
  { key: "funcional", label: "Funcionais", icon: "bx-pulse", status: "pendente" },
];

const EXAMS: { name: string; date: string; finding: string; category: string }[] = [
  { name: "Hemograma", date: "02/03/2026", finding: "Sem alterações significativas.", category: "lab" },
  { name: "Perfil hepático", date: "02/03/2026", finding: "TGO/TGP normais — base para monitorar CBD.", category: "lab" },
  { name: "Função renal", date: "02/03/2026", finding: "Ureia e creatinina dentro da normalidade.", category: "lab" },
  { name: "Vitamina D · TSH", date: "15/02/2026", finding: "Vit. D insuficiente (24 ng/mL); TSH normal.", category: "lab" },
  { name: "Ressonância lombar", date: "12/12/2025", finding: "Discopatia degenerativa L4–L5; sem compressão radicular.", category: "imagem" },
  { name: "Raio-X lombar", date: "22/05/2024", finding: "Redução do espaço discal L4–L5; sem espondilolistese.", category: "imagem" },
  { name: "Eletroneuromiografia MMII", date: "20/01/2026", finding: "Sem sinais de radiculopatia ativa.", category: "funcional" },
];

// Escalas longitudinais (PRO). `mcid` = variação mínima clinicamente importante (queda,
// pois todas são de sintoma — menor é melhor). O card calcula delta vs basal e o
// status MCID. Sem cor: peso de cinza + ícone (✓ atingido / ! abaixo).
const TIMEPOINTS: { key: string; label: string }[] = [
  { key: "Basal", label: "Basal" },
  { key: "M1", label: "Mês 1" },
  { key: "M3", label: "Mês 3" },
  { key: "M6", label: "Mês 6" },
];

const SCALES: { code: string; domain: string; label: string; max: number; mcid: number; time: string; points: { tp: string; v: number }[] }[] = [
  { code: "EVA", domain: "Dor", label: "Intensidade da dor", max: 10, mcid: 2, time: "1min", points: [{ tp: "Basal", v: 8 }, { tp: "M1", v: 6 }, { tp: "M3", v: 5 }, { tp: "M6", v: 4 }] },
  { code: "PSQI", domain: "Sono", label: "Qualidade do sono", max: 21, mcid: 3, time: "3min", points: [{ tp: "Basal", v: 14 }, { tp: "M1", v: 11 }, { tp: "M3", v: 9 }, { tp: "M6", v: 8 }] },
  { code: "BPI", domain: "Função", label: "Interferência da dor", max: 10, mcid: 1, time: "2min", points: [{ tp: "Basal", v: 7 }, { tp: "M1", v: 6 }, { tp: "M3", v: 4 }] },
  { code: "HAD-A", domain: "Ansiedade", label: "Ansiedade", max: 21, mcid: 2, time: "2min", points: [{ tp: "Basal", v: 11 }, { tp: "M1", v: 9 }, { tp: "M3", v: 7 }] },
];

// Consultas anteriores — quem atendeu, tipo, e documentos gerados (chips).
const VISITS: { doctor: string; type: string; date: string; status: string; docs: string[] }[] = [
  { doctor: "Dra. Helena Prado", type: "Retorno · M3", date: "19/06/2026", status: "Concluído", docs: ["Prescrição", "Atestado", "Laudo"] },
  { doctor: "Dra. Helena Prado", type: "Retorno · M1", date: "04/03/2026", status: "Concluído", docs: ["Prescrição", "Laudo"] },
  { doctor: "Dra. Bárbara Lemes · Reumato", type: "Interconsulta", date: "12/12/2025", status: "Concluído", docs: ["Laudo"] },
  { doctor: "Dra. Helena Prado", type: "Avaliação inicial", date: "28/08/2025", status: "Concluído", docs: ["Prescrição", "Solicitação"] },
];

const PRE_HISTORY: [string, string, string][] = [
  ["17/06/2026", "Respondida", "WhatsApp · 9 respostas · ★★"],
  ["01/03/2026", "Respondida", "WhatsApp · 8 respostas"],
  ["08/01/2026", "Respondida", "WhatsApp · 8 respostas · ★"],
  ["10/12/2025", "Respondida", "WhatsApp · 7 respostas"],
  ["26/08/2025", "Respondida", "Web · 1ª pré-anamnese"],
];

const TEAM_NOTES: [string, string, string][] = [
  ["Enfermagem", "19/06/2026", "Orientação sobre administração do CBD e sinais de sedação."],
  ["Nutrição", "14/04/2026", "Ajuste anti-inflamatório; meta de redução de peso (2 kg)."],
  ["Psicologia", "05/03/2026", "Sintomas ansiosos leves; iniciada TCC quinzenal."],
  ["Fisioterapia", "20/02/2026", "Ganho de mobilidade lombar; manter programa."],
  ["Dra. Bárbara · Reumatologia", "12/12/2025", "Fibromialgia associada; sugiro abordagem multimodal."],
];

const DOCS: { name: string; date: string; status: "pendente" | "enviado" }[] = [
  { name: "Receita de controle especial · CBD", date: "19/06/2026", status: "enviado" },
  { name: "Atestado · 2 dias", date: "19/06/2026", status: "enviado" },
  { name: "Solicitação de exames · perfil hepático", date: "10/01/2026", status: "pendente" },
  { name: "Termo de consentimento · CBD", date: "04/03/2026", status: "enviado" },
  { name: "Relatório médico · evolução do quadro", date: "12/12/2025", status: "pendente" },
  { name: "Encaminhamento · Reumatologia", date: "28/08/2025", status: "enviado" },
  { name: "Receita anterior · tramadol", date: "05/05/2025", status: "enviado" },
];

// Alertas pré-consulta — exibidos na COLUNA PRINCIPAL (centro), na horizontal, logo
// abaixo do briefing. Peso de cinza, nunca cor.
const ALERTS: { tone: "hard" | "mid"; label: string; text: string }[] = [
  { tone: "hard", label: "Crítico", text: "Alergia a dipirona registrada." },
  { tone: "mid", label: "Atenção", text: "Interação potencial: amitriptilina × CBD (monitorar sedação)." },
  { tone: "mid", label: "Atenção", text: "Escala PSQI vencida para reaplicação neste timepoint." },
];

// Indicadores — exibidos na COLUNA PRINCIPAL (centro), na horizontal, abaixo dos
// alertas. Valores em mono (Stat); sem cor.
const INDICATORS: { value: string; label: string; hint: string }[] = [
  { value: "12", label: "Consultas", hint: "desde ago/2025" },
  { value: "86%", label: "Aderência", hint: "últimos 6 meses" },
  { value: "8 → 5", label: "EVA dor", hint: "basal → M3" },
  { value: "14 → 9", label: "PSQI sono", hint: "basal → M3" },
];

const PRE_STATES: { key: string; label: string }[] = [
  { key: "respondida", label: "Respondida" },
  { key: "pendente", label: "Pendente" },
  { key: "nao-enviada", label: "Não enviada" },
  { key: "primeira", label: "1ª consulta" },
];

function StatusChips({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRE_STATES.map((s) => (
        <WireBadge
          key={s.key}
          tone={s.key === active ? "mid" : "soft"}
          className={cn(s.key !== active && "opacity-45")}
        >
          {s.label}
        </WireBadge>
      ))}
    </div>
  );
}

// Linhas label↔valor (dados pessoais / contato). Mesmo padrão das medicações:
// rótulo discreto à esquerda, valor à direita, divisores claros.
function InfoRows({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="flex flex-col divide-y divide-white/40">
      {rows.map(([k, v]) => (
        <li key={k} className="flex items-center justify-between gap-3 py-2">
          <span className="shrink-0 text-caption text-neutral-500">{k}</span>
          <span className="text-right text-caption text-neutral-700">{v}</span>
        </li>
      ))}
    </ul>
  );
}

// Pílula discreta "+ medicação" (introdução de conduta na timeline). Vidro/cinza.
function MedChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/45 px-2 py-0.5 font-mono text-micro text-neutral-600">
      <Icon name="bx-plus" className="text-sm text-neutral-500" />
      {name}
    </span>
  );
}

// LINHA DO TEMPO — artifício ilustrativo principal: nós (ícone por tipo) ligados por
// um CONECTOR vertical contínuo. O nó de hoje é preenchido (ink). Itens antigos ficam
// recolhidos atrás de "Expandir" (evolução, não navegação).
function TimelineSection() {
  const [expanded, setExpanded] = useState(false);
  const PRIMARY = 5;
  const shown = expanded ? TIMELINE : TIMELINE.slice(0, PRIMARY);
  const hidden = TIMELINE.length - PRIMARY;

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5">
        <span className="text-caption font-medium text-ink">Episódio · {EPISODE.title}</span>
        <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-500">
          {EPISODE.start}
        </span>
      </div>
      <Eyebrow>{TIMELINE.length} eventos · evolução farmacológica</Eyebrow>
      <ol className="flex flex-col">
        {shown.map((e, i) => {
          const last = i === shown.length - 1;
          return (
            <li key={e.date + e.text} className="relative flex gap-3.5 pb-5 last:pb-0">
              {/* Conector vertical — do pé do nó até o próximo. */}
              {!last ? (
                <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-px bg-white/55" />
              ) : null}
              {/* Nó — ícone do tipo de evento; hoje = preenchido. */}
              <span
                className={cn(
                  "relative z-10 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full",
                  e.current ? "bg-ink text-paper" : "glass-frost-inner text-neutral-500",
                )}
              >
                <Icon name={KIND_ICON[e.kind] ?? "bx-circle"} className="text-base" />
              </span>
              <div className="flex min-w-0 flex-col gap-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-caption text-neutral-600">{e.date}</span>
                  {e.tp !== "—" ? (
                    <WireBadge tone={e.current ? "mid" : "soft"}>{e.tp}</WireBadge>
                  ) : null}
                  {e.med ? <MedChip name={e.med} /> : null}
                </div>
                <span
                  className={cn(
                    "text-caption text-pretty",
                    e.current ? "font-medium text-ink" : "text-neutral-700",
                  )}
                >
                  {e.text}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {hidden > 0 && !expanded ? (
        <WireButton
          variant="ghost"
          size="sm"
          className="gap-1.5 self-start"
          onClick={() => setExpanded(true)}
        >
          <Icon name="bx-chevron-down" className="text-base" />
          Expandir · {hidden} intervenções anteriores
        </WireButton>
      ) : null}
    </div>
  );
}

// Card de uma escala num timepoint: domínio + tempo estimado, código, valor/max, delta
// vs basal (seta cinza), status MCID (✓/!), basal e ação "Validar escala".
function ScaleCard({ scale, tp }: { scale: (typeof SCALES)[number]; tp: string }) {
  const basal = scale.points.find((p) => p.tp === "Basal");
  const cur = scale.points.find((p) => p.tp === tp);

  return (
    <div className="glass-frost-inner flex flex-col gap-2.5 rounded-2xl px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow icon="bx-bar-chart-alt-2">{scale.domain} · PRO</Eyebrow>
        <span className="inline-flex items-center gap-1 font-mono text-micro text-neutral-400">
          <Icon name="bx-time-five" className="text-sm" />
          {scale.time}
        </span>
      </div>

      {!cur || !basal ? (
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-body font-medium text-ink">{scale.code}</span>
            <span className="text-micro text-neutral-500">{scale.label}</span>
          </div>
          <span className="font-mono text-caption text-neutral-400">sem aplicação</span>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="text-body font-medium text-ink">{scale.code}</span>
              <span className="truncate text-micro text-neutral-500">{scale.label}</span>
            </div>
            <span className="flex shrink-0 items-baseline gap-1">
              <span className="font-mono text-title leading-none tabular-nums text-ink">{cur.v}</span>
              <span className="font-mono text-caption text-neutral-400">/{scale.max}</span>
            </span>
          </div>

          {(() => {
            const delta = basal.v - cur.v; // >0 = melhora (menor é melhor)
            const reached = delta >= scale.mcid;
            const remaining = Math.max(0, scale.mcid - delta);
            const arrow = delta > 0 ? "↓" : delta < 0 ? "↑" : "→";
            return (
              <div className="flex items-center justify-between gap-2 border-t border-white/50 pt-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-caption text-neutral-600">
                  <span className="text-ink">{arrow}{Math.abs(delta)}</span>
                  <span className="text-neutral-400">basal {basal.v}</span>
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-micro uppercase tracking-[0.06em]",
                    reached ? "text-ink" : "text-neutral-400",
                  )}
                >
                  <Icon name={reached ? "bx-check-circle" : "bx-error-circle"} className="text-sm" />
                  {reached ? "MCID atingido" : `faltam ${remaining}`}
                </span>
              </div>
            );
          })()}

          <WireButton variant="ghost" size="sm" className="mt-0.5 w-full gap-1.5">
            <Icon name="bx-check-shield" className="text-base" />
            Validar escala
          </WireButton>
        </>
      )}
    </div>
  );
}

// ESCALAS — sub-abas de timepoint (Basal · Mês 1 · Mês 3 · Mês 6) que evoluem os cards
// em PLACE (a tela evolui conforme o contexto). Grade 2-col, calma.
function EscalasSection() {
  const [tp, setTp] = useState("M3");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>{SCALES.length} escalas · {TIMEPOINTS.length} timepoints</Eyebrow>
        <Segmented options={TIMEPOINTS} value={tp} onChange={setTp} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SCALES.map((sc) => (
          <ScaleCard key={sc.code} scale={sc} tp={tp} />
        ))}
      </div>
    </div>
  );
}

// Seções do Paciente 360 que vivem na barra de ABAS do centro (Briefing e perfil
// ficam de fora, sempre visíveis). Ordenadas por relevância para a consulta.
const TAB_SECTIONS: {
  key: string;
  label: string;
  icon: string;
  subtitle?: string;
  extra?: React.ReactNode;
  content: React.ReactNode;
}[] = [
  {
    key: "motivo",
    label: "Motivo",
    icon: "bx-detail",
    subtitle: "Queixa principal e objetivo do tratamento",
    content: (
      <div className="flex flex-col gap-4">
        {/* Classificação do episódio terapêutico — cabeçalho do motivo. */}
        <div className="glass-frost-inner flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/40">
              <Icon name="bx-leaf" className="text-lg text-neutral-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-body font-medium text-ink">Episódio CBD · {PATIENT.cid}</span>
              <span className="text-micro text-neutral-500">{PATIENT.diagnosis}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <WireBadge tone="mid">Sucesso parcial</WireBadge>
            <WireBadge tone="soft">Baseline: naïve</WireBadge>
          </div>
        </div>

        <p className="text-body text-neutral-700 text-pretty">
          Dor lombar refratária há 14 meses, com irradiação para o membro inferior
          direito. Interfere no sono e no trabalho; a paciente busca reduzir o uso
          de opioides e recuperar a funcionalidade no dia a dia.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-time-five">Início e curso</Eyebrow>
            <span className="text-caption text-neutral-700">Há 14 meses · progressiva</span>
          </div>
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-pulse">Intensidade</Eyebrow>
            <span className="text-caption text-neutral-700">EVA 5/10 · pior à noite</span>
          </div>
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-band-aid">Impacto</Eyebrow>
            <span className="text-caption text-neutral-700">Sono fragmentado · afastamento parcial</span>
          </div>
          <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
            <Eyebrow icon="bx-target-lock">Objetivo</Eyebrow>
            <span className="text-caption text-neutral-700">Reduzir opioides · recuperar função</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "timeline",
    label: "Linha do tempo",
    icon: "bx-history",
    subtitle: "Evolução farmacológica do episódio",
    extra: (
      <span className="font-mono text-caption text-neutral-400" title="Qualidade de dados RWE">
        {"★".repeat(EPISODE.stars)}{"☆".repeat(3 - EPISODE.stars)}
      </span>
    ),
    content: <TimelineSection />,
  },
  {
    key: "escalas",
    label: "Escalas",
    icon: "bx-line-chart",
    subtitle: "Desfechos relatados (PRO) por timepoint",
    content: <EscalasSection />,
  },
  {
    key: "comorbidades",
    label: "Comorbidades",
    icon: "bx-plus-medical",
    subtitle: "Diagnósticos ativos (CID-10)",
    content: (
      <div className="flex flex-col gap-3">
        <Eyebrow>{COMORBIDITIES.length} validadas</Eyebrow>
        <ul className="flex flex-col divide-y divide-white/40">
          {COMORBIDITIES.map((c) => (
            <li key={c.cid} className="flex items-center gap-3 py-2.5">
              <span className="w-14 shrink-0 font-mono text-caption font-medium text-ink">{c.cid}</span>
              <span className="min-w-0 flex-1 text-caption text-neutral-700 text-pretty">{c.name}</span>
              <span className="shrink-0 font-mono text-micro text-neutral-500">{c.since}</span>
              <WireBadge tone={c.status === "Ativa" ? "mid" : "soft"} className="shrink-0">
                {c.status}
              </WireBadge>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    key: "medicacoes",
    label: "Medicações",
    icon: "bx-capsule",
    subtitle: "Em uso e suspensas",
    content: (
      <div className="flex flex-col gap-4">
        {(["uso", "suspensa"] as const).map((status) => {
          const items = MEDS.filter((m) => m.status === status);
          if (items.length === 0) return null;
          return (
            <div key={status} className="flex flex-col gap-2">
              <Eyebrow>{status === "uso" ? `${items.length} em uso` : "Suspensas"}</Eyebrow>
              <ul className="flex flex-col gap-1.5">
                {items.map((m) => (
                  <li
                    key={m.name}
                    className={cn(
                      "glass-frost-inner flex items-center gap-3 rounded-2xl px-3.5 py-2.5",
                      status === "suspensa" && "opacity-60",
                    )}
                  >
                    <Icon
                      name={m.cannabis ? "bx-leaf" : "bx-capsule"}
                      className="shrink-0 text-lg text-neutral-500"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className={cn("text-body", status === "uso" ? "text-ink" : "text-neutral-500")}>
                        {m.name}
                      </span>
                      <span className="font-mono text-micro text-neutral-500">{m.dose}</span>
                    </div>
                    {m.cannabis ? (
                      <WireBadge tone="soft" className="shrink-0">CBD</WireBadge>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    key: "exames",
    label: "Exames",
    icon: "bx-test-tube",
    subtitle: "Achados por categoria",
    content: (
      <div className="flex flex-col gap-5">
        {EXAM_CATS.map((cat) => {
          const items = EXAMS.filter((e) => e.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Eyebrow icon={cat.icon}>{cat.label}</Eyebrow>
                <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">
                  {items.length} · {cat.status}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {items.map((ex) => (
                  <li key={ex.name} className="glass-frost-inner flex flex-col gap-1 rounded-2xl px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-body font-medium text-ink">{ex.name}</span>
                      <span className="font-mono text-micro text-neutral-500">{ex.date}</span>
                    </div>
                    <span className="text-caption text-neutral-700 text-pretty">{ex.finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    key: "documentos",
    label: "Documentos",
    icon: "bx-file",
    subtitle: "Gerados no acompanhamento",
    content: (
      <ul className="flex flex-col gap-2">
        {DOCS.map((doc) => (
          <li
            key={doc.name}
            className="glass-frost-inner flex items-center gap-3 rounded-2xl px-3.5 py-2.5"
          >
            <Icon name="bx-file" className="shrink-0 text-lg text-neutral-500" />
            <span className="min-w-0 flex-1 truncate text-caption text-neutral-700">{doc.name}</span>
            <WireBadge tone={doc.status === "enviado" ? "soft" : "mid"} className="shrink-0">
              {doc.status === "enviado" ? "Enviado" : "Pendente"}
            </WireBadge>
            <span className="shrink-0 font-mono text-micro text-neutral-500">{doc.date}</span>
            <Icon name="bx-download" className="shrink-0 text-lg text-neutral-400" />
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "atendimentos",
    label: "Atendimentos",
    icon: "bx-calendar-check",
    subtitle: "Consultas e pré-consultas anteriores",
    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Eyebrow>{VISITS.length} consultas</Eyebrow>
          <ul className="flex flex-col gap-2">
            {VISITS.map((v) => (
              <li key={v.date} className="glass-frost-inner flex flex-col gap-2 rounded-2xl px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body font-medium text-ink">{v.doctor}</span>
                  <span className="font-mono text-micro text-neutral-500">{v.date}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-caption text-neutral-600">{v.type} · {v.status}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {v.docs.map((d) => (
                      <WireBadge key={d} tone="soft">{d}</WireBadge>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Eyebrow icon="bx-list-check">Pré-consultas respondidas</Eyebrow>
          <ul className="flex flex-col">
            {PRE_HISTORY.map(([date, status, note]) => (
              <li
                key={date}
                className="flex items-center justify-between gap-3 border-b border-dashed border-white/50 py-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-caption text-neutral-600">{date}</span>
                  <WireBadge tone="soft">{status}</WireBadge>
                </div>
                <span className="text-caption text-neutral-500 text-pretty">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    key: "notas",
    label: "Notas",
    icon: "bx-group",
    subtitle: "Equipe multidisciplinar",
    content: (
      <ul className="flex flex-col gap-3">
        {TEAM_NOTES.map(([who, date, text]) => (
          <li key={who} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption font-medium text-ink">{who}</span>
              <span className="font-mono text-micro text-neutral-500">{date}</span>
            </div>
            <p className="text-caption text-neutral-700 text-pretty">{text}</p>
          </li>
        ))}
      </ul>
    ),
  },
];

const TAB_OPTIONS = TAB_SECTIONS.map((s) => ({ key: s.key, label: s.label, icon: s.icon }));

// ESQUERDA — stack "quem é ela" (detalhamento da pessoa, de cima p/ baixo):
// identidade → condições → dados pessoais → contato e convênio. Briefing, alertas,
// indicadores e os aprofundamentos (abas) vivem no CENTRO.
export function PreReviewLeft() {
  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      {/* Identidade — topo: voltar + avatar + nome; detalhes na largura total abaixo
          (importantes na horizontal como chips; menos importantes na vertical). */}
      <ModuleCard>
        <div className="flex items-center gap-3">
          <BackButton />
          <Avatar name={PATIENT.name} seed={PATIENT.seed} size="md" className="h-12 w-12" />
          <span className="font-display text-body-l font-medium leading-tight text-ink text-balance">
            {PATIENT.name}
          </span>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/50 pt-3">
          {/* importantes — na horizontal */}
          <div className="flex flex-wrap items-center gap-1.5">
            <WireBadge>{PATIENT.age} anos</WireBadge>
            <WireBadge tone="soft">{PATIENT.cid}</WireBadge>
          </div>
          {/* menos importantes — na vertical */}
          <span className="text-caption text-neutral-700 text-pretty">{PATIENT.diagnosis}</span>
          <span className="text-micro text-neutral-500">{PATIENT.followUp}</span>
        </div>
      </ModuleCard>

      {/* Condições — detalhe do perfil, logo abaixo da identidade. */}
      <ModuleCard icon="bx-plus-medical" title="Condições" size="sm">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>Fibromialgia</WireBadge>
          <WireBadge>Dor crônica</WireBadge>
          <WireBadge>Ansiedade</WireBadge>
        </div>
      </ModuleCard>

      {/* Dados pessoais — detalhamento da pessoa. */}
      <ModuleCard icon="bx-id-card" title="Dados pessoais" size="sm">
        <InfoRows rows={PERSONAL} />
      </ModuleCard>

      {/* Contato e convênio. */}
      <ModuleCard icon="bx-phone" title="Contato e convênio" size="sm">
        <InfoRows rows={CONTACT} />
      </ModuleCard>
    </div>
  );
}

// CENTRO (coluna principal) — briefing no TOPO (com o CTA "Iniciar consulta") →
// alertas (horizontal) → indicadores (horizontal) → aprofundamentos em ABAS,
// preenchendo a altura. Abas fixas; conteúdo rola por dentro.
export function PreReviewCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [tab, setTab] = useState(TAB_SECTIONS[0].key);
  const active = TAB_SECTIONS.find((s) => s.key === tab) ?? TAB_SECTIONS[0];

  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      {/* Briefing de 60s — no topo do centro; NUNCA recolhido (sem chevron); CTA à direita. */}
      <ModuleCard
        icon="bx-time-five"
        eyebrow="Briefing · 60s"
        size="sm"
        aside={
          <WireButton
            variant="primary"
            size="sm"
            onClick={() => goTo("consult")}
            className="gap-2 whitespace-nowrap"
          >
            <Icon name="bx-video" className="text-base" />
            Iniciar consulta
          </WireButton>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-caption leading-relaxed text-neutral-700 text-pretty">
            Marina mantém dor lombar crônica refratária, hoje em
            <strong className="font-medium text-ink"> M3</strong> do episódio com CBD.
            Desde a última consulta houve melhora da dor (EVA 6 → 5) e do sono
            (PSQI 11 → 9), com desmame parcial de tramadol. Relata sonolência diurna
            leve a investigar.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/50 pt-3">
            <Eyebrow>Pré-anamnese</Eyebrow>
            <StatusChips active="respondida" />
          </div>
        </div>
      </ModuleCard>

      {/* Alertas pré-consulta — na horizontal, logo abaixo do briefing. */}
      <ModuleCard icon="bx-error-circle" title="Alertas pré-consulta" size="sm">
        <div className="grid grid-cols-3 gap-3">
          {ALERTS.map((a) => (
            <div
              key={a.text}
              className={cn(
                "glass-frost-inner flex flex-col gap-1.5 rounded-2xl px-3.5 py-3",
                a.tone === "hard" && "border border-state-hard/40",
              )}
            >
              <WireBadge tone={a.tone} className="self-start">{a.label}</WireBadge>
              <span className="text-caption text-neutral-700 text-pretty">{a.text}</span>
            </div>
          ))}
        </div>
      </ModuleCard>

      {/* Indicadores — na horizontal, logo abaixo dos alertas. */}
      <ModuleCard icon="bx-bar-chart-alt-2" title="Indicadores" size="sm">
        <div className="grid grid-cols-4 gap-3">
          {INDICATORS.map((it) => (
            <Stat
              key={it.label}
              value={it.value}
              label={it.label}
              hint={it.hint}
              className="glass-frost-inner rounded-2xl px-3.5 py-3"
            />
          ))}
        </div>
      </ModuleCard>

      <section className="glass-panel-blue backdrop-blur-2xl flex flex-col gap-4 rounded-[28px] p-6">
        <ScrollTabs options={TAB_OPTIONS} value={tab} onChange={setTab} />
        <div className="flex flex-col gap-4 border-t border-white/50 pt-5">
          {active.subtitle || active.extra ? (
            <div className="flex items-center justify-between gap-3">
              {active.subtitle ? (
                <p className="text-caption text-neutral-500 text-pretty">{active.subtitle}</p>
              ) : (
                <span aria-hidden />
              )}
              {active.extra ?? null}
            </div>
          ) : null}
          {active.content}
        </div>
      </section>
    </div>
  );
}
