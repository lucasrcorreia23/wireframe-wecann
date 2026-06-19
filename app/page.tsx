import { Experience } from "@/components/experience/Experience";

// Server Component que monta a <Experience/> (client). O canvas é carregado
// client-only dentro do WorldCanvasClient (zero hidratação no server).
export default function Home() {
  return <Experience />;
}
