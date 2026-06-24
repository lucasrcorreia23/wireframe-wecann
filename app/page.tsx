import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

// Server Component que monta o WorkspaceShell (client) — o shell 2D persistente
// de 3 zonas. O globo (único elemento 3D) é carregado client-only dentro do
// AthenaPanel (AthenaGlobe), sem hidratação no server.
export default function Home() {
  return <WorkspaceShell />;
}
