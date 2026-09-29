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

_(da compilare dopo il primo run)_
