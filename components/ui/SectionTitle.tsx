import { cn } from "@/lib/cn";

type Size = "m" | "l" | "xl";

const SIZE: Record<Size, string> = {
  m: "text-display-m",
  l: "text-display-l",
  xl: "text-display-xl",
};

// Título display (Fraunces) — momentos editoriais e títulos de estação (§2.2).
// Usar com restrição, em tamanhos grandes.
export function SectionTitle({
  children,
  size = "m",
  as: Tag = "h2",
  className,
}: {
  children: React.ReactNode;
  size?: Size;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-display font-medium text-ink text-balance",
        SIZE[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
