import { cn } from "@/lib/cn";
import { ICON_SVG } from "./icons.generated";

// Ícone como SVG INLINE (vetor de verdade) no lugar da fonte boxicons. Isso é o
// que permite "copiar a tela pro Figma" com os ícones: ferramentas de HTML→Figma
// leem o DOM e capturam <svg>, mas NÃO capturam glifos de fonte em ::before.
//
// Drop-in da fonte: dimensiona por `1em` (mesma escala de `text-base/lg/...`) e
// pinta por `currentColor` (mesma `text-*`), então as classes que você já usava
// (`text-base text-neutral-400`, etc.) continuam valendo — só vão no `className`.
//
// `name` é o mesmo identificador boxicons (ex.: "bx-capsule"). Nome inexistente
// no mapa → não renderiza nada (igual ao tofu da fonte hoje).
export function Icon({
  name,
  className,
  title,
}: {
  name?: string;
  className?: string;
  title?: string;
}) {
  const body = name ? ICON_SVG[name] : undefined;
  if (!body) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      className={cn("inline-block h-[1em] w-[1em] shrink-0 fill-current align-middle", className)}
      dangerouslySetInnerHTML={{ __html: title ? `<title>${title}</title>${body}` : body }}
    />
  );
}
