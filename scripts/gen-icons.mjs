// Gera components/ui/icons.generated.ts com o conteúdo interno (paths) dos SVGs
// do boxicons para TODOS os ícones bx-* usados no projeto. Rodar uma vez (e quando
// novos ícones forem usados). Os SVGs vêm de node_modules/boxicons/svg/regular.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.argv[2] || process.cwd();
const SVG_DIR = join(ROOT, "node_modules/boxicons/svg/regular");
const SOLID_DIR = join(ROOT, "node_modules/boxicons/svg/solid");
const OUT = join(ROOT, "components/ui/icons.generated.ts");

// 1) Coleta nomes bx-* usados no código.
const grep = execSync(
  `grep -rhoE "bx-[a-z0-9-]+" ${join(ROOT, "components")} ${join(ROOT, "app")} || true`,
  { encoding: "utf8" },
);
const used = [...new Set(grep.split("\n").map((s) => s.trim()).filter(Boolean))].sort();

// 2) Para cada, extrai o conteúdo interno do SVG (entre <svg ...> e </svg>).
const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();

const map = {};
const missing = [];
for (const name of used) {
  let file = join(SVG_DIR, `${name}.svg`);
  if (!existsSync(file)) {
    // tenta a variante sólida (bxs-...) com o mesmo radical
    const solid = join(SOLID_DIR, name.replace(/^bx-/, "bxs-") + ".svg");
    if (existsSync(solid)) file = solid;
    else { missing.push(name); continue; }
  }
  map[name] = inner(readFileSync(file, "utf8"));
}

// 3) Escreve o TS (chave -> markup interno). Todos os boxicons usam viewBox 0 0 24 24.
const entries = Object.keys(map).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(map[k])},`).join("\n");
const out = `// AUTO-GERADO a partir de node_modules/boxicons/svg/regular — NÃO editar à mão.
// Conteúdo interno (paths) de cada ícone boxicons usado no projeto, para render
// como SVG inline (vetor de verdade → exporta pro Figma). Todos usam viewBox
// "0 0 24 24". Regerar com scripts/gen-icons.mjs quando novos ícones forem usados.
export const ICON_SVG: Record<string, string> = {
${entries}
};
`;
writeFileSync(OUT, out);
console.log(`OK: ${Object.keys(map).length} ícones escritos em ${OUT}`);
if (missing.length) console.log(`FALTAM (sem SVG no boxicons, renderizam vazio): ${missing.join(", ")}`);
