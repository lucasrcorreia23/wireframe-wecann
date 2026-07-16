// Conteúdo VERBATIM dos mocks do chat (Figma 5H6SbN4KKTd7pioxfszowB,
// nodes 0-174 / 0-279 / 0-459). Wireframe: a "resposta da IA" é este mock.

/** Mensagens que ciclam durante o loading (a 1ª é verbatim do mock). */
export const CHAT_STATUSES = [
  "Buscando artigos referencia...",
  "Analisando evidências clínicas...",
  "Sintetizando pesquisas...",
];

export const ANSWERED_STATUS = "Consulta analisada, pesquisas sintetizadas";

export const CHAT_PLACEHOLDER = "Complemente com outras perguntas";

export type AnswerBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "bullet"; lead: string; text: string };

export const ANSWER_BLOCKS: AnswerBlock[] = [
  {
    kind: "p",
    text: "O canabidiol (CBD) farmacêutico de grau purificado demonstrou eficácia significativa como terapia adjuvante para epilepsias refratárias pediátricas, especificamente com síndromes de Dravet, Lennox-Gastaut e complexo de esclerose tuberosa. O FDA aprovou o CBD (Epidiolex) para essas indicações em pacientes a partir de 1 ano de idade.",
  },
  { kind: "h", text: "Efeito" },
  {
    kind: "p",
    text: "Ensaios clínicos randomizados controlados demonstraram uma redução clinicamente significativa na frequência de crises em comparação com placebo:",
  },
  {
    kind: "bullet",
    lead: "• Redução de crises:",
    text: " Uma meta-análise de ensaios randomizados controlados com placebo demonstrou redução mediana de 37-42% na frequência de crises com CBD 20mg/kg/dia como terapia adjuvante, comparado a 17-20% com placebo (IC 95% para diferença do tratamento: 12.2-27.8%, p<0.001).",
  },
  {
    kind: "bullet",
    lead: "• Proporção ≥50% de resposta:",
    text: " A proporção de pacientes que alcançaram ≥50% de redução na frequência de crises total foi de 37-46% no grupo CBD, versus 18-27% no grupo placebo.",
  },
  {
    kind: "bullet",
    lead: "• Status de livre de crises:",
    text: " Uma análise combinada indicou que 5-8% dos pacientes tratados com CBD alcançaram estado completamente livre de crises, comparado a 0-1% com placebo (p<0.05) para síndromes de Dravet e Lennox-Gastaut.",
  },
  {
    kind: "bullet",
    lead: "• Análise por subtipo:",
    text: " A eficácia variou por síndrome - redução mediana de crises convulsivas de 39% (Dravet) e 41-44% de crises com queda (Lennox-Gastaut), consistente em múltiplos ensaios pivotais.",
  },
  {
    kind: "bullet",
    lead: "• Efeito sustentado:",
    text: " Uma análise do programa de acesso expandido (OLE) com ≥96 semanas de acompanhamento demonstrou manutenção sustentada dos efeitos, com redução mediana de crises de 50-60% após tratamento prolongado.",
  },
  {
    kind: "bullet",
    lead: "• Liberdade de crises:",
    text: " O CBD tem efeito que placebo em alcançar liberdade completa de crises.",
  },
];

/** Tag das referências → cor do dot do chip (valores exatos do Figma). */
export const TAG_DOT: Record<string, string> = {
  Recent: "rgba(179, 136, 235, 0.25)",
  Review: "rgba(136, 234, 197, 0.25)",
  SR: "rgba(95, 146, 255, 0.25)",
  RCT: "rgba(179, 136, 235, 0.25)",
};

export type Reference = {
  title: string; // laranja #f37b50, Inter SemiBold 14
  source?: string; // "Journal. Ano." — Inter 14 ink
  hot?: boolean; // bolinha vermelha antes da fonte
  authors?: string; // Inter 12 #676867
  tags?: string[];
  book?: boolean; // ícone de livro à direita
};

export const REFERENCES: Reference[] = [
  { title: "FDA Orange Book.", source: "FDA Orange Book. 2026." },
  {
    title: "Therapeutic Use of Cannabis and Cannabinoids.",
    source: "The Journal of the American Medical Association. 2025.",
    hot: true,
    authors: "Hsu M, Shah A, Jordan A, Gold MS, Hill KP.",
    tags: ["Recent", "Review"],
    book: true,
  },
  {
    title:
      "Evidence for Cannabis and Cannabinoids for Epilepsy: A Systematic Review of Controlled and Observational Evidence.",
    source: "Journal of Neurology, Neurosurgery, and Psychiatry. 2018.",
    authors: "Stockings E, Zagic D, Campbell G, et al.",
    tags: ["SR"],
  },
  {
    title:
      "Clinical Efficacy and Safety of Cannabidiol for Pediatric Refractory Epilepsy Indications: A Systematic Review and Meta-Analysis.",
    source: "Experimental Neurology. 2023.",
    authors: "Talwar A, Estes E, Aparasu R, Reddy DS.",
    tags: ["SR"],
  },
  {
    title: "Effect of Cannabidiol on Drop Seizures in the Lennox-Gastaut Syndrome.",
    source: "The New England Journal of Medicine. 2018.",
    hot: true,
    authors: "Devinsky O, Patel AD, Cross JH, et al.",
    tags: ["RCT"],
    book: true,
  },
  {
    title:
      "Adjunctive Cannabidiol for Drug-Resistant Epilepsy: A Systematic Review and Meta-Analysis of Randomized Trials Across Syndromes, Formulations, and Dose Ranges.",
  },
];

export const FOLLOW_UPS = [
  "Quais grupos de pacientes com epilepsia mais se beneficiam d uso de cannabis medicinal",
  "Pacientes com epilepsia refratária que não respondem a tratamentos tradicionais",
  "Pacientes com epilepsia focal que apresentam crises frequentes e debilitantes",
];

/** Sessões recentes do modo chat (9 itens, verbatim do node 0-174). */
export const CHAT_SESSIONS = [
  "Quais são os últimos avanços no tratamento da diabetes tipo 2?",
  "Estudos recentes sobre a eficácia da terapia gênica em doenças raras.",
  "A análise de novas vacinas para prever surtos de doenças infecciosas.",
  "Investigações sobre o impacto das mudanças climáticas na biodiversidade marinha.",
  "Pesquisas sobre o uso de inteligência artificial na detecção precoce de câncer.",
  "Estudos comparativos de tratamentos farmacológicos em doenças autoimunes.",
  "Relatórios sobre a eficácia de programas de reabilitação em dependência química.",
  "Como a microbiota intestinal influencia a saúde mental?",
  "Quais são os efeitos colaterais mais comuns da quimioterapia?",
];
