import type { Metadata } from "next";
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
          Tipografia:
            • Late Serif Variable (Adobe Fonts) → display/serifada   (--font-display)
            • Inter (Google Fonts)              → corpo/prosa        (--font-sans)
            • Config Mono Variable (Adobe Fonts)→ dados/badges/labels (--font-mono)
          Late Serif + Config Mono vêm do Typekit (kit jir2fmf); Inter vem do
          Google Fonts. Mesmo padrão de <link> usado antes para o Typekit.
        */}
        <link rel="stylesheet" href="https://use.typekit.net/jir2fmf.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-full bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
