"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Avatar de paciente — foto real (API pravatar.cc, determinística por `seed`). Usa
// <img> puro (não next/image) p/ não exigir remotePatterns no next.config. Em falha
// de rede, cai para as iniciais derivadas do nome (mesmo estilo dos círculos antigos).
const SIZES: Record<"sm" | "md", { box: string; px: number }> = {
  sm: { box: "h-9 w-9", px: 72 }, // 36px @2x
  md: { box: "h-10 w-10", px: 80 }, // 40px @2x
};

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  seed,
  size = "sm",
  className,
}: {
  name: string;
  seed?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const { box, px } = SIZES[size];

  if (failed) {
    return (
      <span
        className={cn(
          box,
          "grid shrink-0 place-items-center rounded-full border border-white/50 bg-white/40 font-mono text-micro text-neutral-700",
          className,
        )}
      >
        {initialsOf(name)}
      </span>
    );
  }

  // <img> proposital (não next/image): avatares minúsculos (36–40px) de uma API
  // externa; next/image exigiria remotePatterns no next.config sem ganho real de LCP.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://i.pravatar.cc/${px}?u=${encodeURIComponent(seed ?? name)}`}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        box,
        "shrink-0 rounded-full border border-white/50 object-cover",
        className,
      )}
    />
  );
}
