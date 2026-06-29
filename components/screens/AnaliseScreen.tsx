"use client";

import { useState } from "react";
import { WireBadge, WireButton, Segmented, Icon } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";
import { AthenaTag } from "@/components/ui/AthenaTag";
import { SendToPatientPanel } from "./SendToPatientPanel";
import { cn } from "@/lib/cn";
import type { ScreenProps } from "./index";

// `analise` — Análise pós-chamada (módulo "Consulta e Análise"). Alcançada ao
// ENCERRAR a vídeo-chamada: o médico revisa e VALIDA o que a Athena preencheu
// (síntese pré-consulta + anamnese/exame em abas). Conteúdo/estrutura espelham a
// referência fornecida; visual segue o sistema atual (vidro/cinza, padrão pílula).
// O conteúdo clínico usa a paciente da referência (Cláudia).

/* ------------------------------ primitivos ------------------------------ */

function TabBar({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: string; label: string; attention?: boolean }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-white/50">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          aria-current={value === t.key ? "page" : undefined}
          className={cn(
            "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-caption transition-colors duration-[180ms]",
            value === t.key
              ? "border-ink font-medium text-ink"
              : "border-transparent text-neutral-500 hover:text-neutral-700",
          )}
        >
          {t.label}
          {t.attention ? (
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

// Campo empilhado: rótulo (mono micro) + marcador Athena opcional, valor embaixo.
function Field({
  label,
  athena,
  children,
}: {
  label: string;
  athena?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-dashed border-white/50 py-4 first:pt-0 last:border-0">
      <div className="flex items-center gap-2">
        <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
          {label}
        </span>
        {athena ? <AthenaTag /> : null}
      </div>
      <div className="text-body leading-relaxed text-neutral-700 text-pretty">
        {children}
      </div>
    </div>
  );
}

/* --------------------------- card Pré-Consulta --------------------------- */

const PRECONSULTA_TABS = [
  { key: "resumo", label: (<><Icon name="file" size={16} /> Resumo do caso</>) },
  {
    key: "escalas",
    label: (
      <>
        Escalas pré-preenchidas
        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white/60 px-1 font-mono text-[10px] text-neutral-600">
          0
        </span>
      </>
    ),
  },
  {
    key: "status",
    label: (<><Icon name="trending-up" size={16} /> Status Acompanhamento <span className="text-neutral-400">★★</span></>),
  },
] as const;

function PreConsultaCard() {
  const [tab, setTab] = useState<(typeof PRECONSULTA_TABS)[number]["key"]>("resumo");

  return (
    <CollapsibleCard
      icon="bx-bot"
      title="Pré-Consulta"
      subtitle="Síntese gerada pela Athena a partir da coleta pré-consulta · WhatsApp"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap">
          <Segmented options={PRECONSULTA_TABS as unknown as { key: string; label: React.ReactNode }[]} value={tab} onChange={(k) => setTab(k as typeof tab)} />
        </div>

        {tab === "resumo" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h4 className="text-body-l font-medium text-ink">
                Quem é Cláudia e o que traz à consulta?
              </h4>
              <AthenaTag />
            </div>
            <div className="flex flex-col gap-3 text-body leading-relaxed text-neutral-700 text-pretty">
              <p>
                <strong className="font-medium text-ink">Cláudia</strong> busca
                atendimento por: Fibromialgia, dores na coluna, dor constante no
                piriforme e psoas (lado esquerdo), insônia e dor ao acordar.
              </p>
              <p>
                Em uso atual: Miosan (antes de dormir), Duloxetina 60mg (pela
                manhã), Puran 88mg, Hidroclorotiazida 25mg, Corus 50mg, Rosucor
                10mg, Prosso D+ Km, Citroneurin Complexo B, Rybelsus 7mg.
              </p>
              <p>Cannabis medicinal: Nunca utilizou nenhum produto de cannabis.</p>
              <p>
                Expectativa: Dormir melhor, diminuir as dores e reduzir a
                quantidade de medicamentos em uso.
              </p>
              <p>
                Cláudia, paciente com fibromialgia e dor crônica musculoesquelética
                (coluna, piriforme e psoas à esquerda), com queixa de insônia e dor
                ao acordar. Já foi acompanhada na Clínica da Dor da Santa Casa de
                Porto Alegre sem resposta satisfatória às medicações anteriores.
                Atualmente em uso de Duloxetina 60mg e Miosan, além de medicações
                para hipotireoidismo, hipertensão, dislipidemia e provável
                diabetes/obesidade. Nunca utilizou cannabis. Expectativas: melhora
                do sono, redução da dor e simplificação do esquema medicamentoso.
              </p>
            </div>
          </div>
        ) : tab === "escalas" ? (
          <p className="text-caption text-neutral-500">
            Nenhuma escala pré-preenchida nesta coleta. As escalas para avaliar
            ficam na aba correspondente.
          </p>
        ) : (
          <div className="flex items-center gap-3 text-caption text-neutral-600">
            <span className="text-neutral-400">★★</span>
            <span>Acompanhamento em estágio inicial · 2 de 5 marcos.</span>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}

/* ----------------------- card Anamnese e exame --------------------------- */

const ANAMNESE_TABS = [
  { key: "anamnese", label: "Anamnese" },
  { key: "comorbidades", label: "Comorbidades & Medicamentos" },
  { key: "exame", label: "Exame Físico & Mental", attention: true },
  { key: "escalas", label: "Escalas para avaliar", attention: true },
  { key: "conduta", label: "Conduta & Plano Terapêutico" },
];

const VISIT_TYPES = [
  { key: "primeira", label: "1ª consulta" },
  { key: "seguimento", label: "Seguimento" },
  { key: "evento", label: "Evento" },
] as const;

function AnamneseExameCard({
  onSend,
  onContinue,
}: {
  onSend: () => void;
  onContinue?: () => void;
}) {
  const [tab, setTab] = useState<string>("anamnese");
  const [visit, setVisit] = useState<(typeof VISIT_TYPES)[number]["key"]>("primeira");

  return (
    <CollapsibleCard
      icon="bx-notepad"
      title="Anamnese e exame físico"
      headerExtra={
        <>
          <Segmented options={VISIT_TYPES as unknown as { key: string; label: React.ReactNode }[]} value={visit} onChange={(k) => setVisit(k as typeof visit)} />
          <button
            type="button"
            className="glass-frost-inner flex items-center gap-2 rounded-full px-3 py-1.5 text-caption text-neutral-700"
          >
            <Icon name="file-blank" size={16} className="text-neutral-500" />
            Template: —
            <Icon name="chevron-down" size={16} className="text-neutral-400" />
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TabBar tabs={ANAMNESE_TABS} value={tab} onChange={setTab} />

        {tab === "anamnese" ? (
          <div className="flex flex-col">
            <Field label="Queixa principal" athena>
              Insônia e dor difusa ao acordar; dor lombar e em piriforme/psoas à
              esquerda, constante, há meses.
            </Field>
            <Field label="História da doença atual" athena>
              Dor crônica musculoesquelética com piora noturna e ao frio,
              fragmentando o sono. Acompanhamento prévio na Clínica da Dor sem
              resposta satisfatória às medicações anteriores. Busca reduzir o
              esquema medicamentoso.
            </Field>
            <Field label="Hábitos e antecedentes">
              Nega tabagismo. Sono fragmentado com despertares. Nunca utilizou
              cannabis medicinal.
            </Field>
          </div>
        ) : tab === "comorbidades" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                Comorbidades
              </span>
              <div className="flex flex-wrap gap-1.5">
                <WireBadge>M79.7 · Fibromialgia</WireBadge>
                <WireBadge tone="mid">Hipotireoidismo</WireBadge>
                <WireBadge tone="mid">Hipertensão</WireBadge>
                <WireBadge tone="mid">Dislipidemia</WireBadge>
                <WireBadge tone="hard">Provável diabetes/obesidade</WireBadge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                  Medicações em uso
                </span>
                <AthenaTag />
              </div>
              <ul className="grid grid-cols-1 gap-1.5 font-mono text-caption text-neutral-700 sm:grid-cols-2">
                {[
                  "Miosan · antes de dormir",
                  "Duloxetina 60mg · manhã",
                  "Puran 88mcg",
                  "Hidroclorotiazida 25mg",
                  "Corus 50mg",
                  "Rosucor 10mg",
                  "Prosso D+ Km",
                  "Citroneurin Complexo B",
                  "Rybelsus 7mg",
                ].map((m) => (
                  <li key={m} className="glass-frost-inner rounded-xl px-3 py-2">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : tab === "exame" ? (
          <div className="flex flex-col">
            <Field label="Exame físico">
              A preencher pelo médico durante a validação. Sinais vitais e exame
              musculoesquelético pendentes.
            </Field>
            <Field label="Exame mental">
              Humor e afeto a registrar. Sono fragmentado relatado.
            </Field>
          </div>
        ) : tab === "escalas" ? (
          <div className="flex flex-col gap-2">
            <p className="text-caption text-neutral-600">
              Escalas sugeridas pela Athena para esta avaliação:
            </p>
            <ul className="flex flex-col gap-2">
              {[
                ["BPI", "Inventário breve de dor"],
                ["PSQI", "Qualidade do sono"],
                ["FIQ", "Impacto da fibromialgia"],
              ].map(([code, name]) => (
                <li
                  key={code}
                  className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5"
                >
                  <span className="text-caption text-neutral-700">
                    <strong className="font-medium text-ink">{code}</strong> · {name}
                  </span>
                  <WireBadge tone="mid">Pendente</WireBadge>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // Conduta & Plano Terapêutico — peças por-paciente reconciliadas das
          // antigas Notas clínicas (SOAP/CID/prescrição/envio).
          <div className="flex flex-col gap-5">
            <Field label="Conduta e plano terapêutico" athena>
              Iniciar canabinoide adjuvante com titulação lenta; desmame gradual do
              esquema atual conforme resposta; reforçar higiene do sono; retorno em
              30 dias.
            </Field>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                CID sugerido
              </span>
              <div className="flex flex-wrap gap-1.5">
                <WireBadge>M79.7 · Fibromialgia</WireBadge>
                <WireBadge tone="mid">G47.0 · Insônia</WireBadge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                  Prescrição
                </span>
                <AthenaTag />
              </div>
              <div className="glass-frost-inner flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5">
                <span className="text-caption text-neutral-700">
                  CBD 200mg/mL · iniciar 5–10 mg/dia
                </span>
                <WireBadge tone="mid">Controle especial</WireBadge>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/50 pt-4">
              <WireButton variant="secondary" onClick={onSend} className="gap-2">
                <Icon name="send" size={18} />
                Revisar e enviar ao paciente
              </WireButton>
              {onContinue ? (
                <WireButton variant="primary" onClick={onContinue} className="gap-2">
                  <Icon name="check-double" size={18} />
                  Encerrar e conferir
                </WireButton>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}

/* ------------------------------- exports -------------------------------- */

// CENTRO — análise pós-chamada (foco principal). `onContinue` (do grafo) encerra a
// validação e evolui para a Conferência (Documentos · T-11).
export function AnaliseCenter({ onContinue }: ScreenProps) {
  const [sendOpen, setSendOpen] = useState(false);

  return (
    <div className="relative h-full">
      <div className="no-scrollbar flex h-full flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
        <PreConsultaCard />
        <AnamneseExameCard onSend={() => setSendOpen(true)} onContinue={onContinue} />
      </div>

      <SendToPatientPanel open={sendOpen} onClose={() => setSendOpen(false)} />
    </div>
  );
}

// ESQUERDA — resumo do paciente (alimentado pela IA).
export function AnaliseLeft() {
  return (
    <div className="no-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pt-[88px] pb-6">
      <ModuleCard size="sm">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/50 bg-paper/60 font-display text-body-l font-medium text-ink">
            CL
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-display text-body-l font-medium leading-tight text-ink">
              Cláudia
            </span>
            <span className="font-mono text-micro text-neutral-500">
              Dor crônica · fibromialgia
            </span>
          </div>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Condições" icon="bx-pulse" size="sm">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>Fibromialgia</WireBadge>
          <WireBadge tone="mid">Insônia</WireBadge>
          <WireBadge tone="mid">Dor crônica</WireBadge>
        </div>
      </ModuleCard>

      <ModuleCard eyebrow="Expectativa · Athena" icon="bx-bot" size="md">
        <p className="text-caption text-neutral-700 text-pretty">
          Dormir melhor, reduzir as dores e simplificar o esquema medicamentoso
          (atualmente 9 medicações).
        </p>
      </ModuleCard>
    </div>
  );
}
