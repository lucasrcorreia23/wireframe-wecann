"use client";

// Registro único de GSAP + plugins (§armadilha 4). Importado por qualquer módulo
// "use client" que precise de gsap. Idempotente: registerPlugin pode ser chamado
// múltiplas vezes sem efeito colateral.
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, Flip, CustomEase, SplitText, DrawSVGPlugin);

  // Ease "travel" — sensação de massa: acelera suave, cruzeiro, desacelera com peso.
  // Fallback documentado: power3.inOut.
  if (!CustomEase.get("travel")) {
    CustomEase.create("travel", "M0,0 C0.32,0 0.12,1 1,1");
  }
}

export { gsap, useGSAP, Flip, CustomEase, SplitText, DrawSVGPlugin };
