import { cn } from "@/lib/cn";

export type WireColumn = {
  key: string;
  header: string;
  /** alinhamento à direita para colunas numéricas (mono) */
  numeric?: boolean;
  width?: string;
};

export type WireRow = Record<string, React.ReactNode>;

// Tabela wireframe: cabeçalho mono uppercase, linhas hairline, números tabulares.
export function WireTable({
  columns,
  rows,
  className,
}: {
  columns: WireColumn[];
  rows: WireRow[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-wire border border-neutral-200", className)}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-100">
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "px-4 py-2.5 font-mono text-micro uppercase tracking-[0.1em] text-neutral-500",
                  c.numeric ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-neutral-200 last:border-0 hover:bg-paper-50"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 align-middle text-body text-neutral-700",
                    c.numeric && "text-right font-mono tabular-nums text-ink",
                  )}
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
