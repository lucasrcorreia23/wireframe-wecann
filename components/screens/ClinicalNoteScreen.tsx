"use client";

import { useState } from "react";
import { WireButton, WireBadge, WireTable } from "@/components/ui";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { cn } from "@/lib/cn";
import { SendToPatientPanel } from "./SendToPatientPanel";
import type { ScreenProps } from "./index";

// `clinical-note` — Notas clínicas. Hub do pós-consulta: resume numa única tela
// de rolagem tudo que importa ao médico — a nota gerada pela IA, as decisões e
// confirmações (controle especial, segurança Grau 3) como cards de revisão
// rápida, renovações e dúvidas/laudos — terminando no envio ao paciente com
// assinatura (modal). Layout modular (JourneyShell): KPIs à esquerda, Athena à
// direita, conteúdo ao centro. O scroll alimenta `viewScroll` → câmera desce e a
// orb sobe (imersão 3D que faltava na nota antiga).

// ── Nota SOAP (preenchida pela IA) ──────────────────────────────────────────────
const SOAP = [
  { label: "Subjetivo", text: "Dor lombar persistente, pior à noite; sono fragmentado." },
  { label: "Objetivo", text: "Mobilidade reduzida; sem sinais de alerta neurológico." },
  { label: "Avaliação", text: "Dor crônica nociplástica; perfil para canabinoide adjuvante." },
  { label: "Plano", text: "Introduzir CBD; reduzir tramadol gradual; reavaliar em 30 dias." },
];

const CIDS = [
  ["M54.5", "Dor lombar baixa"],
  ["M79.7", "Fibromialgia"],
  ["G47.0", "Insônia"],
];

const INSIGHTS = [
  "Investigar qualidade do sono nas últimas 2 semanas.",
  "Confirmar tentativas prévias de desmame de opioide.",
  "Sugerir escala de dor validada (PROM) no retorno.",
];

// ── Segurança clínica (relatos por gravidade) ───────────────────────────────────
const SAFETY = [
  { paciente: "Marina Castro", grau: "Grau 3", tone: "hard" as const, relato: "Sonolência intensa e queda relatada." },
  { paciente: "Rui Salgado", grau: "Grau 2", tone: "mid" as const, relato: "Náusea persistente após aumento de dose." },
  { paciente: "André Lobo", grau: "Grau 1", tone: "soft" as const, relato: "Boca seca leve, sem impacto funcional." },
];

// ── Itens gerados na consulta (checklist à esquerda) ────────────────────────────
const GENERATED = [
  "Nota clínica (SOAP)",
  "Prescrição · CBD 200mg/mL",
  "Receita de controle especial",
  "Atestado e laudo",
  "Retorno agendado · 19/07",
];

export function ClinicalNoteScreen({ onContinue }: ScreenProps) {
  const [sendOpen, setSendOpen] = useState(false);

  const left = (
    <>
      <ModuleCard icon="bx-user" title="Marina Castro">
        <div className="flex flex-col gap-2 text-caption text-neutral-600">
          <Row k="Idade" v="42 anos" />
          <Row k="Condição" v="Dor crônica nociplástica" />
          <Row k="Em uso" v="CBD 200mg/mL · 2×/dia" mono />
          <Row k="Retorno" v="19/07/2026 · Teleconsulta" />
        </div>
      </ModuleCard>

      <ModuleCard icon="bx-check-circle" title="Resumo da consulta">
        <ul className="flex flex-col gap-2">
          {GENERATED.map((g) => (
            <li key={g} className="flex items-start gap-2.5 text-caption text-neutral-700">
              <i className="bx bx-check mt-0.5 shrink-0 text-lg text-ink" />
              <span className="text-pretty">{g}</span>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </>
  );

  return (
    <JourneyShell
      left={left}
      overlay={<SendToPatientPanel open={sendOpen} onClose={() => setSendOpen(false)} />}
    >
      {/* Header — voltar inline + título; ações à direita (revisar/enviar + avançar). */}
      <ModuleCard>
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="h-10 w-px shrink-0 bg-neutral-300/70" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-body-l font-medium text-ink">
              Notas clínicas
            </span>
            <span className="truncate text-caption text-neutral-500">
              Tudo da consulta, revisado · preenchimento automático pela IA.
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <WireButton
              variant="secondary"
              size="sm"
              onClick={() => setSendOpen(true)}
              className="gap-1.5 whitespace-nowrap"
            >
              <i className="bx bx-send text-base" />
              Revisar e enviar
            </WireButton>
            {onContinue ? (
              <WireButton
                variant="primary"
                size="sm"
                onClick={onContinue}
                className="gap-1.5 whitespace-nowrap"
              >
                <i className="bx bx-bar-chart-alt-2 text-base" />
                Casuística
              </WireButton>
            ) : null}
          </div>
        </div>
      </ModuleCard>

      {/* ───────── Nota clínica (IA) ───────── */}
      <ModuleCard
        icon="bx-note"
        title="Nota clínica"
        aside={
          <div className="flex items-center gap-2">
            <WireBadge tone="soft">Modelo: Dor crônica</WireBadge>
            <WireBadge tone="neutral">Preenchida pela IA</WireBadge>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {SOAP.map((s) => (
            <NoteBlock key={s.label} label={s.label}>
              {s.text}
            </NoteBlock>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-2 gap-3">
          <div className="glass-frost-inner flex flex-col gap-2 rounded-2xl p-4">
            <Eyebrow icon="bx-bulb">Codificação (CID)</Eyebrow>
            <ul className="flex flex-col divide-y divide-white/50">
              {CIDS.map(([code, desc]) => (
                <li key={code} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="font-mono text-caption text-ink">{code}</span>
                  <span className="text-caption text-neutral-500">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-frost-inner flex flex-col gap-2 rounded-2xl p-4">
            <Eyebrow icon="bx-bulb">Perguntas-chave e insights</Eyebrow>
            <ul className="flex flex-col gap-2">
              {INSIGHTS.map((tip, i) => (
                <li key={i} className="flex gap-2 text-caption text-neutral-700">
                  <span className="font-mono text-neutral-400">{i + 1}.</span>
                  <span className="text-pretty">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ModuleCard>

      {/* ───────── Prescrição e conduta ───────── */}
      <ModuleCard
        icon="bx-capsule"
        title="Prescrição e conduta"
        aside={<WireBadge tone="mid">Interação</WireBadge>}
      >
        <div className="grid grid-cols-3 gap-3">
          <NoteBlock label="Medicamento">CBD 200mg/mL</NoteBlock>
          <NoteBlock label="Dose" mono>0,5 mL</NoteBlock>
          <NoteBlock label="Posologia" mono>2× ao dia</NoteBlock>
        </div>

        <div className="glass-frost-inner flex items-start gap-3 rounded-2xl p-3.5">
          <WireBadge tone="mid">Alerta</WireBadge>
          <p className="text-caption text-neutral-700 text-pretty">
            Interação potencial com amitriptilina — monitorar sedação. Exames:
            perfil hepático e hemograma completo.
          </p>
        </div>

        {/* Decisão gerada — controle especial (revisão rápida, sem ramificar). */}
        <div className="glass-frost-inner flex items-center justify-between gap-4 rounded-2xl border border-state-hard/40 p-3.5">
          <div className="flex items-center gap-3">
            <WireBadge tone="hard">Controle especial · confirmado</WireBadge>
            <span className="text-caption text-neutral-600 text-pretty">
              Receita de controle especial emitida e auditada.
            </span>
          </div>
          <span className="shrink-0 font-mono text-caption text-neutral-500">
            #AUD-2026-0619-0093
          </span>
        </div>
      </ModuleCard>

      {/* ───────── Segurança clínica ───────── */}
      <ModuleCard
        icon="bx-shield"
        title="Segurança clínica"
        aside={<WireBadge tone="hard">Grau 3 detectado</WireBadge>}
      >
        <ul className="flex flex-col gap-2">
          {SAFETY.map((r) => (
            <li
              key={r.paciente}
              className={cn(
                "glass-frost-inner flex items-center justify-between gap-4 rounded-2xl p-3.5",
                r.tone === "hard" && "border border-state-hard/40",
              )}
            >
              <div className="flex items-center gap-4">
                <WireBadge tone={r.tone}>{r.grau}</WireBadge>
                <div className="flex flex-col">
                  <span className="text-body font-medium text-ink">{r.paciente}</span>
                  <span className="text-caption text-neutral-600 text-pretty">
                    {r.relato}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Decisão gerada — Grau 3 → contato imediato (revisão rápida). */}
        <div className="glass-frost-inner flex flex-col gap-3 rounded-2xl border border-state-hard/40 p-4">
          <div className="flex items-center gap-2">
            <i className="bx bx-error-circle text-lg text-ink" />
            <span className="text-body font-medium text-ink">
              Grau 3 · contato imediato sugerido — Marina Castro
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Eyebrow>Mensagem ao paciente</Eyebrow>
              <p className="text-caption text-neutral-700 text-pretty">
                Identificamos um relato importante. Vamos ajustar sua conduta agora
                e entraremos em contato em seguida.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Eyebrow>Ajuste de conduta</Eyebrow>
              <p className="text-caption text-neutral-700 text-pretty">
                Suspender CBD 200mg/mL · orientar repouso e hidratação.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/50 pt-3">
            <span className="font-mono text-caption text-neutral-500">
              Evento registrado · #EV-2026-0619-0148
            </span>
            <WireButton variant="secondary" size="sm" className="gap-1.5">
              <i className="bx bx-message-rounded text-base" />
              Contatar agora
            </WireButton>
          </div>
        </div>
      </ModuleCard>

      {/* ───────── Renovação de receitas ───────── */}
      <ModuleCard
        icon="bx-refresh"
        title="Renovação de receitas"
        aside={<WireBadge tone="neutral">3 a expirar</WireBadge>}
      >
        <WireTable
          columns={[
            { key: "paciente", header: "Paciente" },
            { key: "medicamento", header: "Medicamento" },
            { key: "tipo", header: "Tipo" },
            { key: "expira", header: "Expira em", numeric: true, width: "120px" },
          ]}
          rows={[
            {
              paciente: "André Lobo",
              medicamento: "CBD 200mg/mL",
              tipo: <WireBadge tone="mid">Controle especial</WireBadge>,
              expira: "2 dias",
            },
            {
              paciente: "Júlia Tavares",
              medicamento: "THC:CBD 1:20",
              tipo: <WireBadge>Simples</WireBadge>,
              expira: "5 dias",
            },
            {
              paciente: "Rui Salgado",
              medicamento: "CBD 50mg/mL",
              tipo: <WireBadge tone="mid">Controle especial</WireBadge>,
              expira: "6 dias",
            },
          ]}
        />
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-caption text-neutral-500 text-pretty">
            2 receitas de controle especial exigem confirmação reforçada na assinatura.
          </span>
          <WireButton variant="secondary" size="sm" className="shrink-0">
            Renovar em lote
          </WireButton>
        </div>
      </ModuleCard>

      {/* ───────── Dúvidas e laudos ───────── */}
      <div className="grid grid-cols-2 gap-4">
        <ModuleCard icon="bx-help-circle" title="Dúvidas encaminhadas">
          <ul className="flex flex-col gap-2">
            {[
              ["Marina Castro", "Posso tomar com o anti-hipertensivo?", "soft"],
              ["Rui Salgado", "Receita venceu, como renovar?", "mid"],
              ["Júlia Tavares", "Efeito demora quanto para iniciar?", "soft"],
            ].map(([nome, q, tone]) => (
              <li
                key={nome}
                className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl p-3.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-body font-medium text-ink">{nome}</span>
                  <span className="truncate text-caption text-neutral-600">{q}</span>
                </div>
                <WireBadge tone={tone as "soft" | "mid"}>
                  {tone === "mid" ? "Atenção" : "Informativo"}
                </WireBadge>
              </li>
            ))}
          </ul>
        </ModuleCard>

        <ModuleCard icon="bx-file" title="Documentos e laudos">
          <ul className="flex flex-col gap-2">
            {["Relatório médico", "Declaração de uso contínuo", "Termo de consentimento"].map(
              (doc) => (
                <li
                  key={doc}
                  className="glass-frost-inner flex items-center gap-3 rounded-2xl p-3.5"
                >
                  <i className="bx bx-file shrink-0 text-lg text-neutral-500" />
                  <span className="flex-1 text-body text-neutral-700">{doc}</span>
                  <i className="bx bx-plus shrink-0 text-lg text-neutral-400" />
                </li>
              ),
            )}
          </ul>
        </ModuleCard>
      </div>

      {/* ───────── Encerramento · revisão e envio ───────── */}
      <ModuleCard icon="bx-send" title="Encerramento e envio ao paciente">
        <div className="grid grid-cols-2 gap-3">
          <NoteBlock label="Agendar retorno">19/07/2026 · Teleconsulta</NoteBlock>
          <NoteBlock label="Questionário (PROM)">Disparo automático · 7 dias</NoteBlock>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/50 pt-4">
          <span className="text-caption text-neutral-500 text-pretty">
            Revise os documentos e assine com certificado A3 para enviar ao paciente.
          </span>
          <WireButton
            variant="primary"
            onClick={() => setSendOpen(true)}
            className="shrink-0 gap-2"
          >
            <i className="bx bx-send text-lg" />
            Revisar e enviar ao paciente
          </WireButton>
        </div>
      </ModuleCard>
    </JourneyShell>
  );
}

// Bloco de texto preenchido pela IA (rótulo + conteúdo) no estilo de vidro fosco
// interno — substitui o WireField (paper) no contexto modular.
function NoteBlock({
  label,
  mono = false,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-frost-inner flex flex-col gap-1.5 rounded-2xl p-4">
      <Eyebrow>{label}</Eyebrow>
      <p className={cn("text-body text-ink text-pretty", mono && "font-mono")}>
        {children}
      </p>
    </div>
  );
}

// Linha chave-valor compacta (coluna esquerda).
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
