// Lezione 15 - Genera test ad hoc con Gemini a partire dal diff del codice.
//
// Input (variabili d'ambiente):
//   GEMINI_API_KEY  chiave API di Google AI Studio (segreto)
//   GEMINI_MODEL    modello da usare (default: gemini-3.8-flash)
//   GEMINI_FALLBACK modelli di riserva separati da virgola, provati in ordine
//                   se il principale resta sovraccarico
//                   (default: gemini-3.7-flash,gemini-3.5-flash)
//   BASE_REF        commit/branch di confronto (es. origin/main)
// Output (nella cartella corrente, cioè app/):
//   test/ai/generated.test.js  il file di test generato
//   ai-report.json             riepilogo e casi di test proposti
//   GITHUB_OUTPUT: salta=true|false
//
// Non esegue il codice generato: lo fa un job separato senza segreti.

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const { GEMINI_API_KEY, BASE_REF = "origin/main", GITHUB_OUTPUT } = process.env;
const MODELLI = [
  process.env.GEMINI_MODEL || "gemini-3.8-flash",
  ...(process.env.GEMINI_FALLBACK || "gemini-3.7-flash,gemini-3.5-flash").split(","),
]
  .map((m) => m.trim())
  .filter((m, i, lista) => m && lista.indexOf(m) === i);
const API = "https://generativelanguage.googleapis.com/v1beta";

const out = (k, v) => GITHUB_OUTPUT && appendFileSync(GITHUB_OUTPUT, `${k}=${v}\n`);
const git = (...args) => execFileSync("git", args, { encoding: "utf8" });

// 1) Cosa è cambiato nel codice sorgente dell'app (i test esistenti no).
const range = `${BASE_REF}...HEAD`;
const diff = git("diff", "--unified=5", range, "--", "src/");
const fileCambiati = git("diff", "--name-only", "--diff-filter=AM", range, "--", "src/")
  .split("\n")
  .filter(Boolean)
  .map((p) => p.replace(/^app\//, ""));

if (!diff.trim()) {
  console.log(`Nessuna modifica in app/src rispetto a ${BASE_REF}: niente da testare.`);
  out("salta", "true");
  process.exit(0);
}
if (!GEMINI_API_KEY) {
  console.error(
    "::error::Segreto GEMINI_API_KEY mancante. Crealo con: gh secret set GEMINI_API_KEY",
  );
  process.exit(1);
}

// 2) Contesto per il modello: diff, file completi dopo la modifica, un test
//    esistente come esempio di stile.
const sorgenti = fileCambiati
  .map((f) => `--- ${f} (import dal test: "../../${f}")\n${readFileSync(f, "utf8")}`)
  .join("\n\n");
const esempio = existsSync("test/calcolatrice.test.js")
  ? readFileSync("test/calcolatrice.test.js", "utf8")
  : "";

const prompt = `You are a senior JavaScript test engineer reviewing a code change.

Write NEW unit tests that verify the behaviour introduced or modified by the diff below.
Focus on: the new/changed functions, edge cases (empty input, zero, negative numbers,
wrong types, boundaries), and error handling. Do not re-test unchanged functions.

Rules for the test file:
- Node.js built-in test runner: import { test } from "node:test"; import assert from "node:assert/strict";
- ES modules. The file lives in app/test/ai/, so import sources with the exact paths given below.
- Test names in Italian, short and specific.
- Test the behaviour a reasonable developer would EXPECT from the function name and code intent.
  If the implementation looks buggy for an edge case, still assert the correct expected behaviour:
  a failing test is a useful signal.
- No external dependencies, no network, no filesystem access, no timers.

Diff (base ${BASE_REF}):
${diff}

Full content of changed files after the change:
${sorgenti}

Existing test, for style reference:
${esempio}`;

const body = {
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        riepilogo: { type: "STRING", description: "Cosa cambia il diff, in italiano, 1-2 frasi" },
        casi: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              nome: { type: "STRING" },
              motivo: { type: "STRING", description: "Perché questo caso conta, in italiano" },
            },
            required: ["nome", "motivo"],
          },
        },
        codice: { type: "STRING", description: "Contenuto completo del file di test" },
      },
      required: ["riepilogo", "casi", "codice"],
    },
  },
};

// 3) Chiamata REST a Gemini. La chiave va nell'header, non nell'URL, così non
//    finisce in eventuali log delle richieste.
//    Errori temporanei (429 troppe richieste, 500/503 servizio sovraccarico):
//    si riprova con attesa crescente. Gli altri errori (400, 401, 404) non
//    migliorano riprovando, quindi si esce subito.
const TEMPORANEI = new Set([429, 500, 503]);
const ATTESE = [5, 15, 30]; // secondi prima del 2°, 3° e 4° tentativo

async function chiama(modello) {
  for (let tentativo = 1; ; tentativo++) {
    const r = await fetch(`${API}/models/${modello}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    if (!TEMPORANEI.has(r.status) || tentativo > ATTESE.length) return r;
    const attesa = ATTESE[tentativo - 1];
    console.log(
      `::warning::${modello} ha risposto ${r.status} (tentativo ${tentativo}), riprovo tra ${attesa}s`,
    );
    await new Promise((ok) => setTimeout(ok, attesa * 1000));
  }
}

// Piano B: se un modello resta sovraccarico anche dopo i tentativi, si passa
// al successivo della lista. Un errore non temporaneo (es. 404) ferma tutto.
let risposta;
let MODEL;
for (MODEL of MODELLI) {
  risposta = await chiama(MODEL);
  if (!TEMPORANEI.has(risposta.status)) break;
  console.log(`::warning::${MODEL} non disponibile, passo al modello di riserva successivo`);
}

if (!risposta.ok) {
  const testo = await risposta.text();
  console.error(`::error::Gemini ha risposto ${risposta.status}: ${testo.slice(0, 500)}`);
  if (risposta.status === 404) {
    // Modello inesistente o ritirato: elenco quelli disponibili per aiutare a scegliere.
    const lista = await fetch(`${API}/models?pageSize=200`, {
      headers: { "x-goog-api-key": GEMINI_API_KEY },
    }).then((r) => r.json());
    const nomi = (lista.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));
    console.error(`Modelli disponibili: ${nomi.join(", ")}`);
    console.error("Imposta quello scelto con: gh variable set GEMINI_MODEL --body <nome>");
  }
  process.exit(1);
}

const dati = await risposta.json();
const testo = dati.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
let risultato;
try {
  risultato = JSON.parse(testo);
} catch {
  console.error("::error::Risposta di Gemini non in JSON valido");
  console.error(testo.slice(0, 1000));
  process.exit(1);
}

// 4) Salvo il file di test e il report.
const percorso = "test/ai/generated.test.js";
mkdirSync(dirname(percorso), { recursive: true });
writeFileSync(percorso, risultato.codice);
writeFileSync(
  "ai-report.json",
  JSON.stringify(
    { modello: MODEL, base: BASE_REF, fileCambiati, ...risultato, codice: undefined },
    null,
    2,
  ),
);

console.log(`Modello: ${MODEL}`);
console.log(`Riepilogo: ${risultato.riepilogo}`);
console.log(`Casi proposti: ${risultato.casi.length}`);
for (const c of risultato.casi) console.log(`  - ${c.nome}: ${c.motivo}`);
console.log(`Token usati: ${JSON.stringify(dati.usageMetadata ?? {})}`);
out("salta", "false");
