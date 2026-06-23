"use client";

import { useRouter } from "next/navigation";
import { useFlow } from "@/flow/store";

const FEATURES = [
  { icon: "bx-brain", title: "IA Diagnóstica", sub: "Análise de padrões clínicos" },
  { icon: "bx-bot", title: "Agentes Autônomos", sub: "Automação de prontuário" },
  { icon: "bx-star", title: "Insights em Tempo Real", sub: "Casuística inteligente" },
  { icon: "bx-shield", title: "LGPD Compliant", sub: "Criptografia end-to-end" },
] as const;

// `/login` — porta de entrada (mock). Split cinematográfico em P&B: marketing à
// esquerda (escuro), form de magic-link à direita (claro). "Entrar" leva à
// introdução do produto (`/`) MESMO com o form vazio — reseta a intro para "text".
export function LoginScreen() {
  const router = useRouter();
  const setIntroPhase = useFlow((s) => s.setIntroPhase);

  const enter = () => {
    setIntroPhase("text"); // garante que a abertura editorial toque ao entrar
    router.push("/");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enter();
  };

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
      {/* ───────── Esquerda — painel cinematográfico escuro (P&B) ───────── */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0e0e10] via-[#161618] to-[#1f1f22] px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
        {/* Glow monocromático sutil + vinheta nas bordas. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/[0.06] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 30% 20%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Grão sutil. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Marca */}
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-paper text-ink shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <i className="bx bx-pulse text-2xl" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-title font-medium text-paper">
              WeCann
            </span>
            <span className="font-mono text-micro uppercase tracking-[0.18em] text-neutral-400">
              Inteligência clínica com IA
            </span>
          </div>
        </div>

        {/* Headline + subtexto */}
        <div className="relative max-w-xl">
          <h1 className="font-display text-display-l font-medium leading-[1.06] text-paper text-balance">
            Prontuário eletrônico com{" "}
            <em className="font-normal italic text-neutral-300">agentes de IA</em>{" "}
            que trabalham por você.
          </h1>
          <p className="mt-6 max-w-md text-body-l leading-relaxed text-neutral-400">
            Seus dados clínicos transformados em inteligência acionável. Agentes
            autônomos que analisam padrões, geram insights e potencializam
            decisões terapêuticas — em tempo real.
          </p>

          {/* Feature cards 2×2 */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-neutral-200">
                  <i className={`bx ${f.icon} text-lg`} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-caption font-medium text-paper">
                    {f.title}
                  </span>
                  <span className="text-micro text-neutral-400">{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative flex items-center gap-2 font-mono text-micro uppercase tracking-[0.14em] text-neutral-500">
          <i className="bx bx-bolt-circle text-base" />
          Powered by Athena · Dados estruturados em FHIR R4
        </div>
      </section>

      {/* ───────── Direita — painel claro com o form (mock) ───────── */}
      <section className="flex items-center justify-center bg-paper px-6 py-12 sm:px-10">
        <form onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col">
          {/* Marca compacta — só no mobile (painel esquerdo escondido). */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-paper">
              <i className="bx bx-pulse text-xl" />
            </span>
            <span className="font-display text-body-l font-medium text-ink">
              WeCann
            </span>
          </div>

          <h2 className="font-display text-display-m font-medium text-ink">
            Acessar plataforma
          </h2>
          <p className="mt-3 text-body text-neutral-600">
            Insira seu e-mail profissional. Enviaremos um link seguro de acesso.
          </p>

          {/* Campo de e-mail (mock — sem exigência) */}
          <label className="mt-8 flex flex-col gap-2">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-neutral-500">
              E-mail profissional
            </span>
            <span className="flex items-center gap-2.5 rounded-xl border border-neutral-300 bg-paper-50 px-3.5 transition-colors focus-within:border-ink">
              <i className="bx bx-envelope text-xl text-neutral-400" />
              <input
                type="email"
                placeholder="nome@clinica.com"
                className="h-12 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-neutral-400"
              />
            </span>
          </label>

          {/* CTA — leva à introdução do produto */}
          <button
            type="submit"
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink font-medium text-paper transition-colors duration-[180ms] hover:bg-neutral-800"
          >
            Entrar
            <i className="bx bx-right-arrow-alt text-xl" />
          </button>

          {/* Selos */}
          <div className="mt-6 flex items-center justify-center gap-5 font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <i className="bx bx-shield text-base text-neutral-400" /> Sem senha
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="bx bx-bolt text-base text-neutral-400" /> Acesso em 1 clique
            </span>
          </div>

          <p className="mt-10 text-center font-mono text-micro text-neutral-400">
            WeCann v1.0 — Criptografia AES-256 · LGPD
          </p>
        </form>
      </section>
    </main>
  );
}
