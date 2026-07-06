"use client";

import { useRef, useState } from "react";
import { WireButton, WireBadge, Avatar, AppScreen, Icon } from "@/components/ui";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";
import { SendToPatientPanel } from "./SendToPatientPanel";

// `clinical-note` — Conferência da consulta (T-11), conforme o Figma de referência:
// header do paciente (anatomia do Paciente 360) com "Salvar para depois · Aceitar
// todas as sugestões · Revisar e enviar"; container com "Resumo da consulta" +
// "Próximos passos" no topo e, embaixo, o "Relatório da consulta" — rail VERTICAL
// de seções à esquerda e painel ÚNICO ROLÁVEL à direita com todas as seções
// empilhadas (scrollspy: rolar move a aba ativa; clicar na aba rola até a seção).

type Decision = "pending" | "accepted" | "rejected";

type Field = {
  key: string;
  label: string;
  value: React.ReactNode;
  /** Sugestão da IA (default true) → conta no "n/N sugestões" e aceita/rejeita. */
  ai?: boolean;
};

type Section = { key: string; label: string; fields: Field[] };

/* ============================ DADOS (mock) ============================ */

const SUMMARY =
  "Marina apresenta um quadro de dor lombar crônica refratária, que persiste apesar de " +
  "diversos tratamentos. Durante a consulta, foi agendado um retorno para o dia 19 de julho, " +
  "a fim de monitorar sua condição. Além disso, foi prescrita uma receita de controle " +
  "especial, com a indicação de CBD a 200mg/mL, visando auxiliar no manejo da dor. A equipe " +
  "médica registrou as observações pertinentes em uma nota clínica (SOAP), destacando a " +
  "necessidade de acompanhamento contínuo para ajustar o tratamento conforme a evolução " +
  "dos sintomas.";

const NEXT_STEPS = [
  "Manter CBD 200mg/mL · titulação",
  "Desmame gradual de tramadol",
  "Higiene do sono + fisioterapia",
  "Perfil hepático de controle (M6)",
  "Retorno em 19/07 · teleconsulta",
];

const SECTIONS: Section[] = [
  {
    key: "anamnese",
    label: "Anamnese",
    fields: [
      { key: "queixa", label: "Queixa principal", value: "Dor lombar persistente, pior à noite; sono fragmentado." },
      { key: "hda", label: "História da doença atual", value: "Dor crônica nociplástica com piora noturna e ao frio; desmame de opioide em curso; resposta parcial às terapias anteriores." },
      { key: "habitos", label: "Hábitos e antecedentes", value: "Nega tabagismo. Sono fragmentado com despertares. Nunca utilizou cannabis medicinal." },
    ],
  },
  {
    key: "comorbidades",
    label: "Comorbidades & Medicamentos",
    fields: [
      {
        key: "comorbidades",
        label: "Comorbidades",
        value: (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <WireBadge>M54.5 · Dor lombar</WireBadge>
            <WireBadge>M79.7 · Fibromialgia</WireBadge>
            <WireBadge>F41.1 · Ansiedade</WireBadge>
          </div>
        ),
      },
      {
        key: "medicacoes",
        label: "Medicações em uso",
        value: (
          <ul className="flex flex-col gap-0.5 font-mono">
            <li>Tramadol 50mg · em desmame</li>
            <li>Amitriptilina 25mg · à noite</li>
            <li>CBD 200mg/mL · 0,5 mL 2×/dia</li>
            <li>Vitamina D 7.000UI · semanal</li>
          </ul>
        ),
      },
      { key: "interacao", label: "Interação", value: "Amitriptilina × CBD — risco de sedação; monitorar sonolência diurna." },
    ],
  },
  {
    key: "exame",
    label: "Exame físico & mental",
    fields: [
      { key: "sugestao", label: "Sugestão de exame", value: "Avaliar pontos dolorosos (critério ACR) e amplitude de movimento lombar." },
      { key: "fisico", label: "Exame físico", ai: false, value: "A preencher — sinais vitais e exame musculoesquelético." },
      { key: "mental", label: "Exame mental", ai: false, value: "A preencher — humor e afeto. Sono fragmentado relatado." },
    ],
  },
  {
    key: "conduta",
    label: "Conduta & Plano",
    fields: [
      { key: "conduta", label: "Conduta e plano terapêutico", value: "Manter CBD; reforçar higiene do sono; reduzir tramadol gradual; reavaliar em 30 dias (M6)." },
      { key: "prescricao", label: "Prescrição", value: "CBD 200mg/mL · 0,5 mL 2×/dia · controle especial." },
      {
        key: "cid",
        label: "CID sugerido",
        value: (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <WireBadge>M54.5 · Dor lombar baixa</WireBadge>
            <WireBadge>M79.7 · Fibromialgia</WireBadge>
            <WireBadge tone="mid">G47.0 · Insônia (novo)</WireBadge>
          </div>
        ),
      },
    ],
  },
  {
    key: "documentos",
    label: "Documentos",
    fields: [
      {
        key: "gerados",
        label: "Documentos gerados",
        value: (
          <ul className="flex flex-col gap-1 pt-1">
            {[
              "Nota clínica (SOAP)",
              "Receita · CBD 200mg/mL (controle especial)",
              "Atestado e laudo",
              "Solicitação de exames",
            ].map((d) => (
              <li key={d} className="flex items-center gap-2">
                <Icon name="check" size={15} className="shrink-0 text-neutral-500" />
                <span className="text-pretty">{d}</span>
              </li>
            ))}
          </ul>
        ),
      },
      { key: "retorno", label: "Retorno", value: "19/07/2026 · Teleconsulta." },
      { key: "prom", label: "Questionário (PROM)", value: "Disparo automático · 7 dias." },
    ],
  },
  {
    key: "notas",
    label: "Notas",
    fields: [
      { key: "nota", label: "Notas da consulta", ai: false, value: "Sonolência diurna leve relatada; reforçada higiene do sono. Preferência por contato via WhatsApp." },
    ],
  },
];

const aiFieldsOf = (s: Section) => s.fields.filter((f) => f.ai !== false);
const fieldId = (sKey: string, fKey: string) => `${sKey}:${fKey}`;

/* ============================ HEADER ============================ */

function PatientHeader({
  onAcceptAll,
  onSend,
}: {
  onAcceptAll: () => void;
  onSend: () => void;
}) {
  const back = useFlow((s) => s.back);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <Avatar name="Marina Castro" seed="marina" size="md" className="h-12 w-12" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
            Paciente
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => back()}
              aria-label="Voltar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[0.8px] border-neutral-300 bg-paper text-ink transition-colors hover:bg-neutral-100"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[20px] font-medium leading-tight text-ink">
                Marina Castro
              </span>
              <span className="text-caption text-neutral-600">
                38 anos · M54.5 · Dra. Helena Prado · <span className="font-mono">★★☆</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ações da conferência. */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-caption font-medium text-ink transition-colors hover:bg-neutral-100"
          >
            <Icon name="bookmark" size={18} />
            Salvar para depois
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-caption font-medium text-ink transition-colors hover:bg-neutral-100"
          >
            <Icon name="check-double" size={18} />
            Aceitar todas as sugestões
          </button>
          <WireButton variant="primary" onClick={onSend} className="gap-2">
            <Icon name="send" size={18} />
            Revisar e enviar
          </WireButton>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-200/70" />
    </div>
  );
}

/* ============================ TOPO: RESUMO + PRÓXIMOS PASSOS ============================ */

function SummaryCard() {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-paper p-5 shadow-[var(--shadow-tab)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[20px] font-medium text-ink">Resumo da consulta</h2>
        <span className="shrink-0 font-mono text-body-l tracking-[0.14em] text-neutral-500">
          ★★★★☆
        </span>
      </div>
      <p className="text-caption leading-relaxed text-neutral-700 text-pretty">{SUMMARY}</p>
    </div>
  );
}

function NextStepsCard() {
  // Aceite/dispensa em lote dos próximos passos (mock — estado visual).
  const [state, setState] = useState<"pending" | "accepted" | "dismissed">("pending");

  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-paper p-5 shadow-[var(--shadow-tab)]">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-body-l font-medium text-ink">Próximos passos</h3>
        <Icon name="help" size={15} className="text-neutral-400" />
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Aceitar todos"
            aria-pressed={state === "accepted"}
            onClick={() => setState((s) => (s === "accepted" ? "pending" : "accepted"))}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border-[0.8px] transition-colors",
              state === "accepted"
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink",
            )}
          >
            <Icon name="check" size={15} />
          </button>
          <button
            type="button"
            aria-label="Dispensar todos"
            aria-pressed={state === "dismissed"}
            onClick={() => setState((s) => (s === "dismissed" ? "pending" : "dismissed"))}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border-[0.8px] transition-colors",
              state === "dismissed"
                ? "border-neutral-500 bg-neutral-200 text-ink"
                : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink",
            )}
          >
            <Icon name="x" size={15} />
          </button>
        </div>
      </div>
      <ul className={cn("flex flex-col gap-2", state === "dismissed" && "opacity-50")}>
        {NEXT_STEPS.map((step) => (
          <li
            key={step}
            className="flex items-center gap-2.5 rounded-[12px] bg-neutral-100 px-3.5 py-2.5"
          >
            <Icon
              name="check"
              size={15}
              className={cn("shrink-0", state === "accepted" ? "text-ink" : "text-neutral-500")}
            />
            <span
              className={cn(
                "text-caption text-neutral-700 text-pretty",
                state === "dismissed" && "line-through decoration-neutral-400",
              )}
            >
              {step}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================ RELATÓRIO (rail + painel rolável) ============================ */

// Campo do relatório: rótulo + texto; sugestões da IA ganham ✓/✗ no hover e
// contam no "n/N sugestões" do rail.
function FieldRow({
  field,
  decision,
  onDecision,
}: {
  field: Field;
  decision: Decision;
  onDecision: (d: Decision) => void;
}) {
  if (field.ai === false) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-body font-medium text-ink">{field.label}</span>
        <div className="text-caption leading-relaxed text-neutral-600 text-pretty">
          {field.value}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group flex flex-col gap-1", decision === "rejected" && "opacity-55")}>
      <div className="flex items-center gap-2">
        <span className="text-body font-medium text-ink">{field.label}</span>
        {decision === "accepted" ? (
          <Icon name="check-circle" size={14} className="shrink-0 text-neutral-500" />
        ) : null}
        {/* ✓/✗ — aparecem no hover/foco; ficam quando decidido. */}
        <span
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100",
            decision !== "pending" && "opacity-100",
          )}
        >
          <button
            type="button"
            aria-label="Aceitar"
            aria-pressed={decision === "accepted"}
            onClick={() => onDecision(decision === "accepted" ? "pending" : "accepted")}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full border-[0.8px] transition-colors",
              decision === "accepted"
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink",
            )}
          >
            <Icon name="check" size={13} />
          </button>
          <button
            type="button"
            aria-label="Rejeitar"
            aria-pressed={decision === "rejected"}
            onClick={() => onDecision(decision === "rejected" ? "pending" : "rejected")}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full border-[0.8px] transition-colors",
              decision === "rejected"
                ? "border-neutral-500 bg-neutral-200 text-ink"
                : "border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-ink",
            )}
          >
            <Icon name="x" size={13} />
          </button>
        </span>
      </div>
      <div
        className={cn(
          "text-caption leading-relaxed text-neutral-600 text-pretty",
          decision === "rejected" && "line-through decoration-neutral-400",
        )}
      >
        {field.value}
      </div>
    </div>
  );
}

/* ============================ TELA ============================ */

export function ClinicalNoteCenter() {
  // Seção ativa no rail — dirigida pelo SCROLL do painel direito (scrollspy) e
  // pelos cliques no rail (que rolam o painel até a seção).
  const [tab, setTab] = useState(SECTIONS[0].key);
  // "1/3 sugestões" inicial do Figma: a queixa principal já chega aceita.
  const [decisions, setDecisions] = useState<Record<string, Decision>>({
    "anamnese:queixa": "accepted",
  });
  const [sendOpen, setSendOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  // Durante o scroll suave do clique, o spy fica mudo (não rouba a aba no caminho).
  const clickScrolling = useRef(false);

  const setDecision = (id: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: d }));

  const decideSection = (s: Section, d: Decision) =>
    setDecisions((prev) => {
      const next = { ...prev };
      aiFieldsOf(s).forEach((f) => {
        next[fieldId(s.key, f.key)] = d;
      });
      return next;
    });

  const acceptAll = () =>
    setDecisions(() => {
      const next: Record<string, Decision> = {};
      SECTIONS.forEach((s) =>
        aiFieldsOf(s).forEach((f) => {
          next[fieldId(s.key, f.key)] = "accepted";
        }),
      );
      return next;
    });

  const acceptedIn = (s: Section) =>
    aiFieldsOf(s).filter((f) => decisions[fieldId(s.key, f.key)] === "accepted").length;

  const sectionComplete = (s: Section) => {
    const ai = aiFieldsOf(s);
    return ai.length > 0 && acceptedIn(s) === ai.length;
  };

  // Scrollspy: a seção ativa é a última cujo topo passou da borda superior do
  // painel (com folga); no fim do scroll, a última seção assume.
  const onScroll = () => {
    if (clickScrolling.current) return;
    const c = scrollRef.current;
    if (!c) return;
    const atBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 4;
    if (atBottom) {
      setTab(SECTIONS[SECTIONS.length - 1].key);
      return;
    }
    const top = c.scrollTop + 72;
    let current = SECTIONS[0].key;
    for (const s of SECTIONS) {
      const el = sectionRefs.current[s.key];
      if (el && el.offsetTop <= top) current = s.key;
    }
    setTab(current);
  };

  const goToSection = (key: string) => {
    setTab(key);
    const c = scrollRef.current;
    const el = sectionRefs.current[key];
    if (!c || !el) return;
    clickScrolling.current = true;
    c.scrollTo({ top: el.offsetTop - 4, behavior: "smooth" });
    window.setTimeout(() => {
      clickScrolling.current = false;
    }, 700);
  };

  return (
    <AppScreen>
      <PatientHeader onAcceptAll={acceptAll} onSend={() => setSendOpen(true)} />

      {/* Container geral da conferência. */}
      <section className="flex flex-col gap-5 rounded-[28px] bg-[#f9f9f9] p-4">
        {/* Resumo da consulta + Próximos passos. */}
        <div className="grid items-stretch gap-4 lg:grid-cols-[1.8fr_1fr]">
          <SummaryCard />
          <NextStepsCard />
        </div>

        {/* Relatório da consulta — rail vertical + painel único rolável (scrollspy). */}
        <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_2.2fr]">
          {/* Rail de seções. */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 pl-1">
              <h3 className="font-display text-body-l font-medium text-ink">
                Relatório da consulta
              </h3>
              <p className="text-caption text-neutral-500 text-pretty">
                Revise o que foi transcrito antes de enviar para seu paciente
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {SECTIONS.map((s) => {
                const active = tab === s.key;
                const ai = aiFieldsOf(s);
                return (
                  <div
                    key={s.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => goToSection(s.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") goToSection(s.key);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-[14px] px-3.5 py-3 transition-colors duration-[180ms]",
                      active
                        ? "bg-paper shadow-[var(--shadow-tab)]"
                        : "bg-[#f1f1ef] hover:bg-neutral-100",
                    )}
                  >
                    <span
                      className={cn(
                        "truncate text-caption font-medium",
                        active ? "text-ink" : "text-neutral-400",
                      )}
                    >
                      {s.label}
                    </span>
                    {sectionComplete(s) ? (
                      <Icon name="check-circle" size={14} className="shrink-0 text-neutral-500" />
                    ) : null}
                    {ai.length ? (
                      <>
                        <span className="ml-auto shrink-0 font-mono text-micro text-neutral-400">
                          {acceptedIn(s)}/{ai.length} sugestões
                        </span>
                        <button
                          type="button"
                          aria-label={`Aceitar sugestões de ${s.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            decideSection(s, "accepted");
                          }}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-ink"
                        >
                          <Icon name="check" size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Rejeitar sugestões de ${s.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            decideSection(s, "rejected");
                          }}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-ink"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel único rolável com TODAS as seções empilhadas. */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="no-scrollbar relative max-h-[640px] overflow-y-auto rounded-[20px] bg-paper p-6 shadow-[var(--shadow-tab)]"
          >
            <div className="flex flex-col gap-10 pb-24">
              {SECTIONS.map((s) => {
                const ai = aiFieldsOf(s);
                return (
                  <section
                    key={s.key}
                    ref={(el) => {
                      sectionRefs.current[s.key] = el;
                    }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/70 pb-3">
                      <h4 className="font-display text-body-l font-medium text-ink">{s.label}</h4>
                      {ai.length ? (
                        <button
                          type="button"
                          onClick={() => decideSection(s, "accepted")}
                          className="inline-flex items-center gap-1.5 text-caption text-neutral-600 transition-colors hover:text-ink"
                        >
                          <Icon name="check-double" size={16} />
                          Aceitar sugestões abaixo
                        </button>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-5">
                      {s.fields.map((f) => (
                        <FieldRow
                          key={f.key}
                          field={f}
                          decision={decisions[fieldId(s.key, f.key)] ?? "pending"}
                          onDecision={(d) => setDecision(fieldId(s.key, f.key), d)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SendToPatientPanel open={sendOpen} onClose={() => setSendOpen(false)} />
    </AppScreen>
  );
}
