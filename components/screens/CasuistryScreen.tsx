"use client";

import { useState } from "react";
import {
  WireButton,
  WireBadge,
  Stat,
  Eyebrow,
  WireTabs,
  WireTable,
} from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { cn } from "@/lib/cn";
import { CasuistryDetailPanel, type CasuistryDetail } from "./CasuistryDetailPanel";
import type { ScreenProps } from "./index";

// `casuistry` — Casuística e evolução. O conteúdo (rico) é organizado em 4 ABAS na
// coluna central; os KPIs ficam persistentes à esquerda e a Athena (AIDock) à
// direita (JourneyShell). Linhas das tabelas abrem um painel de detalhe (overlay).
// Sem barra "Continuar": o acesso ao Relatório final é um CTA do header
// (onContinue → report), ao lado das ações Compartilhar / Exportar.

const TABS = [
  "Visão geral",
  "Diagnósticos & tratamentos",
  "Insights & qualidade",
  "Ciência",
];

// ── Coluna esquerda (persistente) ──────────────────────────────────────────────
const KPIS = [
  { value: "102", label: "Pacientes ativos", hint: "+5 esta semana · 400 prosp / 205 hist" },
  { value: "42.5 a", label: "Idade média", hint: "mediana 42 · IQR 29–57" },
  { value: "48:52", label: "Feminino : masculino", hint: "em linha com epidemio neuro" },
  { value: "3 m", label: "Seguimento mediano", hint: "coorte longitudinal consolidada" },
];

// ── Aba 1 — Visão geral ─────────────────────────────────────────────────────────
const AGE_BARS = [
  { faixa: "0-17", h: 3 },
  { faixa: "18-29", h: 9 },
  { faixa: "30-44", h: 14 },
  { faixa: "45-59", h: 12 },
  { faixa: "60-74", h: 11 },
  { faixa: "75+", h: 4 },
];
const MONTH_BARS = [
  { mes: "Fev", h: 9 },
  { mes: "Mar", h: 14 },
  { mes: "Abr", h: 13 },
  { mes: "Mai", h: 14 },
  { mes: "Jun", h: 3 },
];

// ── Aba 2 — Diagnósticos & tratamentos ──────────────────────────────────────────
type CidRow = {
  code: string;
  condition: string;
  n: string;
  pct: string;
  summary: string;
  points: string[];
};
const CIDS: CidRow[] = [
  {
    code: "6B00",
    condition: "Transtorno de ansiedade generalizada",
    n: "50",
    pct: "3.3%",
    summary:
      "Maior domínio da casuística. Coorte com volume suficiente para análise observacional STROBE.",
    points: [
      "GAD-7 respondido no fechamento da maioria das visitas.",
      "Coorte com potencial publicável (n ≥ 50).",
      "Predomínio de seguimento prospectivo.",
    ],
  },
  {
    code: "6A7Z",
    condition: "F32.9 Episódio depressivo NE",
    n: "43",
    pct: "2.8%",
    summary:
      "Segundo domínio mais frequente, com sobreposição relevante a quadros ansiosos.",
    points: [
      "Acompanhamento com PHQ-9 em escala crescente.",
      "Comorbidade frequente com 6B00.",
      "Boa adesão ao seguimento mensal.",
    ],
  },
  {
    code: "8A6Z",
    condition: "Epilepsia",
    n: "18",
    pct: "1.2%",
    summary:
      "Coorte neurológica com uso de antiepilépticos e canabinoides como adjuvante.",
    points: [
      "Monitorização de crises por diário do paciente.",
      "Uso associado a vigabatrina e valproato.",
      "Rastreio hepático recomendado.",
    ],
  },
  {
    code: "6A02.Z",
    condition: "Transtorno do espectro autista",
    n: "18",
    pct: "1.2%",
    summary: "Coorte pediátrica/adulta com foco em sintomas associados.",
    points: [
      "Desfechos de sono e irritabilidade acompanhados.",
      "Resposta a CBD em sintomas-alvo.",
      "Seguimento longitudinal em construção.",
    ],
  },
  {
    code: "8A00.0Z",
    condition: "Doença de Parkinson",
    n: "18",
    pct: "1.2%",
    summary: "Coorte de distúrbio do movimento sob esquema com levodopa.",
    points: [
      "Avaliação motora por escala dedicada.",
      "Uso de levodopa + carbidopa como base.",
      "Coerente com o perfil etário (≥45 anos).",
    ],
  },
];

type TreatRow = {
  drug: string;
  klass: string;
  n: string;
  tag: "MEDICAMENTO" | "CANNABIS";
  summary: string;
  points: string[];
};
const TREATMENTS: TreatRow[] = [
  {
    drug: "Clonazepam 0,5mg",
    klass: "Benzodiazepínico · ATC N03AE01",
    n: "103",
    tag: "MEDICAMENTO",
    summary: "Tratamento mais frequente, associado aos quadros ansiosos da coorte.",
    points: [
      "Uso predominante em ansiedade generalizada.",
      "Atenção a dependência em uso prolongado.",
      "Candidato a desmame apoiado por canabinoides.",
    ],
  },
  {
    drug: "Levodopa + Carbidopa 250/62,5mg",
    klass: "Antiparkinsoniano · ATC N04BA02",
    n: "101",
    tag: "MEDICAMENTO",
    summary: "Base do tratamento da coorte de doença de Parkinson.",
    points: [
      "Esquema fixo na maioria dos casos.",
      "Resposta motora acompanhada por escala.",
      "Sem interações relevantes registradas.",
    ],
  },
  {
    drug: "Escitalopram 10mg",
    klass: "ISRS · ATC N06AB10",
    n: "101",
    tag: "MEDICAMENTO",
    summary: "Antidepressivo de primeira linha nos episódios depressivos.",
    points: [
      "Associado a F32.9 e quadros mistos.",
      "Boa tolerabilidade na coorte.",
      "Seguimento com PHQ-9.",
    ],
  },
  {
    drug: "Ácido valproico",
    klass: "Anticonvulsivante · ATC N03AG01",
    n: "100",
    tag: "MEDICAMENTO",
    summary: "Uso ativo relevante — gatilho do alerta de rastreio hepático.",
    points: [
      "100 pacientes em uso ativo.",
      "Verificar ALT/AST dos últimos 6 meses.",
      "Monitorar interações com canabinoides.",
    ],
  },
  {
    drug: "Cannabis medicinal (óleo CBD/THC)",
    klass: "Cannabis sublingual",
    n: "100",
    tag: "CANNABIS",
    summary: "Coorte de canabinoides com a melhor taxa de resposta avaliável.",
    points: [
      "98 pacientes com desfecho avaliável.",
      "91% com resposta positiva (sucesso + parcial).",
      "Titulação start low, go slow.",
    ],
  },
];

// ── Aba 3 — Insights & qualidade ────────────────────────────────────────────────
type Tone = "neutral" | "soft" | "mid" | "hard";
const INSIGHTS: { tone: Tone; tag: string; title: string; desc: string }[] = [
  {
    tone: "mid",
    tag: "Destaque",
    title: "Cannabis · resposta robusta na sua coorte",
    desc: "98 pacientes com desfecho avaliável. 91% com resposta positiva (sucesso + sucesso parcial). Casos sem follow-up conclusivo não entram no cálculo.",
  },
  {
    tone: "soft",
    tag: "Análise",
    title: "Ansiedade generalizada · coorte com potencial publicável",
    desc: "50 pacientes com este diagnóstico. Coorte elegível para análise STROBE observacional.",
  },
  {
    tone: "hard",
    tag: "Alerta",
    title: "Ácido valproico · rastreio hepático pendente",
    desc: "100 pacientes em uso ativo de valproato. Verificar ALT/AST dos últimos 6 meses.",
  },
  {
    tone: "neutral",
    tag: "Estável",
    title: "Volume de atendimentos · tendência nos últimos 3 meses",
    desc: "Média de 115 atendimentos/mês nos últimos 3 meses.",
  },
];

const RETRO = [
  { label: "A · Estruturado", pct: 100 },
  { label: "B · Parcial", pct: 0 },
  { label: "C · Mínimo", pct: 0 },
  { label: "D · Raso", pct: 0 },
];
const PROSPECT = [
  { label: "★★★", pct: 25 },
  { label: "★★☆", pct: 0 },
  { label: "★☆☆", pct: 75 },
];

// ── Aba 4 — Ciência ─────────────────────────────────────────────────────────────
const MILESTONES = [
  { n: "50", label: "Com rigor", done: true },
  { n: "100", label: "Investigador", done: true },
  { n: "250", label: "Pesquisadora", done: true },
  { n: "500", label: "Sênior", done: false, hint: "Faltam 194" },
];

export function CasuistryScreen({ onContinue }: ScreenProps) {
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState<CasuistryDetail | null>(null);
  const [cidFilter, setCidFilter] = useState(0);
  const [treatFilter, setTreatFilter] = useState(0);

  const openCid = (row: CidRow) =>
    setDetail({
      kind: "cid",
      code: row.code,
      title: row.condition,
      meta: `${row.n} casos · ${row.pct} da casuística`,
      summary: row.summary,
      points: row.points,
    });
  const openTreat = (row: TreatRow) =>
    setDetail({
      kind: "treatment",
      code: row.klass,
      title: row.drug,
      meta: `${row.n} pacientes em uso ativo`,
      summary: row.summary,
      points: row.points,
    });

  const left = (
    <>
      <ModuleCard icon="bx-bar-chart-alt-2" title="Indicadores gerais">
        <div className="flex flex-col gap-4">
          {KPIS.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} hint={s.hint} />
          ))}
        </div>
      </ModuleCard>

      <ModuleCard icon="bx-collection" title="Maturidade da coorte">
        <p className="text-caption text-neutral-600 text-pretty">
          400 episódios prospectivos · 205 históricos.{" "}
          <span className="font-medium text-ink">66%</span> da casuística em
          coleta prospectiva ativa.
        </p>
      </ModuleCard>
    </>
  );

  return (
    <JourneyShell
      left={left}
      overlay={
        <CasuistryDetailPanel detail={detail} onClose={() => setDetail(null)} />
      }
    >
      {/* Header — voltar inline + título; ações à direita. */}
      <ModuleCard>
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="h-10 w-px shrink-0 bg-neutral-300/70" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-body-l font-medium text-ink">
              Casuística e evolução
            </span>
            <span className="truncate text-caption text-neutral-500">
              Outcomes por condição em padrão internacional.
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Compartilhar"
              title="Compartilhar minha prática"
              className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
            >
              <i className="bx bx-share-alt text-xl" />
            </button>
            <button
              type="button"
              aria-label="Exportar coorte"
              title="Exportar coorte"
              className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
            >
              <i className="bx bx-export text-xl" />
            </button>
            {onContinue ? (
              <WireButton
                variant="primary"
                size="sm"
                onClick={onContinue}
                className="gap-1.5 whitespace-nowrap"
              >
                <i className="bx bx-file text-base" />
                Gerar relatório
              </WireButton>
            ) : null}
          </div>
        </div>
      </ModuleCard>

      {/* Abas — trocam o conteúdo da coluna central. */}
      <WireTabs tabs={TABS} active={tab} onChange={setTab} className="px-1" />

      {/* ───────────── Aba 1 — Visão geral ───────────── */}
      {tab === 0 ? (
        <>
          <ModuleCard
            icon="bx-bulb"
            title="Casuística madura, com sinal estatístico em duas frentes"
          >
            <p className="text-body text-neutral-700 text-pretty">
              A distribuição clínica concentra-se em três domínios:{" "}
              <span className="font-medium text-ink">
                Transtorno de ansiedade generalizada
              </span>{" "}
              (6B00, n=50),{" "}
              <span className="font-medium text-ink">F32.9 Episódio depressivo</span>{" "}
              (6A7Z, n=43) e{" "}
              <span className="font-medium text-ink">Epilepsia</span> (8A6Z, n=18).
              400 episódios (66%) em coleta prospectiva.
            </p>
            <p className="mt-2 text-caption italic text-neutral-500">
              Estes não são apenas números — são a evidência longitudinal de uma
              prática clínica madura.
            </p>
          </ModuleCard>

          <div className="grid grid-cols-2 gap-4">
            <ModuleCard icon="bx-bar-chart-alt-2" title="Distribuição etária">
              <BarChart bars={AGE_BARS.map((b) => b.h)} labels={AGE_BARS.map((b) => b.faixa)} />
              <p className="mt-2 text-caption text-neutral-500">
                45% dos pacientes têm ≥45 anos · N=102.
              </p>
            </ModuleCard>
            <ModuleCard icon="bx-line-chart" title="Volume mensal">
              <BarChart bars={MONTH_BARS.map((b) => b.h)} labels={MONTH_BARS.map((b) => b.mes)} />
              <p className="mt-2 text-caption text-neutral-500">
                Variação −79% em 12 meses · período de transição.
              </p>
            </ModuleCard>
          </div>
        </>
      ) : null}

      {/* ───────────── Aba 2 — Diagnósticos & tratamentos ───────────── */}
      {tab === 1 ? (
        <>
          <ModuleCard
            icon="bx-pulse"
            title="CIDs mais frequentes"
            aside={
              <Segmented
                options={["Top 10", "CID-11", "CID-10"]}
                value={cidFilter}
                onChange={setCidFilter}
              />
            }
          >
            <WireTable
              columns={[
                { key: "code", header: "CID" },
                { key: "condition", header: "Condição" },
                { key: "n", header: "N", numeric: true },
                { key: "pct", header: "%", numeric: true },
              ]}
              rows={CIDS.map((c) => ({
                code: <span className="font-mono text-neutral-600">{c.code}</span>,
                condition: c.condition,
                n: c.n,
                pct: c.pct,
              }))}
              onRowClick={(_, i) => openCid(CIDS[i])}
            />
          </ModuleCard>

          <ModuleCard
            icon="bx-capsule"
            title="Tratamentos mais frequentes"
            aside={
              <Segmented
                options={["Todos", "Medic.", "Cannabis"]}
                value={treatFilter}
                onChange={setTreatFilter}
              />
            }
          >
            <WireTable
              columns={[
                { key: "drug", header: "Tratamento" },
                { key: "klass", header: "Classe" },
                { key: "n", header: "N", numeric: true },
                { key: "tag", header: "" },
              ]}
              rows={TREATMENTS.map((t) => ({
                drug: t.drug,
                klass: (
                  <span className="text-caption text-neutral-500">{t.klass}</span>
                ),
                n: t.n,
                tag: (
                  <WireBadge tone={t.tag === "CANNABIS" ? "mid" : "neutral"}>
                    {t.tag}
                  </WireBadge>
                ),
              }))}
              onRowClick={(_, i) => openTreat(TREATMENTS[i])}
            />
          </ModuleCard>
        </>
      ) : null}

      {/* ───────────── Aba 3 — Insights & qualidade ───────────── */}
      {tab === 2 ? (
        <>
          <ModuleCard
            icon="bx-bulb"
            title="Insights Athena"
            aside={<WireBadge tone="mid">4 novos</WireBadge>}
          >
            <ul className="flex flex-col gap-2">
              {INSIGHTS.map((it) => (
                <li
                  key={it.title}
                  className="glass-frost-inner flex flex-col gap-1.5 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <WireBadge tone={it.tone}>{it.tag}</WireBadge>
                    <span className="text-body font-medium text-ink text-pretty">
                      {it.title}
                    </span>
                  </div>
                  <p className="text-caption text-neutral-600 text-pretty">
                    {it.desc}
                  </p>
                </li>
              ))}
            </ul>
          </ModuleCard>

          <ModuleCard icon="bx-shield-quarter" title="Qualidade da sua casuística">
            <p className="text-caption text-neutral-500 text-pretty">
              Letras A–D medem dados históricos; estrelas medem processo
              prospectivo. Os dois sistemas nunca se misturam em análises.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex flex-col gap-2">
                <Eyebrow>Retrospectiva · 205 registros</Eyebrow>
                {RETRO.map((r) => (
                  <QualityRow key={r.label} label={r.label} pct={r.pct} />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Eyebrow>Prospectiva · 400 episódios</Eyebrow>
                {PROSPECT.map((p) => (
                  <QualityRow key={p.label} label={p.label} pct={p.pct} />
                ))}
              </div>
            </div>
          </ModuleCard>
        </>
      ) : null}

      {/* ───────────── Aba 4 — Ciência ───────────── */}
      {tab === 3 ? (
        <>
          <ModuleCard icon="bx-trophy" title="Marcos científicos · sua trajetória">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="text-body font-medium text-ink">
                  Nível atual: Pesquisadora
                </span>
                <span className="text-caption text-neutral-500">
                  306 episódios contribuídos · 0 publicação
                </span>
              </div>
              <span className="font-mono text-title tabular-nums text-ink">
                61%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/40">
              <div
                className="h-full rounded-full bg-ink/70"
                style={{ width: "61%" }}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MILESTONES.map((m) => (
                <div
                  key={m.n}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl p-3 text-center",
                    m.done
                      ? "glass-frost-inner"
                      : "border border-dashed border-white/60",
                  )}
                >
                  <span className="font-mono text-body-l tabular-nums text-ink">
                    {m.n}
                  </span>
                  <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                    {m.label}
                  </span>
                  <span className="text-micro text-neutral-500">
                    {m.done ? "✓ atingido" : m.hint}
                  </span>
                </div>
              ))}
            </div>
          </ModuleCard>

          <ModuleCard icon="bx-group" title="Coparticipação científica">
            <p className="text-body text-neutral-700 text-pretty">
              Sua casuística já vale — e pode valer mais. O WeCann Care está abrindo
              coparticipação em estudos prospectivos multicêntricos. Cada visita
              registrada com ★★☆ ou ★★★, cada escala respondida e cada evento adverso
              codificado em MedDRA constrói a base que te coloca como investigadora
              elegível, com autoria pelos critérios ICMJE.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <WireButton variant="primary" size="sm" className="gap-2">
                <i className="bx bx-user-plus text-base" />
                Quero participar
              </WireButton>
              <WireButton variant="ghost" size="sm" className="gap-2">
                <i className="bx bx-info-circle text-base" />
                Como funciona
              </WireButton>
            </div>
          </ModuleCard>
        </>
      ) : null}
    </JourneyShell>
  );
}

// Filtro segmentado inline (mock) — padrão do ConsultScreen, em pílulas mono.
function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/40 p-1">
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange(i)}
          aria-pressed={value === i}
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-micro uppercase tracking-[0.08em] transition-colors duration-[180ms]",
            value === i
              ? "bg-paper text-ink shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// Gráfico de barras simples (mock) — altura relativa ao maior valor.
function BarChart({ bars, labels }: { bars: number[]; labels: string[] }) {
  const max = Math.max(...bars, 1);
  return (
    <div>
      <div className="flex h-32 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end">
            <div
              className="rounded-sm bg-white/60"
              style={{ height: `${(h / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {labels.map((l) => (
          <span
            key={l}
            className="flex-1 text-center font-mono text-micro text-neutral-500"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// Barra de qualidade (rótulo + barra + %) — usada na aba Insights & qualidade.
function QualityRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-caption text-neutral-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/40">
        <div
          className="h-full rounded-full bg-ink/70"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-caption tabular-nums text-ink">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
