// Fonte compartilhada de pacientes para o fluxo "Discutir um caso" (fixar
// paciente). Sem foto: o avatar é um círculo de iniciais (padrão do app — só o
// médico tem foto). `age`/`code` (idade · CID-10) aparecem no dropdown.
export type Patient = {
  id: string;
  initials: string;
  name: string;
  condition: string;
  age: string;
  code: string;
};

export const PATIENTS: Patient[] = [
  { id: "marina-castro", initials: "MC", name: "Marina Castro", condition: "Dor crônica · fibromialgia", age: "38a", code: "M54.5" },
  { id: "andre-lobo", initials: "AL", name: "André Lobo", condition: "Fibromialgia · retorno", age: "45a", code: "M79.7" },
  { id: "julia-tavares", initials: "JT", name: "Júlia Tavares", condition: "Insônia refratária", age: "31a", code: "G47.0" },
  { id: "rui-salgado", initials: "RS", name: "Rui Salgado", condition: "Dor neuropática", age: "52a", code: "M79.2" },
  { id: "helena-pires", initials: "HP", name: "Helena Pires", condition: "Ansiedade · dor", age: "29a", code: "F41.1" },
];
