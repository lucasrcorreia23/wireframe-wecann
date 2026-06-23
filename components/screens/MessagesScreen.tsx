"use client";

import { useFlow } from "@/flow/store";
import { WireBadge, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";

// `messages` — Mensagens: inbox das mensagens automatizadas recebidas dos
// clientes/pacientes (confirmações, lembretes, respostas de questionário).
type Status = "nova" | "automática" | "respondida";

const THREADS: { initials: string; name: string; preview: string; time: string; status: Status }[] = [
  { initials: "MC", name: "Marina Castro", preview: "Confirmou presença na consulta de quinta às 09:30.", time: "08:12", status: "automática" },
  { initials: "AL", name: "André Lobo", preview: "Respondeu ao questionário pós-consulta (PSQI).", time: "Ontem", status: "nova" },
  { initials: "JT", name: "Júlia Tavares", preview: "Solicitou remarcação — sugeriu sexta de manhã.", time: "Ontem", status: "nova" },
  { initials: "RS", name: "Rui Salgado", preview: "Receita de controle especial enviada e recebida.", time: "Seg", status: "respondida" },
  { initials: "HP", name: "Helena Pires", preview: "Lembrete automático de renovação enviado.", time: "Seg", status: "automática" },
];

const TONE: Record<Status, "neutral" | "mid" | "hard"> = {
  nova: "hard",
  automática: "mid",
  respondida: "neutral",
};

export function MessagesScreen() {
  const goTo = useFlow((s) => s.goTo);

  return (
    <div className="orbit-pane flex w-full max-w-[920px] flex-col gap-4">
      <ModuleCard className="gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex flex-col gap-1">
              <Eyebrow icon="bx-message">Mensagens</Eyebrow>
              <h2 className="font-display text-title font-medium text-ink">
                Caixa de entrada
              </h2>
            </div>
          </div>
          <WireBadge tone="hard">2 novas</WireBadge>
        </div>

        <ul className="flex flex-col gap-2">
          {THREADS.map((t) => (
            <li key={t.name}>
              <button
                onClick={() => goTo("pre-review")}
                className="glass-frost-inner flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:border-ink/20"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/50 bg-white/40 font-mono text-micro text-neutral-700">
                  {t.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-body font-medium text-ink">{t.name}</span>
                  <span className="truncate text-caption text-neutral-600">
                    {t.preview}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-micro text-neutral-400">{t.time}</span>
                  <WireBadge tone={TONE[t.status]}>{t.status}</WireBadge>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </div>
  );
}
