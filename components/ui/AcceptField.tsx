"use client";

import { Eyebrow } from "./Eyebrow";
import { AthenaTag } from "./AthenaTag";
import { cn } from "@/lib/cn";

// Decisão do médico sobre uma sugestão da IA (espelha o DivergenceRow da
// Conferência). "pending" = ainda não validada.
export type Decision = "pending" | "accepted" | "edited" | "rejected";

const STATUS_LABEL: Record<Exclude<Decision, "pending">, string> = {
  accepted: "Aceito",
  edited: "Editado",
  rejected: "Recusado",
};

// Campo de documento preenchido pela IA e validável pelo médico. O trio
// Aceitar/Editar/Rejeitar aparece no HOVER (ou foco) e fica fixo quando há decisão.
// Controlado: o estado vive na seção (para o "Aceitar seção" em lote). Sem cor —
// peso de cinza; aceito/editado/recusado = botão preenchido com tinta.
export function AcceptField({
  label,
  children,
  decision,
  onDecision,
  className,
}: {
  label: string;
  children: React.ReactNode;
  decision: Decision;
  onDecision: (d: Decision) => void;
  className?: string;
}) {
  const decided = decision !== "pending";

  // Clicar na decisão ativa volta para "pending" (toggle); senão aplica a decisão.
  const toggle = (d: Exclude<Decision, "pending">) =>
    onDecision(decision === d ? "pending" : d);

  return (
    <div
      className={cn(
        "group glass-frost-inner flex flex-col gap-2 rounded-2xl p-3.5",
        decision === "rejected" && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Eyebrow>{label}</Eyebrow>
            <AthenaTag />
          </div>
          <div
            className={cn(
              "text-body text-ink text-pretty",
              decision === "rejected" && "line-through decoration-neutral-400",
            )}
          >
            {children}
          </div>
        </div>

        {/* Trio — escondido até o hover/foco; fixo quando decidido. */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100",
            decided && "opacity-100",
          )}
        >
          <TrioButton
            active={decision === "accepted"}
            label="Aceitar"
            icon="bx-check"
            onClick={() => toggle("accepted")}
          />
          <TrioButton
            active={decision === "edited"}
            label="Editar"
            icon="bx-pencil"
            onClick={() => toggle("edited")}
          />
          <TrioButton
            active={decision === "rejected"}
            label="Rejeitar"
            icon="bx-x"
            onClick={() => toggle("rejected")}
          />
        </div>
      </div>

      {decided ? (
        <div className="flex justify-end border-t border-white/50 pt-2">
          <span className="font-mono text-micro text-neutral-500">
            {STATUS_LABEL[decision]} · registrado em log de auditoria
          </span>
        </div>
      ) : null}
    </div>
  );
}

function TrioButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-neutral-300 text-neutral-600 hover:border-neutral-500",
      )}
    >
      <i className={cn("bx", icon, icon === "bx-pencil" ? "text-base" : "text-lg")} />
    </button>
  );
}
