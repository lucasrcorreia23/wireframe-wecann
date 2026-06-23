import type { Metadata } from "next";
import { LoginScreen } from "@/components/auth/LoginScreen";

export const metadata: Metadata = {
  title: "Entrar · WeCann",
  description: "Acesse a plataforma WeCann — prontuário eletrônico com agentes de IA.",
};

// Rota `/login` — porta de entrada (mock). O botão "Entrar" leva à introdução
// do produto (`/`), mesmo sem preencher o e-mail.
export default function LoginPage() {
  return <LoginScreen />;
}
