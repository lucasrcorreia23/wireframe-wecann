import { cn } from "@/lib/cn";

// Eyebrow/label: mono, uppercase, tracking largo (§2.2). Usado acima de títulos
// e como rótulo de seção/funcionalidade.
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-micro uppercase tracking-[0.14em] text-neutral-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
