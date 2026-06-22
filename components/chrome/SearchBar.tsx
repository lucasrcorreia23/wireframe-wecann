"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFlow } from "@/flow/store";

const PATIENTS = [
  { initials: "MC", name: "Marina Castro", condition: "Dor crônica · fibromialgia" },
  { initials: "AL", name: "André Lobo", condition: "Fibromialgia · retorno" },
  { initials: "JT", name: "Júlia Tavares", condition: "Insônia refratária" },
  { initials: "RS", name: "Rui Salgado", condition: "Dor neuropática" },
  { initials: "HP", name: "Helena Pires", condition: "Ansiedade · dor" },
];

// Barra de busca de pacientes: surge no topo, de ponta a ponta com margem igual
// (topo = laterais) e cantos arredondados. Resultados (mock) abrem o Paciente 360.
export function SearchBar() {
  const open = useFlow((s) => s.searchOpen);
  const toggleSearch = useFlow((s) => s.toggleSearch);
  const goTo = useFlow((s) => s.goTo);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggleSearch]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATIENTS;
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.condition.toLowerCase().includes(s),
    );
  }, [q]);

  if (!open) return null;

  return (
    <>
      <div
        className="pointer-events-auto fixed inset-0 z-30"
        onClick={() => toggleSearch(false)}
      />
      <div className="panel-in-right pointer-events-auto fixed inset-x-4 top-4 z-40">
        <div className="glass-panel-blue overflow-hidden rounded-[28px] p-2">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <i className="bx bx-search text-xl text-neutral-500" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar paciente por nome ou condição…"
              className="flex-1 bg-transparent text-body text-ink placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              onClick={() => toggleSearch(false)}
              className="font-mono text-micro text-neutral-400 hover:text-ink"
            >
              Esc
            </button>
          </div>

          {results.length > 0 ? (
            <ul className="flex flex-col gap-1 border-t border-white/40 p-2">
              {results.map((p) => (
                <li key={p.name}>
                  <button
                    onClick={() => goTo("pre-review")}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/45"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/50 bg-white/40 font-mono text-micro text-neutral-700">
                      {p.initials}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-body font-medium text-ink">{p.name}</span>
                      <span className="truncate text-caption text-neutral-600">
                        {p.condition}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-white/40 px-4 py-4 text-caption text-neutral-500">
              Nenhum paciente encontrado.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
