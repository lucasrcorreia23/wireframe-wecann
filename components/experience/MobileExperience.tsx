"use client";

import { useState } from "react";
import Image from "next/image";
import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow, useCanBack } from "@/flow/store";
import { NODES, ALL_NODE_IDS, ZONE_LABEL } from "@/flow/graph";
import { WireButton, WireBadge, Eyebrow } from "@/components/ui";
import { PromptBox } from "@/components/home/PromptBox";

// Fallback mobile (§0/§6): sem o trilho 3D completo. As estações entram por
// cross-fade; navegação por seleção de nó + avanço/voltar. Forks na própria tela.
export function MobileExperience() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);
  const canBack = useCanBack();

  if (currentNode === "home") {
    return <MobileHomeExperience />;
  }

  const node = NODES[currentNode];
  const Screen = SCREENS[currentNode];

  const props: ScreenProps = {};
  if (node.fork) {
    props.onYes = () => goTo(node.fork!.yes.to);
    props.onNo = () => goTo(node.fork!.no.to);
  }
  if (node.next) props.onContinue = () => goTo(node.next!);

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      {/* Header compacto */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-paper px-4 py-3">
        <div className="flex flex-col">
          <Eyebrow>{ZONE_LABEL[node.zone]}</Eyebrow>
          <span className="text-body font-medium text-ink">{node.title}</span>
        </div>
        {node.terminus ? <WireBadge tone="hard">Terminus</WireBadge> : null}
      </header>

      {/* Seletor de estação */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-neutral-200 bg-paper-50 px-4 py-2">
        {ALL_NODE_IDS.map((id) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={
              "shrink-0 rounded-wire border px-2 py-1 font-mono text-micro transition-colors " +
              (id === currentNode
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 text-neutral-500")
            }
          >
            {id}
          </button>
        ))}
      </div>

      {/* Estação atual com cross-fade (key força remontagem + soft-fade) */}
      <main className="flex-1 overflow-auto p-4">
        <div
          key={currentNode}
          className="station-reveal mx-auto w-fit origin-top scale-[0.46] sm:scale-[0.62]"
        >
          <div className="overflow-hidden rounded-wire border border-neutral-200 bg-paper">
            <Screen {...props} />
          </div>
        </div>
      </main>

      {/* Controles */}
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-neutral-200 bg-paper px-4 py-3">
        <WireButton variant="ghost" size="sm" onClick={back} >
          ← Voltar
        </WireButton>
        {!canBack ? <span className="sr-only">início</span> : null}
        {node.fork ? (
          <WireBadge tone="mid">Decisão na tela</WireBadge>
        ) : node.next ? (
          <WireButton variant="primary" size="sm" onClick={() => goTo(node.next!)}>
            Continuar →
          </WireButton>
        ) : (
          <WireBadge tone="neutral">Fim do fluxo</WireBadge>
        )}
      </footer>
    </div>
  );
}

function MobileHomeExperience() {
  const [question, setQuestion] = useState("");

  return (
    <main className="relative min-h-dvh overflow-hidden bg-white px-5 pt-5 pb-6 sm:px-8 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-35%] top-20 h-[420px] opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, rgba(88,141,255,0.16), transparent 34%), radial-gradient(circle at 58% 46%, rgba(243,99,80,0.12), transparent 32%), radial-gradient(circle at 50% 68%, rgba(252,215,87,0.14), transparent 36%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between gap-4">
        <Image
          src="/logotipo.svg"
          alt="wecann.care"
          width={136}
          height={23}
          priority
          className="h-[23px] w-[136px]"
        />
        <button
          aria-label="Perfil"
          className="relative size-10 shrink-0 overflow-hidden rounded-full"
        >
          <Image
            src="/figma/avatar.png"
            alt=""
            width={46}
            height={61}
            className="absolute top-[-26.64%] left-[-7.5%] h-[153.29%] w-[115%] max-w-none"
          />
        </button>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-92px)] w-full max-w-[720px] flex-col justify-center gap-8 pt-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            aria-hidden
            className="relative size-[156px] rounded-full sm:size-[190px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(138,176,255,0.72) 0%, rgba(174,185,239,0.52) 38%, rgba(246,163,146,0.6) 66%, rgba(249,223,160,0.72) 100%)",
              boxShadow:
                "0 0 64px rgba(138,176,255,0.26), 0 28px 70px rgba(243,99,80,0.16)",
            }}
          >
            <span className="absolute inset-[18px] rounded-full bg-white/42 blur-xl" />
            <span className="absolute inset-0 rounded-full ring-1 ring-white/80" />
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[30px] font-semibold leading-[1.12] text-ink sm:text-[36px]">
              Boa tarde, Dr. Ricardo
            </h1>
            <p className="text-[14px] leading-[1.6] text-secondary">
              Quinta, 19 de junho 14:02
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <PromptBox
            placeholder="Digite sua pergunta ou comando..."
            onSend={(value) => setQuestion(value)}
          />

          {question ? (
            <section className="rounded-[20px] border border-border-soft bg-white/90 p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-secondary">
                Nova conversa
              </p>
              <p className="mt-2 text-[15px] font-medium leading-[1.45] text-ink">
                {question}
              </p>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
