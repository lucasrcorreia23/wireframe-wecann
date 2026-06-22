"use client";

import { useState } from "react";
import { WireBadge, WireButton, WireField, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { cn } from "@/lib/cn";
import type { ScreenProps } from "./index";

const TABS = ["Transcrição", "Nota clínica", "Prescrição", "Exames"] as const;

// `consult` — Tela de consulta: vídeo do paciente + conteúdo em ABAS ao centro,
// módulos complementares à esquerda, copiloto de IA à direita (AIDock).
export function ConsultScreen({ onContinue }: ScreenProps) {
  const [tab, setTab] = useState(0);

  const left = (
    <>
      <ModuleCard eyebrow="Paciente 360" title="Resumo clínico">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Condições e alergias</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              <WireBadge>Fibromialgia</WireBadge>
              <WireBadge tone="hard">Dipirona</WireBadge>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Medicações ativas</Eyebrow>
            <ul className="font-mono text-caption text-neutral-700">
              <li>Tramadol 50mg · 2×/dia</li>
              <li>Amitriptilina 25mg · noite</li>
            </ul>
          </div>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Histórico" title="Timeline e exames">
        <div className="glass-frost-inner flex h-14 items-center rounded-xl px-3">
          <span className="font-mono text-micro text-neutral-500">
            ●──●──● ressonância · hemograma
          </span>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Cabeçalho" title="Resumo da pré-consulta">
        <p className="text-caption text-neutral-700">
          Dor lombar refratária há 14 meses · tramadol + amitriptilina · busca
          reduzir opioides.
        </p>
      </ModuleCard>
    </>
  );

  return (
    <JourneyShell left={left}>
      {/* Cabeçalho da consulta + avanço */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex flex-col">
            <Eyebrow>Consulta</Eyebrow>
            <span className="text-body-l font-medium text-ink">
              Marina Castro · em andamento
            </span>
          </div>
        </div>
        <WireButton variant="primary" onClick={onContinue}>
          Continuar →
        </WireButton>
      </div>

      {/* Vídeo da consulta */}
      <ModuleCard className="gap-2">
        <div className="flex items-center justify-between">
          <Eyebrow>Tela da consulta</Eyebrow>
          <WireBadge tone="mid">Ao vivo</WireBadge>
        </div>
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[18px] border border-white/40 bg-neutral-800">
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-paper/90" />
            <span className="font-mono text-micro uppercase tracking-[0.1em] text-paper/80">
              Transcrevendo
            </span>
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-paper/50 text-paper/80">
              <i className="bx bx-play text-2xl" />
            </span>
          </div>
          <span className="absolute bottom-3 left-3 font-mono text-micro text-paper/70">
            Marina Castro · sala 2
          </span>
        </div>
      </ModuleCard>

      {/* Abas com o conteúdo da consulta */}
      <ModuleCard className="min-h-0 flex-1">
        <div role="tablist" className="flex gap-1 border-b border-white/40">
          {TABS.map((t, i) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-caption transition-colors duration-[180ms]",
                tab === i
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-neutral-500 hover:text-neutral-700",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="pt-1">{renderTab(tab)}</div>
      </ModuleCard>
    </JourneyShell>
  );
}

function renderTab(tab: number) {
  if (tab === 0) return <Transcricao />;
  if (tab === 1) return <NotaClinica />;
  if (tab === 2) return <Prescricao />;
  return <Exames />;
}

function Transcricao() {
  return (
    <div className="flex flex-col gap-3">
      {[
        ["Médica", "Como tem sido a dor desde a última visita?"],
        ["Paciente", "Continua forte à noite, atrapalha o sono."],
        ["Médica", "E o tramadol, está ajudando no controle?"],
        ["Paciente", "Ajuda um pouco, mas queria reduzir."],
      ].map(([who, line], i) => (
        <div key={i} className="flex gap-3">
          <span className="w-20 shrink-0 font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">
            {who}
          </span>
          <p className="text-body text-neutral-700">{line}</p>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-2 border-t border-white/40 pt-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-state-mid" />
        <span className="font-mono text-micro text-neutral-500">
          Capturando — somente do modelo selecionado
        </span>
      </div>
    </div>
  );
}

function NotaClinica() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WireField label="Subjetivo" placeholder="Queixa e relato do paciente…" area />
      <WireField label="Objetivo" placeholder="Achados ao exame…" area />
      <WireField label="Avaliação" placeholder="Hipóteses e CID…" area />
      <WireField label="Plano" placeholder="Conduta e próximos passos…" area />
    </div>
  );
}

function Prescricao() {
  return (
    <div className="flex flex-col gap-3">
      {[
        ["Óleo CBD 200mg/mL", "Titular · controle especial"],
        ["Amitriptilina 25mg", "Manter · 1×/noite"],
      ].map(([med, meta]) => (
        <div
          key={med}
          className="glass-frost-inner flex items-center justify-between rounded-xl px-3 py-2.5"
        >
          <span className="text-body text-ink">{med}</span>
          <span className="font-mono text-caption text-neutral-500">{meta}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-caption text-neutral-600">
        <WireBadge tone="hard">Alerta</WireBadge>
        Interação: tramadol + amitriptilina (serotoninérgica).
      </div>
    </div>
  );
}

function Exames() {
  return (
    <div className="flex flex-col gap-2">
      {["Hemograma completo", "Função hepática", "Dosagem de vitamina D"].map(
        (ex) => (
          <div
            key={ex}
            className="glass-frost-inner flex items-center justify-between rounded-xl px-3 py-2"
          >
            <span className="text-caption text-neutral-700">{ex}</span>
            <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
              Solicitar
            </span>
          </div>
        ),
      )}
    </div>
  );
}
