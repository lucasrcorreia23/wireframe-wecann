"use client";

import { useState } from "react";
import { WireButton } from "@/components/ui";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { cn } from "@/lib/cn";

// Painel "Novo agendamento" — overlay da Home. Usa o SlideOverPanel (padrão da
// pílula: desliza da direita, GSAP 0.5s power2.out, vidro + rounded-[28px]).
// Campos espelham a referência da imagem.
export function NewAppointmentPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [modality, setModality] = useState<"presencial" | "telemedicina">(
    "presencial",
  );

  return (
    <SlideOverPanel
      open={open}
      onClose={onClose}
      className="max-w-[760px]"
      label="Novo agendamento"
      footer={
        <>
          <WireButton variant="ghost" onClick={onClose}>
            Cancelar
          </WireButton>
          <WireButton variant="primary" onClick={onClose} className="gap-2">
            <i className="bx bx-calendar-check text-lg" />
            Agendar
          </WireButton>
        </>
      }
    >
      {/* Header */}
      <header className="flex items-center gap-3">
        <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
          <i className="bx bx-plus text-xl" />
        </span>
        <h2 className="font-display text-title font-medium text-ink">
          Novo agendamento
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="ml-auto grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
        >
          <i className="bx bx-x text-2xl" />
        </button>
      </header>

      {/* Campos — pb p/ o último campo não ficar sob o CTA fixo (rola atrás dele). */}
      <div className="no-scrollbar mt-6 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-24">
        <Field label="Paciente *">
          <div className="glass-frost-inner flex items-center gap-2 rounded-2xl px-4 py-3">
            <i className="bx bx-search text-lg text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome…"
              className="w-full bg-transparent text-body text-ink placeholder:text-neutral-400 focus:outline-none"
            />
          </div>
        </Field>

        <Field label="Profissional *">
          <div className="glass-frost-inner flex items-center gap-2 rounded-2xl px-4 py-3">
            <i className="bx bx-plus-medical text-lg text-neutral-400" />
            <span className="text-body text-ink">Dr. Demo Sandbox</span>
          </div>
        </Field>

        <div className="grid grid-cols-[1fr_auto] gap-4">
          <Field label="Tipo">
            <div className="glass-frost-inner flex items-center justify-between gap-2 rounded-2xl px-4 py-3">
              <span className="text-body text-ink">Consulta</span>
              <i className="bx bx-chevron-down text-lg text-neutral-400" />
            </div>
          </Field>
          <Field label="Modalidade">
            <div className="flex items-center gap-2">
              <ModalityButton
                active={modality === "presencial"}
                onClick={() => setModality("presencial")}
                icon="bx-map"
              >
                Presencial
              </ModalityButton>
              <ModalityButton
                active={modality === "telemedicina"}
                onClick={() => setModality("telemedicina")}
                icon="bx-video"
              >
                Telemedicina
              </ModalityButton>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Data">
            <input
              type="date"
              defaultValue="2026-06-23"
              className="glass-frost-inner w-full rounded-2xl px-4 py-3 text-body text-ink focus:outline-none"
            />
          </Field>
          <Field label="Horário">
            <input
              type="time"
              defaultValue="09:00"
              className="glass-frost-inner w-full rounded-2xl px-4 py-3 text-body text-ink focus:outline-none"
            />
          </Field>
          <Field label="Duração">
            <div className="glass-frost-inner flex items-center justify-between gap-2 rounded-2xl px-4 py-3">
              <span className="text-body text-ink">30 min</span>
              <i className="bx bx-chevron-down text-lg text-neutral-400" />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone contato">
            <input
              type="tel"
              placeholder="(48) 99999-9999"
              className="glass-frost-inner w-full rounded-2xl px-4 py-3 text-body text-ink placeholder:text-neutral-400 focus:outline-none"
            />
          </Field>
          <Field label="Observações">
            <input
              type="text"
              placeholder="Ex: Encaixe, retorno urgente"
              className="glass-frost-inner w-full rounded-2xl px-4 py-3 text-body text-ink placeholder:text-neutral-400 focus:outline-none"
            />
          </Field>
        </div>
      </div>
    </SlideOverPanel>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

function ModalityButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-[46px] items-center gap-2 rounded-2xl px-4 text-body font-medium transition-colors",
        active
          ? "bg-ink text-paper"
          : "glass-frost-inner text-neutral-600 hover:text-ink",
      )}
    >
      <i className={cn("bx text-lg", icon)} />
      {children}
    </button>
  );
}
