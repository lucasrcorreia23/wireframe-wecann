import { cn } from "@/lib/cn";

// Ícone Material Symbols (Outlined) no traço FINO (wght 200, classe .msym em
// globals.css). O `name` é a ligadura do ícone — ex.: "flag", "trending_up",
// "medication". Usado nos ícones de seção/clínicos que o Figma nomeia. Para
// controles de chrome (chevron, busca, voltar) usamos Boxicons (`bx`).
export function MaterialIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("msym", className)}>
      {name}
    </span>
  );
}
