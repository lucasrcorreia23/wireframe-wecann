"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Caixa de prompt (Figma): digitação em cima, ações embaixo. O botão navy
// alterna mic ⇄ ENVIAR conforme há texto (crossfade em folhas — dois <img>
// sobrepostos). Enter envia; Shift+Enter quebra linha.
export function PromptBox({
  placeholder,
  onSend,
  disabled,
}: {
  placeholder: string;
  onSend: (question: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hasText = value.trim().length > 0;

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
      className="flex w-full flex-col gap-4 rounded-[20px] border border-border-soft bg-white p-[16px]"
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
      <div className="flex items-start justify-between">
        <button
          aria-label="Anexar"
          className="grid size-10 place-items-center rounded-full bg-[#fcfdff]"
        >
          <img src="/figma/icon-add.svg" alt="" className="size-6" />
        </button>
        {/* Botão navy com STROKE gradiente contornando a base (shell por fora,
            miolo cobre o topo). Miolo: mic quando vazio, ENVIAR quando há
            texto (icon-send é cinza no asset → brightness-0 invert = branco). */}
        <span className="brand-underline inline-grid rounded-full pb-1 drop-shadow-[0px_0px_13.5px_rgba(0,0,0,0.05)]">
          <button
            aria-label={hasText ? "Enviar" : "Comando de voz"}
            onClick={send}
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
      </div>
    </section>
  );
}
