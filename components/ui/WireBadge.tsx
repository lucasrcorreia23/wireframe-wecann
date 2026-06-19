import { cn } from "@/lib/cn";

type Tone = "neutral" | "soft" | "mid" | "hard";

// Gravidade clínica codificada por PESO de cinza + espessura de borda, nunca por
// cor (§2.1). soft=informativo, mid=atenção, hard=crítico.
const TONE: Record<Tone, string> = {
  neutral: "border-neutral-300 text-neutral-600 bg-paper",
  soft: "border-neutral-300 text-state-soft bg-paper",
  mid: "border-neutral-500 text-state-mid bg-neutral-100",
  hard: "border-2 border-state-hard text-state-hard bg-neutral-200 font-medium",
};

export function WireBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-wire border px-2 py-0.5",
        "font-mono text-micro uppercase tracking-[0.08em]",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
