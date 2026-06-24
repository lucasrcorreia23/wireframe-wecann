"use client";

import { cn } from "@/lib/cn";

// Controle segmentado (pílula): opções lado a lado, a ativa ganha fundo "paper" +
// sombra sutil. Genérico no tipo da chave. Usado p/ alternar sub-abas (resumo/
// escalas/status) e o registro C2/C3 (leigo/técnico) do sumário ao paciente.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { key: T; label: React.ReactNode }[];
  value: T;
  onChange: (k: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-white/40 p-1",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-caption transition-colors duration-[180ms]",
            value === o.key
              ? "bg-paper font-medium text-ink shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
