"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Patient } from "@/lib/patients";
import { PatientAvatar } from "./PatientAvatar";
import { PatientDropdown } from "./PatientDropdown";

// Gradiente brand em baixa opacidade (Figma: 588DFF → 94B8F0 → F36350 →
// FCD757) — fundo da pílula "Discutir um caso" e do chip do paciente fixado.
const PILL_GRADIENT =
  "linear-gradient(90deg, rgba(88,141,255,0.18) 0%, rgba(148,184,240,0.14) 28%, rgba(243,99,80,0.14) 55%, rgba(252,215,87,0.18) 100%)";

// Lupa em traço grosso desenhada inline (o asset icon-search.svg é um path
// fino preenchido — não engrossa via CSS e lia sutil demais na pílula).
function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M15.4 15.4 20 20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Botão navy circular (mic ⇄ ENVIAR). Reutilizado no modo normal e no modo
// "discutir um caso" (lá só mic, decorativo).
function MicSendButton({
  hasText,
  onClick,
}: {
  hasText: boolean;
  onClick?: () => void;
}) {
  return (
    <span className="brand-underline inline-grid rounded-full pb-1 drop-shadow-[0px_0px_13.5px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        aria-label={hasText ? "Enviar" : "Comando de voz"}
        onClick={onClick}
        className="grid size-10 place-items-center rounded-full bg-navy"
      >
        <img
          src="/figma/icon-mic.svg"
          alt=""
          className={cn(
            "col-start-1 row-start-1 size-6 transition-opacity duration-200",
            hasText && "opacity-0",
          )}
        />
        <img
          src="/figma/icon-send.svg"
          alt=""
          className={cn(
            "col-start-1 row-start-1 size-5 brightness-0 invert transition-opacity duration-200",
            !hasText && "opacity-0",
          )}
        />
      </button>
    </span>
  );
}

// Caixa de prompt (Figma): digitação em cima, ações embaixo. O botão navy
// alterna mic ⇄ ENVIAR conforme há texto. Enter envia; Shift+Enter quebra
// linha. Fluxo "Discutir um caso" (só na Home idle, quando `onPinPatient`
// existe): a PRÓPRIA pílula vira um campo de busca inline (anel gradiente,
// mesmo lugar da linha de ações) com o dropdown COMPACTO ancorado logo acima
// dela; escolher fixa o paciente e a pílula vira o CHIP do paciente (avatar +
// nome — um por vez; clicar troca, ✕ desafixa).
export function PromptBox({
  placeholder,
  onSend,
  disabled,
  onPinPatient,
  pinnedPatient,
  onUnpin,
}: {
  placeholder: string;
  onSend: (question: string) => void;
  disabled?: boolean;
  onPinPatient?: (patient: Patient) => void;
  pinnedPatient?: Patient | null;
  onUnpin?: () => void;
}) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hasText = value.trim().length > 0;

  // Modo "discutir um caso": campo vira busca de paciente + dropdown.
  const [caseMode, setCaseMode] = useState(false);
  const [caseQuery, setCaseQuery] = useState("");
  const exitCase = () => {
    setCaseMode(false);
    setCaseQuery("");
  };

  const send = () => {
    const q = value.trim();
    if (!q || disabled) return;
    onSend(q);
    setValue("");
    taRef.current?.focus();
  };

  return (
    <section
      data-flip-id="prompt"
      className="relative flex w-full flex-col gap-4 rounded-[20px] border border-border-soft bg-white p-[16px]"
    >
      <textarea
        ref={taRef}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        className="h-[23px] w-full resize-none bg-transparent text-[14px] leading-[1.6] text-ink placeholder:text-neutral-500 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <button
          aria-label="Anexar"
          className="grid size-10 place-items-center rounded-full bg-[#fcfdff]"
        >
          <img src="/figma/icon-add.svg" alt="" className="size-6" />
        </button>
        <div className="flex items-center gap-3">
          {onPinPatient &&
            (caseMode ? (
              // Modo busca: a pílula vira o campo (anel gradiente) e o
              // dropdown COMPACTO ancora logo acima dela.
              <span
                className="relative inline-flex rounded-full p-px"
                style={{
                  background:
                    "linear-gradient(90deg, #588dff, #94b8f0, #f36350, #fcd757)",
                }}
              >
                <PatientDropdown
                  query={caseQuery}
                  onSelect={(p) => {
                    onPinPatient?.(p);
                    exitCase();
                  }}
                />
                <span className="flex h-10 w-[240px] items-center gap-2 rounded-full bg-white px-4">
                  <SearchGlyph className="size-5 shrink-0 text-ink" />
                  <input
                    autoFocus
                    value={caseQuery}
                    onChange={(e) => setCaseQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") exitCase();
                    }}
                    onBlur={exitCase}
                    placeholder="Buscar paciente…"
                    className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.6] text-ink placeholder:text-neutral-500 focus:outline-none"
                  />
                </span>
              </span>
            ) : pinnedPatient ? (
              // Paciente fixado: o chip SUBSTITUI a pílula (um por vez).
              // Clicar reabre a busca para trocar; ✕ desafixa.
              <span
                className="flex h-10 items-center gap-2 rounded-full pl-1.5 pr-2"
                style={{ background: PILL_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={() => setCaseMode(true)}
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <PatientAvatar
                    patient={pinnedPatient}
                    className="size-7 text-[10px]"
                  />
                  <span className="text-[14px] font-medium leading-[1.4] text-ink">
                    {pinnedPatient.name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onUnpin}
                  aria-label="Desafixar paciente"
                  className="grid size-5 place-items-center rounded-full text-neutral-500 transition-colors hover:text-ink"
                >
                  <i className="bx bx-x text-lg" />
                </button>
              </span>
            ) : (
              // Pílula "Discutir um caso": gradiente brand sutil, mesma
              // altura do botão de mic (40px).
              <button
                type="button"
                onClick={() => setCaseMode(true)}
                className="flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium leading-[1.4] text-ink transition-opacity hover:opacity-80"
                style={{ background: PILL_GRADIENT }}
              >
                <SearchGlyph className="size-6 text-ink" />
                Discutir um caso
              </button>
            ))}
          {/* icon-send é cinza no asset → brightness-0 invert = branco. */}
          <MicSendButton hasText={hasText} onClick={send} />
        </div>
      </div>
    </section>
  );
}
