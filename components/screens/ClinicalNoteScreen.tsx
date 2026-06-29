"use client";

import { useState } from "react";
import { WireButton, WireBadge, Avatar, ScrollTabs, AcceptField, Eyebrow, type Decision, Icon } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";
import { SendToPatientPanel } from "./SendToPatientPanel";

// `clinical-note` — Documento da consulta / Conferência (T-11), padrão de MÓDULO
// (Centro/Esquerda). É o ÚNICO passo pós-chamada: ao encerrar a vídeo-chamada o
// médico cai aqui e VALIDA, seção a seção, o que a Athena preencheu. Mesma régua
// visual do Paciente 360 (perfil + pílulas/abas com scroll), mas como superfície de
// ACEITE: cada pílula tem "Aceitar seção" (em lote, com alerta) e cada campo o trio
// Aceitar/Editar/Rejeitar no hover. Sem cor — peso de cinza.

type Field = {
  key: string;
  label: string;
  value: React.ReactNode;
  /** Sugestão da IA (default true) → ganha controles de aceite. false = a preencher/emitir. */
  ai?: boolean;
};

type Section = {
  key: string;
  label: string;
  icon: string;
  subtitle?: string;
  fields: Field[];
};

// As pílulas = seções clínicas do documento (conteúdo migrado de Análise +
// Notas clínicas + Conferência, sob a paciente Marina Castro).
const SECTIONS: Section[] = [
  {
    key: "anamnese",
    label: "Anamnese",
    icon: "bx-notepad",
    subtitle: "Queixa, história e antecedentes extraídos da consulta",
    fields: [
      { key: "queixa", label: "Queixa principal", value: "Dor lombar persistente, pior à noite; sono fragmentado." },
      { key: "hda", label: "História da doença atual", value: "Dor crônica nociplástica com piora noturna e ao frio; desmame de opioide em curso; resposta parcial às terapias anteriores." },
      { key: "habitos", label: "Hábitos e antecedentes", value: "Nega tabagismo. Sono fragmentado com despertares. Nunca utilizou cannabis medicinal." },
    ],
  },
  {
    key: "comorbidades",
    label: "Comorbidades & Medicamentos",
    icon: "bx-plus-medical",
    subtitle: "Condições associadas e esquema em uso",
    fields: [
      {
        key: "comorbidades",
        label: "Comorbidades",
        value: (
          <div className="flex flex-wrap gap-1.5">
            <WireBadge>Fibromialgia</WireBadge>
            <WireBadge>Dor crônica</WireBadge>
            <WireBadge>Ansiedade</WireBadge>
          </div>
        ),
      },
      {
        key: "medicacoes",
        label: "Medicações em uso",
        value: (
          <ul className="flex flex-col gap-0.5 font-mono text-caption text-neutral-700">
            <li>Tramadol 50mg · em desmame</li>
            <li>Amitriptilina 25mg · à noite</li>
            <li>CBD 200mg/mL · 0,5 mL 2×/dia</li>
            <li>Vitamina D 7.000UI · semanal</li>
          </ul>
        ),
      },
    ],
  },
  {
    key: "exame",
    label: "Exame físico & mental",
    icon: "bx-body",
    subtitle: "A completar pelo médico — sugestões da IA marcadas",
    fields: [
      { key: "sugestao", label: "Sugestão de exame", value: "Avaliar pontos dolorosos (critério ACR) e amplitude de movimento lombar." },
      { key: "fisico", label: "Exame físico", ai: false, value: "A preencher — sinais vitais e exame musculoesquelético." },
      { key: "mental", label: "Exame mental", ai: false, value: "A preencher — humor e afeto. Sono fragmentado relatado." },
    ],
  },
  {
    key: "escalas",
    label: "Escalas",
    icon: "bx-line-chart",
    subtitle: "Escalas sugeridas e evolução longitudinal",
    fields: [
      {
        key: "sugeridas",
        label: "Escalas sugeridas",
        value: (
          <ul className="flex flex-col gap-1">
            {[
              ["BPI", "Inventário breve de dor"],
              ["PSQI", "Qualidade do sono"],
              ["FIQ", "Impacto da fibromialgia"],
            ].map(([code, name]) => (
              <li key={code} className="flex items-center gap-2 text-caption text-neutral-700">
                <strong className="font-medium text-ink">{code}</strong>
                <span className="text-neutral-500">{name}</span>
                <WireBadge tone="soft" className="ml-auto">Pendente</WireBadge>
              </li>
            ))}
          </ul>
        ),
      },
      { key: "evolucao", label: "Evolução", value: "EVA 8 → 5 e PSQI 14 → 9 desde o baseline (M0 → M3)." },
    ],
  },
  {
    key: "conduta",
    label: "Conduta & Plano",
    icon: "bx-target-lock",
    subtitle: "Avaliação e plano terapêutico",
    fields: [
      { key: "conduta", label: "Conduta e plano terapêutico", value: "Manter CBD; reforçar higiene do sono; reduzir tramadol gradual; reavaliar em 30 dias (M6)." },
      { key: "avaliacao", label: "Avaliação (A)", value: "Dor crônica nociplástica; perfil para canabinoide adjuvante." },
      { key: "plano", label: "Plano (P)", value: "Manter CBD; desmame gradual de tramadol; reavaliar em 30 dias." },
    ],
  },
  {
    key: "prescricao",
    label: "Prescrição & CID",
    icon: "bx-capsule",
    subtitle: "Prescrição, ajustes e codificação",
    fields: [
      { key: "prescricao", label: "Prescrição", value: "CBD 200mg/mL · 0,5 mL 2×/dia · controle especial." },
      { key: "ajuste", label: "Ajuste sugerido", value: "Titular CBD para 0,75 mL 2×/dia — resposta da dor abaixo do MCID, com margem de bula." },
      {
        key: "cid",
        label: "CID sugerido",
        value: (
          <div className="flex flex-wrap gap-1.5">
            <WireBadge>M54.5 · Dor lombar baixa</WireBadge>
            <WireBadge>M79.7 · Fibromialgia</WireBadge>
            <WireBadge tone="mid">G47.0 · Insônia (novo)</WireBadge>
          </div>
        ),
      },
      { key: "interacao", label: "Interação", value: "Amitriptilina × CBD — risco de sedação; monitorar sonolência diurna." },
    ],
  },
  {
    key: "documentos",
    label: "Documentos",
    icon: "bx-file",
    subtitle: "Emissão e encerramento",
    fields: [
      {
        key: "gerados",
        label: "Documentos gerados",
        ai: false,
        value: (
          <ul className="flex flex-col gap-1">
            {[
              "Nota clínica (SOAP)",
              "Receita · CBD 200mg/mL (controle especial)",
              "Atestado e laudo",
              "Solicitação de exames",
            ].map((d) => (
              <li key={d} className="flex items-center gap-2 text-caption text-neutral-700">
                <Icon name="check" size={16} className="text-ink" />
                <span className="text-pretty">{d}</span>
              </li>
            ))}
          </ul>
        ),
      },
      { key: "retorno", label: "Retorno", ai: false, value: "19/07/2026 · Teleconsulta." },
      { key: "prom", label: "Questionário (PROM)", ai: false, value: "Disparo automático · 7 dias." },
    ],
  },
];

const aiFieldsOf = (s: Section) => s.fields.filter((f) => f.ai !== false);
const fieldId = (sKey: string, fKey: string) => `${sKey}:${fKey}`;

function sectionComplete(s: Section, decisions: Record<string, Decision>) {
  const ai = aiFieldsOf(s);
  return ai.length > 0 && ai.every((f) => decisions[fieldId(s.key, f.key)] === "accepted");
}

// ESQUERDA — paciente + resumo da consulta (saídas geradas).
export function ClinicalNoteLeft() {
  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      <ModuleCard icon="bx-user" title="Marina Castro" size="sm">
        <div className="flex flex-col gap-2 text-caption text-neutral-600">
          <Row k="Idade" v="38 anos" />
          <Row k="Condição" v="Dor lombar crônica" />
          <Row k="Em uso" v="CBD 200mg/mL · 2×/dia" mono />
          <Row k="Retorno" v="19/07/2026 · Teleconsulta" />
        </div>
      </ModuleCard>

      <ModuleCard icon="bx-check-circle" title="Resumo da consulta" size="sm">
        <ul className="flex flex-col gap-2">
          {[
            "Nota clínica (SOAP)",
            "Prescrição · CBD 200mg/mL",
            "Receita de controle especial",
            "Atestado e laudo",
            "Retorno agendado · 19/07",
          ].map((g) => (
            <li key={g} className="flex items-start gap-2.5 text-caption text-neutral-700">
              <Icon name="check" size={18} className="mt-0.5 text-ink" />
              <span className="text-pretty">{g}</span>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </div>
  );
}

// CENTRO — documento da consulta em pílulas, com aceite por seção e por campo.
export function ClinicalNoteCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [tab, setTab] = useState(SECTIONS[0].key);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [confirmTab, setConfirmTab] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);

  const active = SECTIONS.find((s) => s.key === tab) ?? SECTIONS[0];
  const aiFields = aiFieldsOf(active);
  const acceptedInTab = aiFields.filter(
    (f) => decisions[fieldId(active.key, f.key)] === "accepted",
  ).length;

  const totalAi = SECTIONS.reduce((n, s) => n + aiFieldsOf(s).length, 0);
  const totalAccepted = SECTIONS.reduce(
    (n, s) =>
      n + aiFieldsOf(s).filter((f) => decisions[fieldId(s.key, f.key)] === "accepted").length,
    0,
  );

  const setDecision = (id: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: d }));

  const acceptSection = (s: Section) => {
    setDecisions((prev) => {
      const next = { ...prev };
      aiFieldsOf(s).forEach((f) => {
        next[fieldId(s.key, f.key)] = "accepted";
      });
      return next;
    });
    setConfirmTab(null);
  };

  // Aba ganha ✓ quando todas as sugestões da seção foram aceitas.
  const tabOptions = SECTIONS.map((s) => ({
    key: s.key,
    label: s.label,
    icon: sectionComplete(s, decisions) ? "bx-check-circle" : s.icon,
  }));

  return (
    <div className="relative h-full">
      <div className="no-scrollbar flex h-full flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
        {/* Cabeçalho de perfil — espelha o Paciente 360. */}
        <ModuleCard>
          <div className="flex items-center gap-4">
            <BackButton />
            <Avatar name="Marina Castro" seed="marina" size="md" className="h-14 w-14" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-display text-title font-medium leading-tight text-ink">
                Marina Castro
              </span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-neutral-500">
                <span>Documento da consulta</span>
                <span aria-hidden className="text-neutral-300">·</span>
                <span>{totalAccepted}/{totalAi} sugestões aceitas</span>
              </div>
            </div>
            <WireButton
              variant="primary"
              onClick={() => setSendOpen(true)}
              className="ml-auto shrink-0 gap-2 whitespace-nowrap"
            >
              <Icon name="send" size={18} />
              Revisar e enviar
            </WireButton>
          </div>
        </ModuleCard>

        {/* Pílulas + conteúdo da seção ativa. */}
        <section className="glass-panel-blue backdrop-blur-2xl flex flex-col gap-4 rounded-[28px] p-6">
          <ScrollTabs options={tabOptions} value={tab} onChange={setTab} />

          <div className="flex flex-col gap-4 border-t border-white/50 pt-5">
            {/* Header da seção: título + Aceitar seção + contador. */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="flex items-center gap-2 text-body-l font-medium text-ink">
                  <Icon name={active.icon} size={16} className="text-neutral-400" />
                  {active.label}
                </h3>
                {active.subtitle ? (
                  <p className="text-caption text-neutral-500 text-pretty">{active.subtitle}</p>
                ) : null}
              </div>
              {aiFields.length ? (
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="font-mono text-micro text-neutral-500">
                    {acceptedInTab}/{aiFields.length} aceitos
                  </span>
                  <WireButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmTab(active.key)}
                    className="gap-1.5"
                  >
                    <Icon name="check-double" size={16} />
                    Aceitar seção
                  </WireButton>
                </div>
              ) : null}
            </div>

            {/* Alerta de confirmação do aceite em lote. */}
            {confirmTab === active.key ? (
              <div className="glass-frost-inner flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-state-hard/30 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Icon name="error-circle" size={18} className="text-neutral-500" />
                  <span className="text-caption text-neutral-700 text-pretty">
                    Aceitar todas as {aiFields.length} sugestões de{" "}
                    <strong className="font-medium text-ink">{active.label}</strong>?
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <WireButton variant="ghost" size="sm" onClick={() => setConfirmTab(null)}>
                    Cancelar
                  </WireButton>
                  <WireButton
                    variant="primary"
                    size="sm"
                    onClick={() => acceptSection(active)}
                    className="gap-1.5"
                  >
                    <Icon name="check" size={16} />
                    Confirmar
                  </WireButton>
                </div>
              </div>
            ) : null}

            {/* Campos da seção. */}
            <div className="flex flex-col gap-2.5">
              {active.fields.map((f) =>
                f.ai === false ? (
                  <div
                    key={f.key}
                    className="glass-frost-inner flex flex-col gap-1.5 rounded-2xl p-3.5"
                  >
                    <Eyebrow>{f.label}</Eyebrow>
                    <div className="text-body text-neutral-700 text-pretty">{f.value}</div>
                  </div>
                ) : (
                  <AcceptField
                    key={f.key}
                    label={f.label}
                    decision={decisions[fieldId(active.key, f.key)] ?? "pending"}
                    onDecision={(d) => setDecision(fieldId(active.key, f.key), d)}
                  >
                    {f.value}
                  </AcceptField>
                ),
              )}
            </div>

            {/* Encerramento (na seção Documentos). */}
            {active.key === "documentos" ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/50 pt-4">
                <span className="text-caption text-neutral-500 text-pretty">
                  Revise os documentos e assine com certificado A3 para enviar ao paciente.
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <WireButton variant="secondary" onClick={() => setSendOpen(true)} className="gap-2">
                    <Icon name="send" size={18} />
                    Revisar e enviar
                  </WireButton>
                  <WireButton variant="primary" onClick={() => goTo("messages")} className="gap-2">
                    <Icon name="check-double" size={18} />
                    Encerrar consulta
                  </WireButton>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <SendToPatientPanel open={sendOpen} onClose={() => setSendOpen(false)} />
    </div>
  );
}

/* ------------------------------- helpers -------------------------------- */

function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
        {k}
      </span>
      <span className={cn("text-right text-caption text-ink text-pretty", mono && "font-mono")}>
        {v}
      </span>
    </div>
  );
}
