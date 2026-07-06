"use client";

import { useEffect, useState } from "react";
import { Avatar, Eyebrow, Icon, WireButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DOC_TYPES, SIMPLE_TEMPLATES, type DocType } from "./documents-data";

// Wizard "Gerar documento" do Paciente 360 — modal central grande com etapas
// VERTICAIS no trilho esquerdo (Paciente → Tipo → Conteúdo → Sugestão da
// Athena). Nas etapas de conteúdo e da Athena, a coluna direita mostra o
// PREVIEW A4 ao vivo (marca da clínica, diagramação e assinatura ICP-Brasil —
// mesma folha do Documents Studio). Ao concluir, devolve o nome do documento
// ao pai via `onGenerate` (o Paciente 360 injeta na lista da seção Documentos).

const STEPS: { label: string; desc: string }[] = [
  { label: "Paciente", desc: "Quem recebe o documento" },
  { label: "Tipo", desc: "Formato do documento" },
  { label: "Conteúdo", desc: "Modelo, itens e diagramação" },
  { label: "Sugestão da Athena", desc: "Revisão e finalização" },
];

// Itens iniciais e pool do "Adicionar item" (prescrição/exames) — coerentes com
// INITIAL_ITEMS/EXAMS do Documents Studio e com as medicações da Marina.
const SEED_ITEMS: Partial<Record<DocType, string[]>> = {
  prescricao: ["Canabidiol 200mg/mL · 5 gotas 8/8h · 1 frasco", "Amitriptilina 25mg · 1 cp à noite · 30 cp"],
  exames: ["Hemograma completo", "Perfil hepático (TGO/TGP)", "Função renal (ureia/creatinina)"],
};
const POOL_ITEMS: Partial<Record<DocType, string[]>> = {
  prescricao: ["Pregabalina 75mg · 1 cp 12/12h · 30 cp", "Melatonina 3mg · à noite, se necessário"],
  exames: ["Dosagem de vitamina D", "TSH"],
};

// Nome que entra na lista Documentos do Paciente 360 (padrão "Nome · detalhe").
const DOC_NAME: Record<DocType, string> = {
  prescricao: "Receita de controle especial · CBD",
  exames: "Solicitação de exames · monitoramento CBD",
  atestado: "Atestado · 1 dia",
  laudo: "Laudo · evolução clínica",
  encaminhamento: "Encaminhamento · Reumatologia",
  cirurgia: "Solicitação de procedimento cirúrgico",
  opme: "Solicitação de OPME",
  sumario: "Sumário clínico · seguimento M3",
  orientacoes: "Orientações pós-consulta",
  tcle: "Termo de consentimento · CBD",
};

// Texto base por MODELO (tipos simples) — pré-preenche o editor e o preview A4.
const TEMPLATE_BODY: Record<string, string> = {
  "Atestado de comparecimento":
    "Atesto, para os devidos fins, que a paciente Marina Castro compareceu a esta clínica nesta data, das 9h às 10h, para consulta de acompanhamento terapêutico.",
  "Atestado de afastamento (CID)":
    "Atesto, para os devidos fins, que a paciente Marina Castro, portadora do CID M54.5, esteve sob meus cuidados nesta data, necessitando de afastamento de suas atividades por 1 (um) dia.",
  "Atestado para atividade física":
    "Atesto que a paciente Marina Castro encontra-se apta à prática de atividade física leve a moderada, com restrição a exercícios de alto impacto na coluna lombar.",
  "Laudo para importação (ANVISA)":
    "Laudo médico para importação (Anvisa): paciente com dor lombar crônica (CID M54.5) refratária ao tratamento convencional, em uso de canabidiol 200mg/mL com resposta parcial documentada. Justifica-se a continuidade da importação do produto.",
  "Laudo de evolução clínica":
    "Paciente em tratamento de dor lombar crônica (CID M54.5) com canabidiol 200mg/mL há 3 meses. Evolução favorável: dor EVA 8 → 5 e sono PSQI 14 → 9 desde o baseline; desmame de tramadol em curso.",
  "Encaminhamento — Reumatologia":
    "Encaminho a paciente Marina Castro, 38 anos, com dor lombar crônica (CID M54.5) e discopatia degenerativa L4–L5, para avaliação reumatológica complementar.",
  "Encaminhamento — Psiquiatria":
    "Encaminho a paciente Marina Castro, 38 anos, com transtorno de ansiedade generalizada (CID F41.1) em acompanhamento clínico, para avaliação psiquiátrica.",
  "Solicitação de procedimento cirúrgico":
    "Solicito parecer da equipe de coluna quanto à indicação de procedimento em paciente com discopatia degenerativa L4–L5 sem compressão radicular, em tratamento conservador otimizado.",
  "Solicitação de OPME":
    "Solicitação de OPME condicionada ao parecer da equipe de coluna — sem materiais definidos nesta etapa do tratamento conservador.",
  "Sumário clínico de alta":
    "Sumário de alta: paciente com dor lombar crônica (M54.5), estável, orientada quanto ao uso de canabidiol 200mg/mL e aos sinais de alerta. Retorno em caso de piora.",
  "Sumário de seguimento":
    "Sumário de seguimento: dor lombar crônica (M54.5) em M3 do episódio terapêutico com canabidiol 200mg/mL. Resposta parcial (EVA 8 → 5 desde o basal); desmame de tramadol em curso.",
  "Orientações pós-consulta":
    "Manter o canabidiol conforme a prescrição, preferindo a dose noturna após o jantar. Evitar dirigir em caso de sonolência. Registrar episódios de dor no diário.",
  "Higiene do sono":
    "Manter horários regulares de sono, evitar telas 1 hora antes de deitar e cafeína após as 16h. Usar o quarto apenas para dormir; se não adormecer em 20 minutos, levantar e retornar quando houver sonolência.",
  "TCLE — Procedimento":
    "Termo de consentimento livre e esclarecido para uso de canabidiol 200mg/mL no tratamento de dor lombar crônica (CID M54.5). Riscos, benefícios e alternativas discutidos em consulta.",
};

// Sugestões da Athena por tipo — "Outra" cicla nas variantes (% length).
const ATHENA_SUGGESTIONS: Record<DocType, string[]> = {
  prescricao: [
    "Canabidiol 200mg/mL — 5 gotas, via oral, de 8/8 horas (90 mg CBD/dia). Manter desmame gradual de tramadol 50mg conforme tolerância. Dispensar 1 frasco. Uso contínuo até reavaliação em M6.",
    "Canabidiol 200mg/mL — 4 gotas, via oral, de 8/8 horas (72 mg CBD/dia), com redução da dose noturna pela sonolência diurna relatada. Dispensar 1 frasco. Reavaliar em 30 dias.",
  ],
  exames: [
    "Solicito hemograma completo, perfil hepático (TGO/TGP) e função renal para monitoramento do uso contínuo de canabidiol 200mg/mL. Paciente em M3 do episódio terapêutico.",
    "Solicito perfil hepático (TGO/TGP) e dosagem de vitamina D — controle trimestral do episódio CBD e seguimento da insuficiência de vitamina D (24 ng/mL).",
  ],
  atestado: [
    "Atesto, para os devidos fins, que a paciente Marina Castro esteve sob meus cuidados nesta data, em consulta de acompanhamento de dor lombar crônica (CID M54.5), necessitando de afastamento de suas atividades por 1 (um) dia.",
    "Atesto que a paciente Marina Castro compareceu a esta clínica nesta data, das 9h às 10h, para consulta de acompanhamento terapêutico.",
  ],
  laudo: [
    "Paciente de 38 anos em tratamento de dor lombar crônica refratária (CID M54.5) com canabidiol 200mg/mL há 3 meses. Evolução favorável: dor EVA 6 → 5, sono PSQI 11 → 9, desmame parcial de tramadol. Mantém indicação clínica de continuidade do tratamento.",
    "Laudo para importação (Anvisa): paciente com dor lombar crônica (M54.5) refratária ao tratamento convencional, em uso de canabidiol 200mg/mL com resposta parcial documentada. Justifica-se a continuidade da importação do produto.",
  ],
  encaminhamento: [
    "Encaminho a paciente Marina Castro, 38 anos, com dor lombar crônica (CID M54.5) e discopatia degenerativa L4–L5, para avaliação reumatológica complementar. Em uso de canabidiol 200mg/mL, tramadol em desmame e amitriptilina 25mg.",
  ],
  cirurgia: [
    "Paciente com discopatia degenerativa L4–L5 sem compressão radicular, em tratamento conservador otimizado. Solicito parecer da equipe de coluna quanto à indicação de procedimento; sem urgência cirúrgica no momento.",
  ],
  opme: [
    "Solicitação de OPME condicionada ao parecer da equipe de coluna — sem materiais definidos nesta etapa do tratamento conservador.",
  ],
  sumario: [
    "Sumário de seguimento: dor lombar crônica (M54.5) em M3 do episódio terapêutico com canabidiol 200mg/mL. Resposta parcial (EVA 8 → 5 desde o basal), desmame de tramadol em curso e sonolência diurna leve (CTCAE G1) em observação.",
  ],
  orientacoes: [
    "Manter o canabidiol conforme a prescrição, preferindo a dose noturna após o jantar. Evitar dirigir em caso de sonolência. Seguir a higiene do sono e os alongamentos orientados pela fisioterapia; registrar episódios de dor no diário.",
  ],
  tcle: [
    "Termo de consentimento livre e esclarecido para uso de canabidiol 200mg/mL no tratamento de dor lombar crônica (CID M54.5). Riscos, benefícios e alternativas discutidos em consulta; aceite eletrônico da paciente via WhatsApp.",
  ],
};

type Patient = { name: string; seed: string; age: string; cid: string; diagnosis: string };

/* ===================== FOLHA A4 (preview de alta fidelidade) ===================== */

// Mesma folha do Documents Studio (A4Preview): cabeçalho com a marca da clínica,
// título do documento, corpo (itens numerados ou texto corrido) e assinatura
// ICP-Brasil ancorada na base — a diagramação que o médico verá no papel.
function DocSheet({
  docType,
  patient,
  items,
  bodyText,
  note,
}: {
  docType: DocType;
  patient: Patient;
  /** Itens numerados (prescrição/exames). */
  items?: string[];
  /** Texto corrido (demais tipos). */
  bodyText?: string;
  /** Observação extra (sugestão da Athena aplicada sobre itens). */
  note?: string | null;
}) {
  const docLabel = DOC_TYPES.find((d) => d.key === docType)?.label ?? "Documento";
  return (
    <div className="flex min-h-[520px] flex-col gap-4 rounded-[8px] border border-neutral-200 bg-paper p-6 shadow-[var(--shadow-card)]">
      {/* Cabeçalho — marca da clínica + médico responsável. */}
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100">
          <Icon name="plus-medical" size={18} className="text-neutral-600" />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-display text-body font-medium text-ink">Clínica WeCann</span>
          <span className="text-micro text-neutral-500">Dra. Helena Prado · CRM-SP 123456</span>
        </div>
        <span className="text-micro text-neutral-400">19/06/2026</span>
      </div>

      {/* Título do documento + identificação do paciente. */}
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-body font-medium text-ink">{docLabel}</span>
        <span className="text-micro text-neutral-500">
          {patient.name} · {patient.age} · CID {patient.cid}
        </span>
      </div>

      {/* Corpo. */}
      {items ? (
        items.length ? (
          <ol className="flex flex-col gap-3">
            {items.map((it, i) => {
              const [name, ...rest] = it.split(" · ");
              return (
                <li key={`${it}-${i}`} className="flex gap-2">
                  <span className="font-mono text-caption text-neutral-400">{i + 1}.</span>
                  <div className="flex flex-col">
                    <span className="text-caption font-medium text-ink">{name}</span>
                    {rest.length ? (
                      <span className="text-caption text-neutral-600">{rest.join(" · ")}</span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-caption text-neutral-400">Nenhum item no documento.</p>
        )
      ) : (
        <p className="whitespace-pre-line text-caption leading-relaxed text-neutral-700 text-pretty">
          {bodyText}
        </p>
      )}
      {note ? (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">Observações</span>
          <p className="text-caption leading-relaxed text-neutral-700 text-pretty">{note}</p>
        </div>
      ) : null}

      <span className="flex-1" />

      {/* Assinatura — ICP-Brasil. */}
      <div className="mt-2 flex flex-col items-center gap-1 border-t border-neutral-200 pt-4">
        <span className="h-8 w-40 border-b border-neutral-300" />
        <span className="text-micro text-neutral-400">Dra. Helena Prado · assinatura ICP-Brasil</span>
      </div>
    </div>
  );
}

/* ===================== WIZARD ===================== */

export function GenerateDocumentModal({
  patient,
  onClose,
  onGenerate,
}: {
  patient: Patient;
  onClose: () => void;
  onGenerate: (name: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState<DocType | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [bodyText, setBodyText] = useState("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [athenaText, setAthenaText] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isItemsType = docType === "prescricao" || docType === "exames";
  const canContinue =
    step === 1 ? docType !== null : step === 2 && isItemsType ? items.length > 0 : true;

  // Trocar de tipo re-semeia itens/modelo/texto e zera o estado da Athena.
  const selectType = (t: DocType) => {
    if (t === docType) return;
    const firstTemplate = (SIMPLE_TEMPLATES[t] ?? [])[0] ?? null;
    setDocType(t);
    setItems(SEED_ITEMS[t] ?? []);
    setTemplate(firstTemplate);
    setBodyText(firstTemplate ? (TEMPLATE_BODY[firstTemplate] ?? "") : "");
    setSuggestionIdx(0);
    setAthenaText(null);
    setEditing(false);
  };

  const selectTemplate = (t: string) => {
    setTemplate(t);
    setBodyText(TEMPLATE_BODY[t] ?? "");
  };

  const templates = docType ? (SIMPLE_TEMPLATES[docType] ?? []) : [];
  const pool = docType ? (POOL_ITEMS[docType] ?? []).filter((p) => !items.includes(p)) : [];
  const suggestions = docType ? ATHENA_SUGGESTIONS[docType] : [];
  const suggestion = suggestions.length ? suggestions[suggestionIdx % suggestions.length] : "";

  // Preview da etapa da Athena: texto aplicado substitui o corpo (tipos simples)
  // ou entra como observação sob os itens (prescrição/exames).
  const sheet =
    docType == null ? null : isItemsType ? (
      <DocSheet docType={docType} patient={patient} items={items} note={step === 3 ? athenaText : null} />
    ) : (
      <DocSheet docType={docType} patient={patient} bodyText={step === 3 ? (athenaText ?? bodyText) : bodyText} />
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div onClick={onClose} aria-hidden className="absolute inset-0 bg-[#e6e6e4]/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gerar documento"
        className="relative flex h-[min(760px,calc(100dvh-3rem))] w-full max-w-[1100px] overflow-hidden rounded-[24px] bg-paper shadow-[var(--shadow-card)]"
      >
        {/* Trilho esquerdo — título + etapas verticais + paciente. */}
        <aside className="flex w-[248px] shrink-0 flex-col gap-8 border-r border-neutral-200/70 bg-[#f9f9f9] p-6">
          <div className="flex flex-col gap-1">
            <Eyebrow>Paciente 360</Eyebrow>
            <h2 className="font-display text-title font-medium text-ink">Gerar documento</h2>
          </div>

          <div className="flex flex-col">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-micro",
                      i === step ? "bg-ink text-paper" : i < step ? "bg-neutral-300 text-ink" : "bg-neutral-100 text-neutral-500",
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < STEPS.length - 1 ? <span className="my-1 w-px flex-1 bg-neutral-200" /> : null}
                </div>
                {/* Clique só volta; avançar é pelo Continuar. */}
                <button
                  type="button"
                  onClick={() => {
                    if (i < step) setStep(i);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-0.5 pt-[2px] text-left",
                    i < STEPS.length - 1 && "pb-6",
                  )}
                >
                  <span className={cn("text-caption", i === step ? "font-medium text-ink" : "text-neutral-500")}>
                    {s.label}
                  </span>
                  <span className="text-micro text-neutral-400">{s.desc}</span>
                </button>
              </div>
            ))}
          </div>

          <span className="flex-1" />

          <div className="flex items-center gap-2.5 border-t border-neutral-200/70 pt-4">
            <Avatar name={patient.name} seed={patient.seed} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-caption font-medium text-ink">{patient.name}</span>
              <span className="text-micro text-neutral-500">{patient.cid} · CBD · M3</span>
            </div>
          </div>
        </aside>

        {/* Coluna direita — cabeçalho da etapa + corpo rolável + rodapé. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-neutral-200/70 px-6 py-4">
            <div className="flex flex-1 flex-col">
              <span className="font-mono text-micro uppercase tracking-[0.08em] text-neutral-400">
                Etapa {step + 1} de {STEPS.length}
              </span>
              <h3 className="font-display text-body-l font-medium text-ink">{STEPS[step].label}</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-5">
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-[16px] bg-[#f9f9f9] px-4 py-2.5">
                  <Avatar name={patient.name} seed={patient.seed} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-caption font-medium text-ink">
                      {patient.name} · {patient.age}
                    </span>
                    <span className="text-micro text-neutral-500">Diagnóstico: {patient.diagnosis}</span>
                  </div>
                  <button className="flex shrink-0 items-center gap-1.5 text-micro text-neutral-500 hover:text-ink">
                    <Icon name="user" size={14} /> Trocar paciente
                  </button>
                </div>
                <p className="text-caption text-neutral-500">
                  O documento será vinculado ao episódio ativo · CBD 200mg/mL · M3.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-3">
                <Eyebrow>Tipo de documento</Eyebrow>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DOC_TYPES.map((t) => {
                    const on = t.key === docType;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => selectType(t.key)}
                        aria-pressed={on}
                        className={cn(
                          "flex items-center gap-2 rounded-[14px] border px-3 py-2.5 text-caption transition-colors",
                          on ? "border-ink bg-ink text-paper" : "border-neutral-200 bg-paper text-neutral-600 hover:text-ink",
                        )}
                      >
                        <Icon name={t.icon} size={15} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && docType && (
              <div className="flex gap-5">
                {/* Controles — itens ou modelo + texto. */}
                <div className="flex w-[300px] shrink-0 flex-col gap-4">
                  {isItemsType ? (
                    <>
                      <Eyebrow>Itens do documento</Eyebrow>
                      {items.length ? (
                        <ul className="flex flex-col gap-2">
                          {items.map((it) => (
                            <li key={it} className="flex items-center gap-3 rounded-[12px] bg-[#f9f9f9] px-3 py-2">
                              <Icon name={docType === "prescricao" ? "capsule" : "test-tube"} size={16} className="text-neutral-400" />
                              <span className="min-w-0 flex-1 truncate text-caption text-ink">{it}</span>
                              <button
                                type="button"
                                onClick={() => setItems((prev) => prev.filter((p) => p !== it))}
                                aria-label={`Remover ${it}`}
                                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-ink"
                              >
                                <Icon name="x" size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="rounded-[12px] border border-dashed border-neutral-300 px-3 py-4 text-center text-caption text-neutral-500">
                          Nenhum item no documento.
                        </div>
                      )}
                      {pool.length ? (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => [...prev, pool[0]])}
                          className="flex items-center justify-center gap-2 rounded-[12px] border border-dashed border-neutral-300 py-2.5 text-caption text-neutral-500 transition-colors hover:text-ink"
                        >
                          <Icon name="plus" size={16} /> Adicionar item
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        <Eyebrow>Modelo</Eyebrow>
                        <div className="flex flex-wrap gap-2">
                          {templates.map((t) => {
                            const on = t === template;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => selectTemplate(t)}
                                aria-pressed={on}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 text-caption transition-colors",
                                  on ? "border-ink bg-ink text-paper" : "border-neutral-200 bg-paper text-neutral-600 hover:text-ink",
                                )}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <Eyebrow>Texto do documento</Eyebrow>
                        <textarea
                          rows={12}
                          value={bodyText}
                          onChange={(e) => setBodyText(e.target.value)}
                          className="flex-1 resize-none rounded-[12px] border border-neutral-200 bg-paper px-3 py-2 text-caption leading-relaxed text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Preview A4 ao vivo. */}
                <div className="min-w-0 flex-1">{sheet}</div>
              </div>
            )}

            {step === 3 && docType && (
              <div className="flex gap-5">
                <div className="flex w-[300px] shrink-0 flex-col gap-4">
                  {/* Recap do que será gerado. */}
                  <div className="flex items-center gap-3 rounded-[16px] bg-[#f9f9f9] px-4 py-2.5">
                    <Icon name={DOC_TYPES.find((d) => d.key === docType)?.icon ?? "file"} size={16} className="text-neutral-500" />
                    <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{DOC_NAME[docType]}</span>
                  </div>

                  {/* Sugestão da Athena — Usar / Editar / Outra. */}
                  <div className="flex flex-col gap-2 rounded-[16px] border border-neutral-200 bg-[#f9f9f9] p-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                      <Icon name="bot" size={16} /> Sugestão da Athena
                    </span>
                    {editing ? (
                      <textarea
                        rows={7}
                        value={athenaText ?? ""}
                        onChange={(e) => setAthenaText(e.target.value)}
                        className="resize-none rounded-[12px] border border-neutral-200 bg-paper px-3 py-2 text-caption leading-relaxed text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
                      />
                    ) : (
                      <p className="text-caption leading-relaxed text-neutral-700 text-pretty">{athenaText ?? suggestion}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAthenaText(suggestion);
                          setEditing(false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-micro font-medium text-paper"
                      >
                        <Icon name="check" size={16} /> Usar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAthenaText((prev) => prev ?? suggestion);
                          setEditing(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-micro text-ink"
                      >
                        <Icon name="edit" size={16} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSuggestionIdx((i) => i + 1);
                          setAthenaText(null);
                          setEditing(false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-micro text-ink"
                      >
                        <Icon name="refresh" size={16} /> Outra
                      </button>
                    </div>
                  </div>
                  {athenaText !== null && !editing ? (
                    <span className="inline-flex items-center gap-1.5 text-caption text-neutral-500">
                      <Icon name="check-circle" size={16} /> Sugestão aplicada ao documento
                    </span>
                  ) : null}
                </div>

                {/* Preview A4 com a sugestão aplicada. */}
                <div className="min-w-0 flex-1">{sheet}</div>
              </div>
            )}
          </div>

          {/* Rodapé. */}
          <div className="flex items-center gap-3 border-t border-neutral-200/70 px-6 py-4">
            <WireButton variant="ghost" onClick={onClose}>Cancelar</WireButton>
            <span className="flex-1" />
            {step > 0 ? (
              <WireButton variant="secondary" onClick={() => setStep((s) => s - 1)}>Voltar</WireButton>
            ) : null}
            {step < STEPS.length - 1 ? (
              <WireButton
                variant="primary"
                className={cn(!canContinue && "pointer-events-none opacity-40")}
                onClick={() => setStep((s) => s + 1)}
              >
                Continuar
              </WireButton>
            ) : (
              <WireButton
                variant="primary"
                className="gap-2"
                onClick={() => docType && onGenerate(DOC_NAME[docType])}
              >
                <Icon name="description" size={18} />
                Gerar documento
              </WireButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
