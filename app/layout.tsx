import type { Metadata } from "next";
import "boxicons/css/boxicons.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeCann — Fluxo de atendimento",
  description:
    "Wireframe imersivo de alta fidelidade: pré-consulta, consulta e pós-consulta em um espaço contínuo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        {/*
          Tipografia via Adobe Fonts (Typekit):
            • Late Serif Variable  → display/serifada  (--font-display)
            • Config Mono Variable → corpo + dados     (--font-sans / --font-mono)
          Passo único pendente: criar um Web Project em fonts.adobe.com com AS DUAS
          famílias e trocar KIT_ID pelo id do seu kit. Confirme também os nomes de
          font-family no painel "How to use" e ajuste-os em app/globals.css se diferirem.
        */}
        <link rel="stylesheet" href="https://use.typekit.net/jir2fmf.css" />
      </head>
      <body className="min-h-full bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
