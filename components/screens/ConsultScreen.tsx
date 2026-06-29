"use client";

import { useState } from "react";
import { Avatar, Chip, Eyebrow, Icon, WireButton, Segmented } from "@/components/ui";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// `consult` — Consulta ao Vivo. Tela de 2 zonas: COLUNA PRINCIPAL (seções
// empilhadas) + ASIDE ATHENA (360px, colapsável p/ 56px). Autocontida (o shell não
// renderiza a Athena overlay aqui). Conteúdo conforme contrato CONSULTA_AO_VIVO §6.
// Monocromático + 1 acento crítico; ícones SVG (lucide); larguras flex.

/* ============================ DADOS (mock) ============================ */

type Mode = "primeira" | "seguimento" | "evento";
type Layout = "classic" | "soap";

const CLASSIC_TABS = ["Segmento", "Comorbidades", "Resultados", "Escalas", "Conduta"];
const SOAP_TABS = ["S · Subjetivo", "O · Objetivo", "A · Avaliação", "P · Plano"];

const QPHDA_BULLETS: { text: string; source: "ia" | "human"; status: "suggested" | "accepted" }[] = [
  { text: "Dor lombar crônica refratária há 14 meses, irradiação para MID.", source: "human", status: "accepted" },
  { text: "Melhora da dor desde a última consulta (EVA 6 → 5).", source: "ia", status: "accepted" },
  { text: "Sonolência diurna leve após aumento do CBD — investigar.", source: "ia", status: "suggested" },
];

const CIAP = [
  { code: "L03", desc: "Sinais/sintomas lombares", confidence: 88, validated: true },
  { code: "P06", desc: "Distúrbio do sono", confidence: 74, validated: false },
];

const PROBLEMS = [
  { title: "Dor lombar crônica", ciap: "L84", cid: "M54.5", status: "ativo", age: "há 14m" },
  { title: "Insônia", ciap: "P06", cid: "G47.0", status: "ativo", age: "há 1a" },
  { title: "Tabagismo", ciap: "P17", cid: "—", status: "resolvido", age: "há 3a" },
];

const ALERTS = [{ level: "Crítico", n: 1 }, { level: "Alto", n: 2 }, { level: "Médio", n: 3 }];

const ATH_CATEGORIES = [
  { icon: "bulb", label: "Sugestão", text: "Considerar reduzir dose noturna de CBD pela sonolência." },
  { icon: "line-chart", label: "Escala", text: "PSQI vencida — reaplicar neste timepoint." },
  { icon: "shield", label: "Checagem", text: "Interação CBD × depressores do SNC — monitorar sedação." },
  { icon: "error", label: "Evento", text: "Sonolência diurna (CTCAE Grau 1) relatada." },
  { icon: "git-compare", label: "Interação", text: "Tramadol + amitriptilina — risco serotoninérgico baixo." },
  { icon: "book-open", label: "Literatura", text: "CBD em dor lombar crônica · Pain Med 2024 · RS." },
];

const EXAM_GROUPS = [
  { group: "Laboratoriais", tag: "1 pendente", items: ["Hemograma", "Perfil hepático", "Função renal"] },
  { group: "Imagem", tag: "normais", items: ["RM lombar", "Raio-X lombar"] },
  { group: "Funcionais", tag: "—", items: ["ENMG MMII"] },
];

const PREV_VISITS = [
  { date: "19/06/2026", kind: "Retorno · M3", badge: "SOAP assinado", scale: "EVA 5" },
  { date: "04/03/2026", kind: "Retorno · M1", badge: "SOAP assinado", scale: "EVA 6" },
  { date: "28/08/2025", kind: "Consulta baseline", badge: "Sem SOAP", scale: "EVA 8" },
];

const DOC_TYPES = ["Prescrição", "Atestado", "Exames", "Laudo", "Encaminhamento"];

/* ============================ SEÇÃO ============================ */

function Section({ icon, title, aside, children }: { icon: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[20px] bg-[#f9f9f9] p-5">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={18} className="text-neutral-500" />
        <h3 className="font-display text-body-l font-medium text-ink">{title}</h3>
        {aside ? <div className="flex flex-1 items-center justify-end gap-2">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

/* ============================ HEADER ============================ */

function PatientHeader() {
  return (
    <header className="flex items-center gap-4 rounded-[20px] bg-paper px-5 py-3.5 shadow-[var(--shadow-card)]">
      <Avatar name="Marina Castro" seed="marina" size="md" className="h-12 w-12" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[20px] font-medium text-ink">Marina Castro</span>
          <span className="text-caption text-neutral-500">38a · F · 64kg · São Paulo/SP · Unimed</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip>M54.5 · Dor lombar</Chip>
          <Chip tone="inset">Seguimento Cannabis · 3º mês</Chip>
          <span className="font-mono text-micro text-neutral-400">★★☆ registro</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-caption font-medium text-ink">Dra. Helena Prado</span>
          <span className="text-micro text-neutral-500">Neuro · CRM-SP 123456 · Pesquisadora</span>
        </div>
        <Avatar name="Helena Prado" seed="helena" size="md" className="h-10 w-10" />
      </div>
    </header>
  );
}

/* ============================ PRÉ-CONSULTA ============================ */

function PrevisitSection() {
  const [tab, setTab] = useState<"resumo" | "escalas" | "acomp">("resumo");
  return (
    <Section
      icon="sparkles"
      title="Pré-Consulta · síntese Athena"
      aside={
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { key: "resumo", label: "Resumo" },
            { key: "escalas", label: "Escalas" },
            { key: "acomp", label: "Acompanhamento" },
          ]}
        />
      }
    >
      {tab === "resumo" ? (
        <p className="text-caption leading-relaxed text-neutral-700 text-pretty">
          Paciente relata melhora parcial da dor e do sono desde o início do CBD, com sonolência diurna
          leve. Mantém uso de tramadol em desmame. Sem novos eventos adversos graves.
        </p>
      ) : tab === "escalas" ? (
        <div className="flex flex-wrap gap-2">
          {["EVA 5/10", "PSQI 9/21", "HAD-A 7/21", "BPI 4/10"].map((s) => (
            <Chip key={s} tone="muted">{s}</Chip>
          ))}
        </div>
      ) : (
        <span className="font-mono text-caption text-neutral-500">★★☆ Seguimento de 3 meses · perto do limite</span>
      )}
    </Section>
  );
}

/* ============================ ANAMNESE ============================ */

function BulletRow({ b }: { b: (typeof QPHDA_BULLETS)[number] }) {
  return (
    <li className="flex items-start gap-2 py-1.5">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
      <span className="min-w-0 flex-1 text-caption text-neutral-700 text-pretty">{b.text}</span>
      {b.source === "ia" ? (
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-micro text-neutral-400">
          <Icon name="bot" size={13} /> Athena
        </span>
      ) : null}
      {b.status === "suggested" ? (
        <div className="flex shrink-0 items-center gap-1">
          <button aria-label="Aceitar" className="grid h-6 w-6 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"><Icon name="check" size={14} /></button>
          <button aria-label="Rejeitar" className="grid h-6 w-6 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"><Icon name="x" size={14} /></button>
        </div>
      ) : null}
    </li>
  );
}

function CiapChips() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Eyebrow>Codificação CIAP-2</Eyebrow>
        <div className="flex flex-1 items-center justify-end">
          <button className="text-micro text-neutral-500 hover:text-ink">Validar códigos</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {CIAP.map((c) => (
          <span key={c.code} className={cn("inline-flex items-center gap-1.5 rounded-full border-[0.8px] px-[9px] py-[5px] text-caption", c.validated ? "border-neutral-300 bg-neutral-100 text-neutral-700" : "border-neutral-200 bg-paper text-neutral-500")}>
            {c.validated ? <Icon name="check" size={13} /> : <Icon name="bot" size={13} />}
            <strong className="font-medium text-ink">{c.code}</strong> {c.desc}
            {!c.validated ? <span className="font-mono text-micro text-neutral-400">IA · {c.confidence}%</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProblemList() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Eyebrow>Lista de problemas</Eyebrow>
        <div className="flex flex-1 items-center justify-end">
          <button className="inline-flex items-center gap-1 text-micro text-neutral-500 hover:text-ink"><Icon name="plus" size={13} /> Problema</button>
        </div>
      </div>
      {PROBLEMS.map((p) => (
        <div key={p.title} className="flex items-center gap-2 rounded-[12px] bg-paper px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{p.title}</span>
          <Chip tone="muted">CIAP {p.ciap}</Chip>
          {p.cid !== "—" ? <Chip tone="muted">CID {p.cid}</Chip> : null}
          <Chip tone={p.status === "resolvido" ? "dim" : "inset"}>{p.status}</Chip>
          <span className="shrink-0 font-mono text-micro text-neutral-400">{p.age}</span>
        </div>
      ))}
    </div>
  );
}

function EventPanel() {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-neutral-300 bg-paper p-4">
      <div className="flex items-center gap-2">
        <Icon name="error" size={18} className="text-critical" />
        <span className="text-caption font-medium text-ink">Que evento está sendo registrado?</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Evento adverso", "Intercorrência", "Internação", "Outro"].map((s, i) => (
          <Chip key={s} tone={i === 0 ? "inset" : "muted"}>{s}</Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[["Gravidade (CTCAE v5)", "Grau 1"], ["Medicação suspeita", "CBD 200mg/mL"], ["Naranjo", "score 4 · possível"], ["WHO-UMC", "possível"]].map(([l, v]) => (
          <div key={l} className="flex flex-col gap-1">
            <Eyebrow>{l}</Eyebrow>
            <span className="text-caption text-neutral-700">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-neutral-200/70 pt-3">
        <span className="text-micro text-neutral-500">Conduta: reduzir dose · notificar ANVISA/VigiMed (CTCAE ≥ 2)</span>
        <div className="flex flex-1 items-center justify-end gap-2">
          <WireButton variant="secondary">Voltar ao Seguimento</WireButton>
          <WireButton variant="primary">Salvar e notificar</WireButton>
        </div>
      </div>
    </div>
  );
}

function AnamneseSection() {
  const [mode, setMode] = useState<Mode>("seguimento");
  const [layout, setLayout] = useState<Layout>("classic");
  const tabs = layout === "soap" ? SOAP_TABS : CLASSIC_TABS;
  const [tab, setTab] = useState(0);

  return (
    <Section
      icon="notepad"
      title="Anamnese e exame físico"
      aside={
        <>
          <Segmented
            value={mode}
            onChange={(m) => setMode(m as Mode)}
            options={[
              { key: "primeira", label: "1ª consulta" },
              { key: "seguimento", label: "Seguimento" },
              { key: "evento", label: "Evento" },
            ]}
          />
          <button className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-paper px-3 py-1.5 text-caption text-ink">
            Template: Neurologia <Icon name="chevron-down" size={14} className="text-neutral-400" />
          </button>
        </>
      }
    >
      {mode === "evento" ? (
        <EventPanel />
      ) : (
        <div className="flex flex-col gap-4">
          {/* alternador de layout + abas */}
          <div className="flex items-center gap-3 border-b border-neutral-200/60 pb-3">
            <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(i)}
                  className={cn("shrink-0 rounded-full px-3 py-1.5 text-caption transition-colors", i === tab ? "bg-paper text-ink shadow-[var(--shadow-tab)]" : "text-neutral-500 hover:text-ink")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-1 items-center justify-end">
              <Segmented
                value={layout}
                onChange={(l) => { setLayout(l as Layout); setTab(0); }}
                options={[{ key: "classic", label: "Abas" }, { key: "soap", label: "SOAP" }]}
              />
            </div>
          </div>

          {/* conteúdo da aba */}
          <div className="flex flex-col gap-4">
            {(layout === "classic" && tab === 0) || (layout === "soap" && tab === 0) ? (
              <div className="flex flex-col gap-2">
                <Eyebrow>Queixa principal e HDA</Eyebrow>
                <ul className="flex flex-col">{QPHDA_BULLETS.map((b, i) => <BulletRow key={i} b={b} />)}</ul>
              </div>
            ) : null}
            {layout === "soap" && (tab === 0 || tab === 2 || tab === 3) ? <CiapChips /> : null}
            {layout === "soap" && tab === 2 ? <ProblemList /> : null}
            {layout === "classic" && tab === 1 ? <ProblemList /> : null}
            {(tab === 3 && layout === "classic") || (tab === 3 && layout === "soap") ? (
              <p className="text-caption text-neutral-600">Plano: manter CBD com ajuste noturno; reaplicar PSQI; retorno em 4 semanas.</p>
            ) : null}
          </div>

          {/* anotações privadas → alimenta Athena */}
          <div className="flex flex-col gap-1.5 rounded-[12px] bg-neutral-100 p-3">
            <div className="flex items-center gap-2">
              <Eyebrow>Suas anotações</Eyebrow>
              <span className="inline-flex flex-1 items-center justify-end gap-1 font-mono text-micro text-neutral-400">
                <Icon name="bot" size={13} /> Athena lê em tempo real
              </span>
            </div>
            <input placeholder="Anote algo (Enter envia à Athena)…" className="bg-transparent text-caption text-ink placeholder:text-neutral-400 focus:outline-none" />
          </div>
        </div>
      )}
    </Section>
  );
}

/* ============================ EXAMES / DOCS / RECENT ============================ */

function ExamesSection() {
  return (
    <Section icon="test-tube" title="Exames complementares" aside={<button className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-paper px-3 py-1.5 text-caption text-ink"><Icon name="plus" size={14} /> Solicitar</button>}>
      <div className="flex flex-wrap gap-3">
        {EXAM_GROUPS.map((g) => (
          <div key={g.group} className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-[16px] bg-paper p-3">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{g.group}</span>
              <Chip tone="muted">{g.tag}</Chip>
            </div>
            {g.items.map((it) => (
              <span key={it} className="truncate text-micro text-neutral-500">{it}</span>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function GerardocsSection() {
  const goTo = useFlow((s) => s.goTo);
  return (
    <Section icon="file" title="Gerar documentos" aside={<WireButton variant="primary" onClick={() => goTo("documents")} className="gap-2"><Icon name="file-signature" size={15} /> Abrir Studio</WireButton>}>
      <div className="flex flex-wrap gap-2">
        {DOC_TYPES.map((d, i) => (
          <Chip key={d} tone={i === 0 ? "inset" : "muted"}>{d}</Chip>
        ))}
      </div>
      <p className="text-micro text-neutral-500">Mesmo Documents Studio da tela Documentos (paridade consulta ↔ standalone).</p>
    </Section>
  );
}

function RecentSection() {
  return (
    <Section icon="time" title="Atendimentos prévios e documentos">
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-[280px] flex-1 flex-col gap-2 rounded-[16px] bg-paper p-3">
          <Eyebrow>Atendimentos prévios</Eyebrow>
          {PREV_VISITS.map((v) => (
            <div key={v.date} className="flex items-center gap-2 border-b border-dashed border-neutral-200/70 py-2 last:border-0">
              <span className="font-mono text-micro text-neutral-500">{v.date}</span>
              <span className="min-w-0 flex-1 truncate text-caption text-ink">{v.kind}</span>
              <Chip tone="muted">{v.badge}</Chip>
              <span className="shrink-0 font-mono text-micro text-neutral-400">{v.scale}</span>
            </div>
          ))}
        </div>
        <div className="flex min-w-[280px] flex-1 flex-col gap-2 rounded-[16px] bg-paper p-3">
          <Eyebrow>Documentos gerados</Eyebrow>
          {["Receita · CBD (enviado)", "Atestado · 2 dias (enviado)", "Laudo · evolução (rascunho)"].map((d) => (
            <div key={d} className="flex items-center gap-2 border-b border-dashed border-neutral-200/70 py-2 last:border-0">
              <Icon name="file" size={16} className="text-neutral-500" />
              <span className="min-w-0 flex-1 truncate text-caption text-neutral-700">{d}</span>
              <button aria-label="Visualizar" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-ink"><Icon name="show" size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================ ASIDE ATHENA ============================ */

function AthenaAside({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  if (!open) {
    return (
      <aside className="flex w-[56px] shrink-0 flex-col items-center gap-4 border-l border-neutral-200 bg-paper py-4">
        <button onClick={onToggle} aria-label="Expandir Athena" className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper">
          <Icon name="bot" size={18} />
        </button>
        {["microphone", "video", "error", "bulb"].map((ic) => (
          <span key={ic} className="grid h-9 w-9 place-items-center rounded-full text-neutral-400"><Icon name={ic} size={18} /></span>
        ))}
      </aside>
    );
  }
  return (
    <aside className="no-scrollbar flex w-[360px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-neutral-200 bg-paper px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper"><Icon name="bot" size={18} /></span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-caption font-medium text-ink">Athena · copilota-clínica</span>
          <span className="text-micro text-neutral-500">6 sugestões · 3 alertas</span>
        </div>
        <button onClick={onToggle} aria-label="Recolher" className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-ink"><Icon name="chevron-right" size={18} /></button>
      </div>

      {/* Transcrição */}
      <button className="flex items-center gap-2 rounded-[14px] border border-neutral-200 bg-paper px-3 py-2.5 text-left hover:bg-neutral-100">
        <Icon name="microphone" size={18} className="text-neutral-600" />
        <span className="min-w-0 flex-1 text-caption font-medium text-ink">Transcrição ao vivo</span>
        <Chip tone="muted">Presencial</Chip>
      </button>

      {/* Telemed */}
      <div className="flex flex-col gap-2 rounded-[14px] bg-[#f9f9f9] p-3">
        <div className="flex items-center gap-2">
          <Icon name="video" size={16} className="text-neutral-600" />
          <span className="min-w-0 flex-1 text-caption font-medium text-ink">Telemedicina</span>
          <Chip tone="dim">presencial</Chip>
        </div>
        <WireButton variant="secondary" size="sm" className="w-full gap-2"><Icon name="link" size={14} /> Gerar link de chamada</WireButton>
      </div>

      {/* Alertas */}
      <div className="flex items-center gap-2">
        {ALERTS.map((a) => (
          <div key={a.level} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-[12px] p-2", a.level === "Crítico" ? "bg-critical-weak" : "bg-neutral-100")}>
            <span className={cn("font-sans text-[20px] font-medium leading-none", a.level === "Crítico" ? "text-critical" : "text-ink")}>{a.n}</span>
            <span className="text-micro text-neutral-500">{a.level}</span>
          </div>
        ))}
      </div>

      {/* Categorias */}
      <div className="flex flex-col gap-2">
        {ATH_CATEGORIES.map((c) => (
          <div key={c.label} className="flex gap-2 rounded-[12px] bg-[#f9f9f9] p-2.5">
            <Icon name={c.icon} size={16} className="mt-0.5 shrink-0 text-neutral-500" />
            <div className="flex min-w-0 flex-col">
              <span className="text-micro font-medium uppercase tracking-[0.08em] text-neutral-500">{c.label}</span>
              <span className="text-caption text-neutral-700 text-pretty">{c.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-neutral-200/70 pt-3">
        <Icon name="shield" size={14} className="text-neutral-400" />
        <span className="text-micro text-neutral-400">Conformidade CFM · LGPD</span>
      </div>
    </aside>
  );
}

/* ============================ TELA ============================ */

export function ConsultCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [asideOpen, setAsideOpen] = useState(true);

  return (
    <div className="relative flex h-full min-h-0">
      <main className="no-scrollbar flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
        <PatientHeader />
        <PrevisitSection />
        <AnamneseSection />
        <ExamesSection />
        <GerardocsSection />
        <RecentSection />
        <div className="h-4 shrink-0" />
      </main>

      <AthenaAside open={asideOpen} onToggle={() => setAsideOpen((v) => !v)} />

      {/* FAB + encerrar */}
      <button
        type="button"
        aria-label="Adicionar evento"
        className="absolute bottom-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-ink text-paper shadow-[var(--shadow-card)] md:left-[calc(50%-180px)]"
      >
        <Icon name="plus" size={22} />
      </button>
      <button
        type="button"
        onClick={() => goTo("clinical-note")}
        className="absolute bottom-6 right-[384px] inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-caption font-medium text-ink shadow-[var(--shadow-card)]"
      >
        <Icon name="check-double" size={16} /> Encerrar consulta
      </button>
    </div>
  );
}
