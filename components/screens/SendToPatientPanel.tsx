"use client";

import { useState } from "react";
import { WireButton, WireBadge } from "@/components/ui";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { cn } from "@/lib/cn";

// Documentos prontos para envio (mock) — gerados ao longo da consulta. Os de
// controle especial exigem assinatura A3 reforçada.
const DOCS = [
  { icon: "bx-note", label: "Nota clínica", meta: "SOAP · evolução", special: false },
  { icon: "bx-capsule", label: "Receita · CBD 200mg/mL", meta: "Controle especial", special: true },
  { icon: "bx-file", label: "Atestado e laudo", meta: "Uso contínuo", special: false },
  { icon: "bx-test-tube", label: "Solicitação de exames", meta: "Perfil hepático · hemograma", special: false },
];

// Painel de envio ao paciente — overlay local sobre o JourneyShell da Notas
// clínicas. É o próprio vidro (backdrop-filter próprio) e desliza pela direita via
// transição CSS (transform no PRÓPRIO painel é seguro p/ o blur). Reúne os
// documentos gerados, a assinatura digital (certificado A3) e o disparo. Estado
// local: rascunho → assinado → enviado.
export function SendToPatientPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [signed, setSigned] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <SlideOverPanel
      open={open}
      onClose={onClose}
      className="max-w-[680px]"
      label="Enviar ao paciente"
      footer={
        sent ? (
          <span className="flex items-center gap-2 font-mono text-micro uppercase tracking-[0.12em] text-ink">
            <i className="bx bx-check-circle text-lg" />
            Enviado ao paciente
          </span>
        ) : (
          <>
            <WireButton variant="ghost" onClick={onClose}>
              Cancelar
            </WireButton>
            <WireButton
              variant="primary"
              onClick={() => signed && setSent(true)}
              className={cn("gap-2", !signed && "pointer-events-none opacity-40")}
            >
              <i className="bx bx-send text-lg" />
              Assinar e enviar
            </WireButton>
          </>
        )
      }
    >
        <header className="flex items-start gap-3">
          <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
            <i className="bx bx-send text-xl" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Eyebrow>Encerramento · envio</Eyebrow>
            <h2 className="font-display text-title font-medium text-ink text-pretty">
              Enviar ao paciente
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </header>

        <ScrollFade className="mt-6 min-h-0 flex-1 pb-24">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <Eyebrow>Documentos a enviar</Eyebrow>
              <ul className="flex flex-col gap-2">
                {DOCS.map((d) => (
                  <li
                    key={d.label}
                    className="glass-frost-inner flex items-center gap-3 rounded-2xl p-3.5"
                  >
                    <i className={cn("bx shrink-0 text-xl text-neutral-500", d.icon)} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body font-medium text-ink">
                        {d.label}
                      </span>
                      <span className="truncate text-caption text-neutral-500">
                        {d.meta}
                      </span>
                    </div>
                    {d.special ? (
                      <WireBadge tone="mid">Controle especial</WireBadge>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <Eyebrow>Assinatura digital · certificado A3</Eyebrow>
              <button
                type="button"
                onClick={() => setSigned(true)}
                disabled={sent}
                className={cn(
                  "flex h-28 items-center justify-center gap-3 rounded-2xl border border-dashed transition-colors",
                  signed
                    ? "border-ink/40 bg-white/40 text-ink"
                    : "border-neutral-300/80 bg-white/20 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600",
                )}
              >
                <i className={cn("bx text-2xl", signed ? "bx-check-shield" : "bx-pen")} />
                <span className="font-mono text-micro uppercase tracking-[0.12em]">
                  {signed ? "Assinado · A3 verificado" : "Assinar com certificado A3"}
                </span>
              </button>
            </section>

            <section className="flex flex-col gap-2">
              <Eyebrow>Canal</Eyebrow>
              <p className="text-caption text-neutral-600 text-pretty">
                Documentos enviados pelo app do paciente e por e-mail. Questionário
                de seguimento (PROM) disparado automaticamente em 7 dias.
              </p>
            </section>
          </div>
        </ScrollFade>
    </SlideOverPanel>
  );
}
