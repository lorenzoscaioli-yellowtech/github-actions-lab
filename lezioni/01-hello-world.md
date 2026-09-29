# Lezione 01 - Hello world

File: `.github/workflows/01-hello-world.yml`

## Cosa dimostra

- La gerarchia **workflow → job → step** e dove gira ciascun livello.
- I job sono macchine separate e partono in parallelo; gli step di un job
  sono sequenziali sulla stessa macchina.
- Il runner parte **vuoto**: il codice arriva solo con `actions/checkout`.
- Come leggere i **contesti** (`github.*`, `runner.*`) con `${{ }}`.
- Tre modi di passare dati tra step: `env`, `GITHUB_ENV`, `GITHUB_OUTPUT`.
- `GITHUB_STEP_SUMMARY` per un riepilogo leggibile nella pagina del run.

## Come lanciarla

Dalla UI: tab **Actions** → "01 - Hello world" → **Run workflow**.

Da terminale:

```bash
gh workflow run 01-hello-world.yml
gh run watch
gh run view --log
```

Oppure modificare il file e fare push su `main`: il filtro `paths` fa scattare
solo questo workflow.

## Cosa osservare nei log

1. Nel job `saluta`, lo step "La working directory è vuota" mostra solo `.`
   e `..`; dopo il checkout compaiono i file del repo.
2. "Leggo la variabile esportata" stampa l'orario scritto dallo step precedente
   via `GITHUB_ENV`.
3. "Uso l'output" stampa `1.0.<numero run>`: il numero cresce a ogni esecuzione.
4. Nel job `altro-runner`, `ORA_BUILD` vale `<vuota>`: è un'altra macchina.
5. In cima alla pagina del run c'è la tabella scritta in `GITHUB_STEP_SUMMARY`.

## Dubbi da chiarire

- *Perché due job e non due step?* Per parallelismo, per usare sistemi
  operativi diversi, o per isolare fasi (build e deploy). Costo: ogni job
  rifà il checkout e reinstalla le dipendenze.
- *`${{ }}` o `$VAR`?* `${{ }}` è valutato da GitHub prima che lo step parta e
  può accedere ai contesti. `$VAR` è valutato dalla shell. Per valori che
  arrivano dall'utente preferire `env:` + `$VAR`, per evitare injection nel
  comando (vedi lezione 08).

## Note dopo l'esecuzione

Primo run: 29/09/2026, evento `push` (il commit iniziale conteneva il file del
workflow, quindi il filtro `paths` era soddisfatto). Durata 12 secondi.

- `ls -la` prima del checkout: solo `..`, la directory di lavoro è vuota.
  Dopo il checkout: README.md, app/, lezioni/ (e .github/).
- `GITHUB_ENV` funziona tra step: "La build è partita alle 09:44:37".
- `GITHUB_OUTPUT`: "Versione calcolata: 1.0.1", cioè `run_number` = 1.
- Nel job `altro-runner` ORA_BUILD vale `<vuota>` e l'hostname è un
  `runnervm...` diverso: confermato che ogni job è una macchina a sé.
- Nei log ogni step `run` mostra prima il comando (in un gruppo `##[group]`)
  e poi l'output: comodo per capire cosa è stato valutato da `${{ }}` prima
  dell'esecuzione (nel gruppo si vede già il valore sostituito, non
  l'espressione).
- Dubbio da approfondire: la shell è `bash -e`, quindi il primo comando che
  fallisce interrompe lo step. Da provare cosa succede con `set +e` o con
  `shell: bash` esplicito (che aggiunge anche `-o pipefail`).
