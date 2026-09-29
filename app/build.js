// "Build" minimale: copia public/ in dist/ e inietta versione e data.
// Serve alla lezione CD (GitHub Pages) per avere qualcosa da pubblicare.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const html = readFileSync("public/index.html", "utf8")
  .replace("{{VERSIONE}}", pkg.version)
  .replace("{{DATA}}", new Date().toISOString())
  .replace("{{COMMIT}}", process.env.GITHUB_SHA?.slice(0, 7) ?? "locale");

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
console.log(`Build completata: dist/index.html (v${pkg.version})`);
