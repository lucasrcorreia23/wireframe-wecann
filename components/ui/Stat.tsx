import { cn } from "@/lib/cn";

// Número clínico + rótulo. O valor é SEMPRE mono (dose, grau, SLA, %, métricas).
export function Stat({
  value,
  label,
  hint,
  className,
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono text-title leading-none tabular-nums text-ink">
        {value}
      </span>
      <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </span>
      {hint ? (
        <span className="text-caption text-neutral-500">{hint}</span>
      ) : null}
    </div>
  );
}
