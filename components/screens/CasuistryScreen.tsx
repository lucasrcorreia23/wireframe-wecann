"use client";

import { useState } from "react";
import { AppScreen, ScreenHeader, Eyebrow, Chip, KpiCard, WireButton, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

// `casuistry` — Casuística. Painel analítico da prática clínica do próprio médico
// (página única, leitura). Conteúdo conforme contrato CASUISTICA §6. Monocromático:
// gráficos em barras CSS (sem Recharts), categorias por rótulo/peso de cinza; o
// acento crítico aparece só em insight crítico. Separação retrospectivo×prospectivo
// sempre evidente ("DADOS HISTÓRICOS").

/* ============================ DADOS (mock) ============================ */

const CIDS = [
  { code11: "ME84.2", code10: "M54.5", desc: "Dor lombar baixa (crônica)", n: 38, pct: 30 },
  { code11: "MG30.0", code10: "M79.7", desc: "Fibromialgia", n: 27, pct: 21 },
  { code11: "6B00", code10: "F41.1", desc: "Ansiedade generalizada", n: 19, pct: 15 },
  { code11: "7A00", code10: "G47.0", desc: "Insônia", n: 14, pct: 11 },
  { code11: "8A80", code10: "G44.2", desc: "Cefaleia tensional", n: 11, pct: 9 },
  { code11: "MB47", code10: "R52", desc: "Dor crônica não especificada", n: 9, pct: 7 },
];

const TREATMENTS = [
  { name: "CBD isolado", indication: "Dor crônica · sono", n: 41, category: "Cannabis" },
  { name: "CBD : THC 20:1", indication: "Dor neuropática", n: 22, category: "Cannabis" },
  { name: "Amitriptilina", indication: "Dor · sono", n: 18, category: "Medicamento" },
  { name: "Fisioterapia motora", indication: "Reabilitação lombar", n: 15, category: "Reabilitação" },
  { name: "Acupuntura", indication: "Dor miofascial", n: 9, category: "Integrativa" },
];

const TREAT_CATEGORIES = ["Todos", "Cannabis", "Medicamento", "Reabilitação", "Integrativa"] as const;

const AGE_HISTOGRAM = [
  { label: "18–29", count: 12 },
  { label: "30–39", count: 24 },
  { label: "40–49", count: 31 },
  { label: "50–59", count: 28 },
  { label: "60–69", count: 19 },
  { label: "70+", count: 14 },
];

const VOLUME = [
  { label: "jul", count: 6 },
  { label: "ago", count: 9 },
  { label: "set", count: 11 },
  { label: "out", count: 14 },
  { label: "nov", count: 13 },
  { label: "dez", count: 17 },
  { label: "jan", count: 19 },
  { label: "fev", count: 22 },
];

const INSIGHTS: { type: "teal" | "amber" | "red"; badge: string; title: string; body: string }[] = [
  { type: "teal", badge: "Resposta", title: "CBD em dor lombar", body: "78% dos pacientes em CBD para dor lombar atingiram MCID na EVA em até 3 meses." },
  { type: "amber", badge: "Aderência", title: "Titulação", body: "12 pacientes estão há mais de 60 dias na mesma dose — considerar reavaliar titulação." },
  { type: "red", badge: "Segurança", title: "Sem evolução", body: "5 pacientes sem evolução registrada há mais de 90 dias — priorizar contato." },
];

const QUALITY_RETRO = [
  { level: "A", label: "Estruturado", n: 18 },
  { level: "B", label: "Parcial", n: 24 },
  { level: "C", label: "Mínimo", n: 16 },
  { level: "D", label: "Raso / quarentena", n: 7 },
];

const QUALITY_PROSP = [
  { level: "★★★", n: 22 },
  { level: "★★☆", n: 17 },
  { level: "★☆☆", n: 8 },
];

const OUTCOMES = [
  { label: "Melhora", n: 34 },
  { label: "Parcial", n: 18 },
  { label: "Sem melhora", n: 7 },
  { label: "Inconclusivo", n: 5 },
];

const MILESTONES = [
  { threshold: 25, label: "Iniciante", achieved: true },
  { threshold: 50, label: "Praticante", achieved: true },
  { threshold: 100, label: "Experiente", achieved: false },
  { threshold: 200, label: "Referência", achieved: false },
];
const CURRENT_LEVEL = "Praticante";

/* ============================ ÁTOMOS ============================ */

function Section({
  title,
  eyebrow,
  aside,
  children,
}: {
  title?: string;
  eyebrow?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-[#f9f9f9] p-5">
      {(title || aside) && (
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            {title ? <h3 className="font-display text-body-l font-medium text-ink">{title}</h3> : null}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

// Barra horizontal (CID / tratamento) — trilho cinza + preenchimento ink.
function HBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
      <div className="h-full rounded-full bg-ink" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

// Colunas verticais (histograma) — altura proporcional.
function VBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-2" style={{ height: 140 }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-micro text-neutral-500">{d.count}</span>
          <div
            className="w-full rounded-t-[4px] bg-neutral-400"
            style={{ height: `${(d.count / max) * 96}px` }}
          />
          <span className="truncate font-mono text-micro text-neutral-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================ TELA ============================ */

export function CasuistryCenter() {
  const [codeSystem, setCodeSystem] = useState<"icd11" | "icd10">("icd11");
  const [cat, setCat] = useState<(typeof TREAT_CATEGORIES)[number]>("Todos");

  const cidMax = Math.max(...CIDS.map((c) => c.n));
  const treatments = cat === "Todos" ? TREATMENTS : TREATMENTS.filter((t) => t.category === cat);
  const treatMax = Math.max(...TREATMENTS.map((t) => t.n));
  const outcomeMax = Math.max(...OUTCOMES.map((o) => o.n));
  const qRetroMax = Math.max(...QUALITY_RETRO.map((q) => q.n));
  const qProspMax = Math.max(...QUALITY_PROSP.map((q) => q.n));
  const progressPct = 50;

  return (
    <AppScreen>
      <ScreenHeader
        title="Casuística"
        subtitle="Dra. Helena Prado · CRM-SP 123456"
        actions={
          <>
            <WireButton variant="ghost" className="opacity-40">
              Compartilhar minha prática
            </WireButton>
            <WireButton variant="secondary">Análise completa</WireButton>
            <WireButton variant="ghost" className="opacity-40">
              Exportar coorte
            </WireButton>
            <WireButton variant="primary">Coparticipação científica</WireButton>
          </>
        }
      />

      {/* Faixa-resumo. */}
      <div className="flex items-center gap-4 rounded-[20px] bg-ink px-5 py-4 text-paper">
        <Icon name="insights" size={22} />
        <p className="flex-1 text-body text-pretty">
          <strong className="font-medium">128 pacientes</strong> em{" "}
          <strong className="font-medium">14 meses</strong> de seguimento ativo
        </p>
        <span className="font-mono text-caption text-paper/70">81 prospectivos · 47 históricos</span>
      </div>

      {/* Síntese. */}
      <Section>
        <div className="flex items-start gap-3">
          <span className="frost-inset grid h-10 w-10 shrink-0 place-items-center rounded-full text-neutral-600">
            <Icon name="neurology" size={20} />
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-body leading-relaxed text-neutral-700 text-pretty">
              Sua prática concentra-se em <strong className="text-ink">dor crônica</strong>,{" "}
              <strong className="text-ink">fibromialgia</strong> e{" "}
              <strong className="text-ink">ansiedade</strong>, com{" "}
              <strong className="text-ink">63%</strong> dos casos em coleta prospectiva — base sólida
              para evidência de mundo real.
            </p>
            <button
              type="button"
              className="self-start font-mono text-micro uppercase tracking-[0.08em] text-neutral-500 hover:text-ink"
            >
              Ver análise completa →
            </button>
          </div>
        </div>
      </Section>

      {/* KPIs. */}
      <div className="flex flex-wrap gap-3">
        <KpiCard icon="groups" label="Pacientes ativos" value="128" hint="+4 esta semana · 81 prosp. / 47 hist." />
        <KpiCard icon="cake" label="Idade média" value="44.2a" hint="mediana 43 · IQR 33–55" />
        <KpiCard icon="wc" label="Feminino : masculino" value="62 : 38" hint="proporção da coorte" />
        <KpiCard icon="timeline" label="Seguimento mediano" value="12 m" hint="coorte longitudinal consolidada" />
      </div>

      {/* CIDs + Tratamentos. */}
      <div className="flex flex-wrap gap-4">
        <Section
          title="CIDs mais frequentes"
          aside={
            <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 p-1">
              {(["icd11", "icd10"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCodeSystem(s)}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-micro transition-colors",
                    codeSystem === s ? "bg-paper text-ink shadow-[var(--shadow-tab)]" : "text-neutral-500",
                  )}
                >
                  {s === "icd11" ? "CID-11" : "CID-10"}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {CIDS.map((c) => (
              <div key={c.code10} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-caption font-medium text-ink">
                    {codeSystem === "icd11" ? c.code11 : c.code10}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-caption text-neutral-600">{c.desc}</span>
                  <span className="font-mono text-micro text-neutral-500">
                    {c.n} · {c.pct}%
                  </span>
                </div>
                <HBar value={c.n} max={cidMax} />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Tratamentos mais frequentes"
          aside={
            <div className="flex flex-wrap items-center gap-1.5">
              {TREAT_CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCat(c)}>
                  <Chip tone={cat === c ? "inset" : "muted"}>{c}</Chip>
                </button>
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {treatments.map((t) => (
              <div key={t.name} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-caption font-medium text-ink">{t.name}</span>
                  <Chip tone="muted">{t.category}</Chip>
                  <span className="min-w-0 flex-1 truncate text-micro text-neutral-500">{t.indication}</span>
                  <span className="font-mono text-micro text-neutral-500">{t.n}</span>
                </div>
                <HBar value={t.n} max={treatMax} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Gráficos. */}
      <div className="flex flex-wrap gap-4">
        <Section title="Distribuição etária">
          <VBars data={AGE_HISTOGRAM} />
          <p className="text-caption text-neutral-500">61% dos pacientes têm ≥45 anos.</p>
        </Section>
        <Section title="Volume mensal">
          <VBars data={VOLUME} />
          <p className="text-caption text-neutral-500">Crescimento de 38% em 12 meses.</p>
        </Section>
      </div>

      {/* Insights da Athena. */}
      <Section title="Insights Athena desta semana" eyebrow={`${INSIGHTS.length} novos · gerado em 27/06`}>
        <div className="flex flex-wrap gap-3">
          {INSIGHTS.map((it) => (
            <div
              key={it.title}
              className={cn(
                "flex min-w-[240px] flex-1 flex-col gap-1.5 rounded-[16px] bg-paper p-4 shadow-[0_4px_13.5px_rgba(0,0,0,0.05)]",
                it.type === "red" && "border-l-2 border-l-critical",
              )}
            >
              <Eyebrow>{it.badge}</Eyebrow>
              <span className="text-caption font-medium text-ink">{it.title}</span>
              <p className="text-caption text-neutral-600 text-pretty">{it.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Qualidade da casuística. */}
      <Section title="Qualidade da casuística">
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-[260px] flex-1 flex-col gap-3">
            <div className="flex items-center gap-2">
              <Eyebrow>Base retrospectiva</Eyebrow>
              <Chip tone="inset">Dados históricos</Chip>
            </div>
            <div className="flex flex-col gap-2">
              {QUALITY_RETRO.map((q) => (
                <div key={q.level} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 font-mono text-caption font-medium text-ink">{q.level}</span>
                  <span className="w-28 shrink-0 truncate text-micro text-neutral-500">{q.label}</span>
                  <div className="min-w-0 flex-1">
                    <HBar value={q.n} max={qRetroMax} />
                  </div>
                  <span className="font-mono text-micro text-neutral-500">{q.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-[260px] flex-1 flex-col gap-3">
            <Eyebrow>Base prospectiva</Eyebrow>
            <div className="flex flex-col gap-2">
              {QUALITY_PROSP.map((q) => (
                <div key={q.level} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-caption text-ink">{q.level}</span>
                  <div className="min-w-0 flex-1">
                    <HBar value={q.n} max={qProspMax} />
                  </div>
                  <span className="font-mono text-micro text-neutral-500">{q.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="border-t border-neutral-200/60 pt-3 text-micro text-neutral-400">
          Dados históricos (importados) e prospectivos usam escalas de qualidade diferentes e nunca
          são somados num mesmo gráfico.
        </p>
      </Section>

      {/* Marcos científicos. */}
      <Section title="Marcos científicos">
        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-[260px] flex-1 flex-col gap-3">
            <Eyebrow>Outcomes de cannabis</Eyebrow>
            <div className="flex flex-col gap-2">
              {OUTCOMES.map((o) => (
                <div key={o.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-caption text-neutral-600">{o.label}</span>
                  <div className="min-w-0 flex-1">
                    <HBar value={o.n} max={outcomeMax} />
                  </div>
                  <span className="font-mono text-micro text-neutral-500">{o.n}</span>
                </div>
              ))}
            </div>
            <p className="text-caption text-neutral-500">74% de resposta positiva entre avaliáveis.</p>
          </div>

          <div className="flex min-w-[260px] flex-1 flex-col gap-3">
            <Eyebrow>Progressão</Eyebrow>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-caption text-neutral-600">Faltam 50 episódios para Experiente</span>
                <span className="font-mono text-micro text-neutral-500">{progressPct}%</span>
              </div>
              <HBar value={progressPct} max={100} />
            </div>
            <div className="flex flex-wrap gap-2">
              {MILESTONES.map((m) => {
                const current = m.label === CURRENT_LEVEL;
                return (
                  <div
                    key={m.label}
                    className={cn(
                      "flex flex-col gap-0.5 rounded-[14px] border px-3 py-2",
                      current
                        ? "border-ink bg-paper"
                        : m.achieved
                          ? "border-neutral-200 bg-paper"
                          : "border-dashed border-neutral-200 bg-transparent opacity-60",
                    )}
                  >
                    <span className="font-mono text-micro text-neutral-400">{m.threshold} ep.</span>
                    <span className="flex items-center gap-1 text-caption font-medium text-ink">
                      {m.achieved ? <Icon name="check" size={16} className="text-neutral-500" /> : null}
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Coparticipação científica. */}
      <Section>
        <div className="flex items-center gap-4">
          <span className="frost-inset grid h-11 w-11 shrink-0 place-items-center rounded-full text-neutral-600">
            <Icon name="handshake" size={22} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="font-display text-body-l font-medium text-ink">
              Estudos que você pode participar
            </h3>
            <p className="text-caption text-neutral-600 text-pretty">
              Participe de estudos prospectivos multicêntricos e contribua para a evidência de mundo
              real em cannabis medicinal.
            </p>
          </div>
          <span className="flex-1" />
          <div className="flex shrink-0 items-center gap-2">
            <WireButton variant="secondary">Como funciona</WireButton>
            <WireButton variant="primary">Quero participar</WireButton>
          </div>
        </div>
      </Section>
    </AppScreen>
  );
}
