"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { PATIENTS, type Patient } from "@/lib/patients";
import { PatientAvatar } from "./PatientAvatar";

// Dropdown COMPACTO de pacientes do "Discutir um caso" — card pequeno ancorado
// logo ACIMA do campo de busca (a pílula), não sobre a coluna toda (mock):
// "Selecione um paciente" + linhas avatar 28px / nome 14 / "idade · CID" 12.
// Filtra por nome/condição; a query e o open vivem no PromptBox.
export function PatientDropdown({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (patient: Patient) => void;
}) {
  const results = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return PATIENTS;
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.condition.toLowerCase().includes(s),
    );
  }, [query]);

  return (
    <div className="absolute bottom-[calc(100%+10px)] right-0 z-40 w-[300px] rounded-[20px] border border-border-soft bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
      <p className="px-2.5 pt-1.5 pb-1 text-[12px] leading-[1.4] text-neutral-400">
        Selecione um paciente
      </p>
      {results.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {results.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                // Não tira o foco do input (senão o onBlur fecha antes do clique).
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(p)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-neutral-50",
                  i === 0 && "bg-neutral-50",
                )}
              >
                <PatientAvatar patient={p} className="size-7 text-[10px]" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] font-medium leading-[1.3] text-ink">
                    {p.name}
                  </span>
                  <span className="text-[12px] leading-[1.3] text-neutral-500">
                    {p.age} · {p.code}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2.5 py-2 text-[13px] text-neutral-500">
          Nenhum paciente encontrado.
        </p>
      )}
    </div>
  );
}
