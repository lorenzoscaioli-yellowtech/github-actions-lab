# Lezione 08 - Matrici

File: `.github/workflows/08-matrice.yml`

## Cosa dimostra

- `strategy.matrix`: un job definito, un job eseguito per ogni combinazione
  (qui Node 20/22/24 × Ubuntu/Windows/macOS).
- `exclude` toglie combinazioni, `include` ne aggiunge o aggiunge variabili.
- `fail-fast: false`: tutte le combinazioni arrivano in fondo, così si vede
  quali sono rotte (con il default `true` le altre vengono cancellate).
- `max-parallel`: limita i job contemporanei.
- `continue-on-error` legato a una variabile della matrice: la combinazione
  "sperimentale" può fallire senza rendere rosso il run.
- `shell: bash` anche su Windows (altrimenti PowerShell).
- Riuso della composite action `setup-app` con input `node-version`.

## Come lanciarla

```bash
gh workflow run 08-matrice.yml && gh run watch
```

## Cosa osservare

1. Nella barra laterale del run ci sono 9 job: 3×3, meno macOS/Node 20, più
   la combinazione `latest`.
2. Il job `test (Node latest, ubuntu-latest)` è rosso, ma il run è verde.

## Note dopo l'esecuzione

29/09/2026. **La matrice ha trovato un bug vero al primo run.**

- Node 20 falliva su Ubuntu e Windows con
  `Could not find '.../app/test/**/*.test.js'`. Il glob passato a
  `node --test` è supportato solo da Node 21. Node 22 e 24 erano verdi.
- Correzione: `node --test --test-reporter=spec` senza argomenti. Node trova
  da solo i file nelle cartelle `test/` e i `*.test.js`, su tutte le versioni.
- Secondo run: 8 job verdi, il job sperimentale rosso, il run **success**.
- Windows e macOS sono più lenti ad avviarsi. Sui repo privati consumano
  minuti con un moltiplicatore (Windows ×2, macOS ×10). Sui repo pubblici
  i runner standard sono gratuiti.
