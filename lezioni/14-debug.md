# Lezione 14 - Debug

File: `.github/workflows/14-debug.yml`

## Cosa dimostra

- Comandi di workflow: `::notice::`, `::warning::`, `::error file=,line=::`,
  `::group::`/`::endgroup::`, `::add-mask::`, `::debug::`.
- Dump dei contesti con `toJSON(...)`, passati da `env`.
- Log di debug a richiesta con `gh run rerun --debug`, e `runner.debug`.
- `act` per eseguire i workflow in locale.

## Come lanciarla

```bash
gh workflow run 14-debug.yml && gh run watch
gh run rerun <RUN_ID> --debug              # stesso run, con log di debug
gh run view <RUN_ID> --attempt 2 --log     # log del secondo tentativo
```

Debug sempre attivo: `gh variable set ACTIONS_STEP_DEBUG --body true`.
Da rimuovere dopo, perché il log diventa molto lungo.

## act (esecuzione locale)

Installato con `brew install act`. Richiede Docker avviato.

```bash
act -l                                                 # elenca job ed eventi, senza Docker
act workflow_dispatch -W .github/workflows/14-debug.yml \
  -P ubuntu-latest=catthehacker/ubuntu:act-latest      # esegue in un container
```

Al primo avvio senza `-P`, act chiede in modo interattivo quale immagine
usare. Da un terminale non interattivo termina con `level=fatal msg=EOF`.
Limiti: non tutte le action funzionano, e `secrets`, environment e
`GITHUB_TOKEN` vanno simulati (`-s NOME=valore`).

## Note dopo l'esecuzione

29/09/2026.

- Primo run: tre annotazioni in cima al run. L'`::error::` è agganciato a
  `app/src/calcolatrice.js:5` ma lo step resta verde, perché `::error::`
  non fa fallire nulla da solo. `add-mask` funziona: "Il valore è: ***".
  `runner.debug` è vuoto e lo step "Solo in modalità debug" è skipped.
- Rerun con `--debug`: compare `##[debug]Questo messaggio si vede solo con
  il debug attivo`, `runner.debug = '1'`, lo step extra gira, e il log conta
  523 righe `##[debug]` del runner.
- Il `::notice::` sulla migrazione di `ubuntu-latest` a Ubuntu 26
  (dal 19/10/2026) è un avviso di GitHub, non nostro. È da tenere presente per
  i workflow reali: pinnare `ubuntu-24.04` se serve stabilità.
- `act -l` funziona senza Docker. L'esecuzione no: Docker era spento, da
  riprovare.
