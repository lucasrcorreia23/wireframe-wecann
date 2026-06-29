"use client";

import { useState } from "react";
import { WireButton, WireBadge, Eyebrow, Segmented, Icon } from "@/components/ui";
import { AthenaTag } from "@/components/ui/AthenaTag";
import { cn } from "@/lib/cn";

// Aba "Conferência" de Documentos (T-11) — o passo de FECHAMENTO da consulta
// (briefing Atom6): o médico VALIDA, ponto a ponto, o que a Athena propôs vs. o que
// ele decidiu, e libera o sumário ao paciente (C2 leigo / C3 técnico). Foco em
// validação — não duplica o registro completo do Análise. Sem cor: divergência por
// peso/borda; ★ = qualidade de dado RWE.

type Decision = "pending" | "accepted" | "edited" | "rejected";

const DIVERGENCES: {
  topic: string;
  athena: string;
  why: string;
  confidence: string;
  critical?: boolean;
}[] = [
  {
    topic: "Codificação (CID)",
    athena: "Adicionar G47.0 · Insônia ao registro",
    why: "PSQI 9 e queixa de sono fragmentado relatada na pré-anamnese.",
    confidence: "confiança 82% · base interna",
  },
  {
    topic: "Prescrição",
    athena: "Titular CBD para 0,75 mL 2×/dia",
    why: "Resposta da dor (EVA 6→5) abaixo do MCID; há margem de bula.",
    confidence: "confiança 76% · Lexicomp",
  },
  {
    topic: "Interação",
    athena: "Sinaliza amitriptilina × CBD — risco de sedação",
    why: "Sonolência diurna leve já relatada (CTCAE Grau 1).",
    confidence: "confiança 87% · Lexicomp",
    critical: true,
  },
];

const SUMMARY = {
  c2: "Na consulta de hoje revisamos sua dor e seu sono — os dois melhoraram desde o último encontro. Vamos manter o canabidiol e seguir reduzindo o tramadol aos poucos. Você pode sentir um pouco de sonolência durante o dia; se piorar, me avise. Retorno em 30 dias, e um questionário chega pelo WhatsApp em 7 dias.",
  c3: "Paciente em M3 de episódio com CBD 200mg/mL para dor lombar crônica (M54.5). EVA 8→5 e PSQI 14→9 desde o baseline. Desmame de tramadol em curso. EA: sonolência diurna CTCAE Grau 1. Conduta: manter CBD, reforçar higiene do sono, reavaliar em M6. PROM por WhatsApp em D7.",
};

function DecisionNote({ decision }: { decision: Decision }) {
  if (decision === "pending") return null;
  const label =
    decision === "accepted" ? "Aceita" : decision === "edited" ? "Editada" : "Recusada";
  return (
    <span className="font-mono text-micro text-neutral-500">
      {label} às 14:35 · registrado em log de auditoria
    </span>
  );
}

function DivergenceRow({ d }: { d: (typeof DIVERGENCES)[number] }) {
  const [decision, setDecision] = useState<Decision>("pending");
  const [showWhy, setShowWhy] = useState(false);

  return (
    <li
      className={cn(
        "glass-frost-inner flex flex-col gap-3 rounded-2xl p-3.5",
        d.critical && "border border-state-hard/40",
        decision !== "pending" && "opacity-80",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Eyebrow>{d.topic}</Eyebrow>
            <AthenaTag />
          </div>
          <span className="text-body text-ink text-pretty">{d.athena}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setDecision("accepted")}
            aria-pressed={decision === "accepted"}
            aria-label="Aceitar"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border transition-colors",
              decision === "accepted"
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500",
            )}
          >
            <Icon name="check" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setDecision("edited")}
            aria-pressed={decision === "edited"}
            aria-label="Editar"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border transition-colors",
              decision === "edited"
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500",
            )}
          >
            <Icon name="pencil" size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDecision("rejected")}
            aria-pressed={decision === "rejected"}
            aria-label="Recusar"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border transition-colors",
              decision === "rejected"
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500",
            )}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/50 pt-2.5">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="inline-flex items-center gap-1.5 text-caption text-neutral-600 transition-colors hover:text-ink"
        >
          <Icon name="chevron-right" size={16} className={cn("transition-transform", showWhy && "rotate-90")} />
          por quê?
        </button>
        {decision === "pending" ? (
          <span className="font-mono text-micro text-neutral-500">{d.confidence}</span>
        ) : (
          <DecisionNote decision={decision} />
        )}
      </div>

      {showWhy ? (
        <div className="glass-frost-inner flex flex-col gap-1 rounded-xl px-3 py-2.5">
          <p className="text-caption text-neutral-700 text-pretty">{d.why}</p>
          <span className="font-mono text-micro text-neutral-500">{d.confidence}</span>
        </div>
      ) : null}
    </li>
  );
}

export function ConferenceReview({
  onSend,
  onContinue,
}: {
  onSend: () => void;
  onContinue?: () => void;
}) {
  const [reg, setReg] = useState<"c2" | "c3">("c2");

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho da visita · RWE. */}
      <div className="glass-frost-inner flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <WireBadge tone="soft">Episódio · CBD 200mg/mL</WireBadge>
          <WireBadge tone="mid">Visita · M3</WireBadge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-caption text-neutral-500">Completude do registro 88%</span>
          <span className="font-mono text-caption text-neutral-400" title="Qualidade de dados RWE">
            ★★☆
          </span>
        </div>
      </div>

      {/* Sumário compacto: anamnese + conduta + CIDs. */}
      <section className="grid grid-cols-2 gap-3">
        <div className="glass-frost-inner flex flex-col gap-1.5 rounded-2xl p-4">
          <Eyebrow icon="bx-notepad">Anamnese (resumo)</Eyebrow>
          <p className="text-caption text-neutral-700 text-pretty">
            Dor lombar crônica refratária com piora noturna e sono fragmentado;
            desmame de opioide em curso.
          </p>
        </div>
        <div className="glass-frost-inner flex flex-col gap-1.5 rounded-2xl p-4">
          <Eyebrow icon="bx-target-lock">Conduta</Eyebrow>
          <p className="text-caption text-neutral-700 text-pretty">
            Manter CBD; reforçar higiene do sono; reavaliar em 30 dias (M6).
          </p>
        </div>
        <div className="glass-frost-inner col-span-2 flex flex-col gap-2 rounded-2xl p-4">
          <Eyebrow icon="bx-bulb">Codificação (CID)</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            <WireBadge>M54.5 · Dor lombar baixa</WireBadge>
            <WireBadge>M79.7 · Fibromialgia</WireBadge>
            <WireBadge tone="mid">G47.0 · Insônia (sugerido)</WireBadge>
          </div>
        </div>
      </section>

      {/* Painel de divergências médico × IA. */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow icon="bx-git-compare">Conferência médico × Athena</Eyebrow>
          <span className="text-caption text-neutral-500">{DIVERGENCES.length} pontos a validar</span>
        </div>
        <ul className="flex flex-col gap-2">
          {DIVERGENCES.map((d) => (
            <DivergenceRow key={d.topic} d={d} />
          ))}
        </ul>
      </section>

      {/* Sumário ao paciente · C2 leigo / C3 técnico. */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow icon="bx-message-square-detail">Sumário ao paciente</Eyebrow>
          <Segmented
            options={[
              { key: "c2", label: "C2 · leigo" },
              { key: "c3", label: "C3 · técnico" },
            ]}
            value={reg}
            onChange={setReg}
          />
        </div>
        <div className="glass-frost-inner rounded-2xl p-4">
          <p className="text-body leading-relaxed text-neutral-700 text-pretty">
            {reg === "c2" ? SUMMARY.c2 : SUMMARY.c3}
          </p>
        </div>
      </section>

      {/* Encerramento. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/50 pt-4">
        <span className="text-caption text-neutral-500 text-pretty">
          Valide as divergências e libere o sumário ao paciente com assinatura.
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <WireButton variant="secondary" onClick={onSend} className="gap-2">
            <Icon name="send" size={18} />
            Revisar e enviar
          </WireButton>
          {onContinue ? (
            <WireButton variant="primary" onClick={onContinue} className="gap-2">
              <Icon name="check-double" size={18} />
              Confirmar e encerrar
            </WireButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
