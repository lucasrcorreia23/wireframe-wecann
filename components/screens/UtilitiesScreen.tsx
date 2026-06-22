"use client";

import { useState } from "react";
import { WireBadge, WireField, Stat, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

// `utilities` — Utilidades: Modelos, Financeiro e Contabilidade por abas.
const TABS = ["Modelos", "Financeiro", "Contabilidade"] as const;

export function UtilitiesScreen() {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex w-full max-w-[920px] flex-col gap-4">
      <ModuleCard className="gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex flex-col gap-1">
            <Eyebrow>Utilidades</Eyebrow>
            <h2 className="font-display text-title font-medium text-ink">
              Ferramentas da plataforma
            </h2>
          </div>
        </div>

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

        <div className="pt-1">
          {tab === 0 ? <Modelos /> : tab === 1 ? <Financeiro /> : <Contabilidade />}
        </div>
      </ModuleCard>
    </div>
  );
}

function Modelos() {
  const MODELS = [
    ["Anamnese · Dor crônica", "12 campos"],
    ["Nota SOAP · Reumatologia", "padrão"],
    ["Prescrição · Controle especial", "RDC 2024"],
    ["Laudo · Fibromialgia", "modelo"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {MODELS.map(([name, meta]) => (
        <div
          key={name}
          className="glass-frost-inner flex flex-col gap-1 rounded-2xl px-4 py-3"
        >
          <span className="text-body font-medium text-ink">{name}</span>
          <span className="font-mono text-micro text-neutral-500">{meta}</span>
        </div>
      ))}
    </div>
  );
}

function Financeiro() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Stat value="R$ 18,4k" label="Recebido · mês" />
        <Stat value="R$ 3,2k" label="A receber" />
        <Stat value="42" label="Consultas" />
      </div>
      <div className="flex flex-col divide-y divide-white/40">
        {[
          ["Consulta · Marina Castro", "R$ 450 · pago"],
          ["Retorno · André Lobo", "R$ 280 · pago"],
          ["Teleconsulta · Júlia Tavares", "R$ 320 · pendente"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-body text-ink">{k}</span>
            <span className="font-mono text-caption text-neutral-500">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Contabilidade() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <WireBadge tone="mid">Competência 06/2026</WireBadge>
        <WireBadge tone="neutral">NF-e emitidas: 38</WireBadge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <WireField label="Regime" value="Simples Nacional" />
        <WireField label="Impostos estimados" value="R$ 1.840,00" mono />
        <WireField label="Próximo vencimento" value="20/07/2026" mono />
        <WireField label="Contador" value="Escritório Andrade" />
      </div>
    </div>
  );
}
