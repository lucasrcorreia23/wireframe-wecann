import type { Appt } from "./AppointmentSummaryPanel";

// Fonte única dos pacientes/agendamentos (dados clínicos + contexto do Preview).
// A Home ("Agenda do dia") e a Agenda (grade da semana) referenciam por chave e
// adicionam só o layout próprio (lista vs. grade) — assim o Modal Preview é
// IDÊNTICO nos dois pontos de entrada. `day/hour/span` aqui são o "slot de hoje"
// (default); a Agenda sobrescreve a posição na grade quando precisa.
export type PatientKey = "marina" | "andre" | "julia" | "rui" | "helena" | "bruno";

export const PATIENTS: Record<PatientKey, Appt> = {
  marina: {
    kind: "patient", day: 3, hour: 9, span: 1,
    title: "Marina Castro", sub: "Pré-consulta · Dor", tone: "mid",
    type: "Pré-consulta", reason: "Dor lombar refratária — reavaliação de conduta.",
    patientMeta: "38 anos · Dor crônica",
    age: 38, photoSeed: "marina", followUp: "em acompanhamento há 8 meses",
    mainDiagnosis: { cid: "M54.5", name: "Dor lombar baixa crônica" },
    preState: "respondida",
    highlights: [
      "Queixa: dor lombar persistente, pior à noite; sono fragmentado.",
      "Desde a última consulta: reduziu tramadol; relata sonolência diurna.",
      "Objetivo: reduzir opioides e recuperar funcionalidade.",
    ],
    alerts: [
      { label: "Alergia a dipirona", tone: "hard" },
      { label: "Interação potencial: amitriptilina × CBD (sedação)", tone: "mid" },
    ],
    episode: "CBD 200mg/mL", timepoint: "M3", stars: 2,
  },
  andre: {
    kind: "patient", day: 3, hour: 10, span: 1,
    title: "André Lobo", sub: "Retorno · Fibromialgia", type: "Retorno",
    reason: "Fibromialgia — acompanhamento.", patientMeta: "45 anos · Fibromialgia",
    age: 45, photoSeed: "andre", followUp: "em acompanhamento há 1 ano",
    mainDiagnosis: { cid: "M79.7", name: "Fibromialgia" },
    preState: "pendente",
    episode: "CBD 50mg/mL", timepoint: "M6", stars: 2,
  },
  julia: {
    kind: "patient", day: 3, hour: 11, span: 1,
    title: "Júlia Tavares", sub: "1ª consulta · Insônia", type: "1ª consulta",
    reason: "Insônia persistente — primeira consulta.", patientMeta: "29 anos · Insônia",
    age: 29, photoSeed: "julia", followUp: "1ª consulta",
    mainDiagnosis: { cid: "G47.0", name: "Insônia" },
    preState: "primeira",
    stars: 0,
  },
  rui: {
    kind: "patient", day: 3, hour: 13, span: 1,
    title: "Rui Salgado", sub: "Controle especial", tone: "hard",
    type: "Controle especial", reason: "Renovação de receita — controle especial.",
    patientMeta: "52 anos · Dor neuropática",
    age: 52, photoSeed: "rui", followUp: "em acompanhamento há 5 meses",
    mainDiagnosis: { cid: "G62.9", name: "Polineuropatia" },
    preState: "nao-enviada",
    alerts: [{ label: "Receita de controle especial vence em 2 dias", tone: "mid" }],
    episode: "CBD 100mg/mL", timepoint: "M1", stars: 1,
  },
  helena: {
    kind: "patient", day: 3, hour: 14, span: 1,
    title: "Helena Pires", sub: "Retorno · Artrose", type: "Retorno",
    reason: "Retorno — reavaliação de conduta.", patientMeta: "61 anos · Artrose",
    age: 61, photoSeed: "helena", followUp: "em acompanhamento há 4 meses",
    mainDiagnosis: { cid: "M19.9", name: "Artrose" },
    preState: "respondida",
    highlights: [
      "Queixa: dor articular matinal; melhora parcial com a conduta atual.",
      "Desde a última consulta: melhor mobilidade; mantém esquema.",
    ],
    episode: "CBD 200mg/mL", timepoint: "M3", stars: 2,
  },
  bruno: {
    kind: "patient", day: 3, hour: 15, span: 1,
    title: "Bruno Antunes", sub: "Avaliação · Dor difusa", type: "Avaliação",
    reason: "Avaliação inicial — dor crônica difusa.", patientMeta: "57 anos · Dor difusa",
    age: 57, photoSeed: "bruno", followUp: "1ª avaliação",
    mainDiagnosis: { cid: "M47.8", name: "Espondilose" },
    preState: "pendente",
    stars: 0,
  },
};
