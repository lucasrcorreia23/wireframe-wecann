import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT: Record<Variant, string> = {
  // Primário = tinta cheia; hierarquia por peso de cinza, não por cor.
  primary:
    "bg-ink text-paper border border-ink hover:bg-neutral-800",
  secondary:
    "bg-paper text-ink border border-neutral-300 hover:border-neutral-500",
  ghost:
    "bg-transparent text-neutral-600 border border-transparent hover:text-ink hover:border-neutral-200",
};

// Botão wireframe. Copy em voz ativa e sentence case (§2.4). `as="span"` para uso
// dentro de contextos não-interativos do wireframe.
export function WireButton({
  children,
  variant = "secondary",
  size = "md",
  type = "button",
  onClick,
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-sans font-medium",
        "transition-colors duration-[180ms]",
        size === "sm" ? "h-8 px-3 text-caption" : "h-10 px-4 text-body",
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
