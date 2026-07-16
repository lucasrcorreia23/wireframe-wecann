import type { Metadata } from "next";
import { Crimson_Pro, Inter, Roboto_Mono } from "next/font/google";
import "boxicons/css/boxicons.min.css";
import "./globals.css";

// Display — serifada (Figma "Iteração 9 de Julho"): saudação, títulos de card,
// nome do perfil. Variable font cobre 400/500/600.
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  display: "swap",
});

// Body/UI — Inter (Figma). Também serve os horários tabulares (--font-time).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Dados/timestamps — Roboto Mono (Figma: data/hora com tracking 1.2px).
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WeCann.Care",
  description:
    "Wireframe imersivo de alta fidelidade: pré-consulta, consulta e pós-consulta em um espaço contínuo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${crimsonPro.variable} ${inter.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
