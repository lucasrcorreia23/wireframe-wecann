import { cn } from "@/lib/cn";

// Campo de formulário wireframe (não-funcional, mock). Renderiza rótulo + uma
// "linha" de input vazia, ou um valor mock quando fornecido. `mono` para dados
// clínicos (CID, dose, SLA).
export function WireField({
  label,
  value,
  placeholder,
  mono = false,
  area = false,
  className,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  mono?: boolean;
  area?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </span>
      <span
        className={cn(
          "flex rounded-wire border border-neutral-300 bg-paper-50 px-3 text-body",
          area ? "min-h-20 py-2 items-start" : "h-10 items-center",
          mono ? "font-mono" : "font-sans",
          value ? "text-ink" : "text-neutral-400",
        )}
      >
        {value ?? placeholder ?? "—"}
      </span>
    </label>
  );
}
