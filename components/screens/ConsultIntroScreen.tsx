"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFlow } from "@/flow/store";
import { WireBadge, Avatar, Eyebrow, Icon } from "@/components/ui";

// Pacientes sugeridos com a prontidão da pré-consulta (mesmos dados do diretório,
// PatientsScreen). `pre`+`tone` codificam o quanto a pré-consulta já foi preenchida.
const PATIENTS: { name: string; condition: string; pre: string; tone: "neutral" | "mid" | "hard" }[] = [
  { name: "Marina Castro", condition: "Dor crônica · fibromialgia", pre: "40%", tone: "hard" },
  { name: "André Lobo", condition: "Fibromialgia · retorno", pre: "100%", tone: "neutral" },
  { name: "Júlia Tavares", condition: "Insônia refratária", pre: "20%", tone: "mid" },
  { name: "Rui Salgado", condition: "Dor neuropática", pre: "65%", tone: "mid" },
  { name: "Helena Pires", condition: "Ansiedade · dor", pre: "100%", tone: "neutral" },
];

// CENTRO (tela cheia) — launcher do módulo "Consulta e Análise": título display,
// barra de busca centralizada (estilo Google) e sugestões de pacientes. Cada linha
// traz o nome de um lado e a prontidão da pré-consulta do outro. Escolher um
// paciente inicia a consulta. Renderizada full-bleed pelo WorkspaceShell (sem
// coluna esquerda nem painel Athena).
export function ConsultIntroCenter() {
  const goTo = useFlow((s) => s.goTo);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATIENTS;
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.condition.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="station-fade no-scrollbar flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 py-12">
        {/* Wordmark display do módulo (estilo "logo" acima da busca). */}
        <div className="flex flex-col items-center gap-3 text-center">
         
          <h1 className="font-display text-display-l font-medium leading-[1.05] text-ink">
            Consulta e Análise
          </h1>
       
        </div>

        {/* Barra estilo Google — pílula de vidro, ícone + input controlado. */}
        <div className="glass-panel-blue backdrop-blur-2xl flex w-full items-center gap-3 rounded-full px-5 py-3.5">
          <Icon name="search" size={20} className="text-neutral-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar paciente por nome ou condição…"
            className="flex-1 bg-transparent text-body text-ink placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        {/* Sugestões — nome de um lado da linha, prontidão da pré do outro. */}
        <div className="w-full">
          <Eyebrow className="px-2">
            {q.trim() ? "Resultados" : "Sugestões para hoje"}
          </Eyebrow>
          {results.length > 0 ? (
            <ul className="mt-2 flex flex-col divide-y divide-white/40">
              {results.map((p) => (
                <li key={p.name}>
                  <button
                    onClick={() => goTo("consult")}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-white/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={p.name} size="sm" />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-body font-medium text-ink">
                          {p.name}
                        </span>
                        <span className="truncate text-caption text-neutral-600">
                          {p.condition}
                        </span>
                      </div>
                    </div>
                    <WireBadge tone={p.tone}>Pré {p.pre}</WireBadge>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 px-2 py-4 text-caption text-neutral-500">
              Nenhum paciente encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
