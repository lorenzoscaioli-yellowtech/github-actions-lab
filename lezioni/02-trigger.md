# Lezione 02 - Trigger e filtri

File: `.github/workflows/02-trigger.yml`

## Cosa dimostra

- I quattro trigger che coprono il 95% dei casi reali: `workflow_dispatch`,
  `push`, `pull_request`, `schedule`.
- Input tipizzati per il lancio manuale (`choice`, `string`, `boolean`).
- Filtri `branches`, `paths`, `tags` con i glob.
- `if` a livello di step e di job.
- Come esplorare `github.event` per scoprire i campi disponibili.

## Come lanciarla

Manuale, con input:

```bash
gh workflow run 02-trigger.yml -f ambiente=produzione -f messaggio="prova" -f verbose=true
gh run watch
```

Via pull request:

```bash
git checkout -b prova-trigger
echo "# nota" >> app/README.md
git commit -am "Prova trigger PR"
git push -u origin prova-trigger
gh pr create --fill
```

Via tag:

```bash
git tag v0.1.0 && git push origin v0.1.0
```

## Cosa osservare nei log

1. Solo uno degli step "Dettagli ..." gira; gli altri compaiono in grigio
   come **skipped**, non come falliti.
2. Con `ambiente=produzione` compare il secondo job `solo-in-produzione`;
   con `staging` il job è skipped.
3. Con `verbose=true` lo step "Payload completo" stampa il JSON dell'evento:
   è lo strumento per capire quali campi usare in `github.event.*`.
4. Un push su `main` che tocca solo `lezioni/` NON fa partire il workflow
   (filtro `paths`).

## Trappole

- `schedule` usa l'ora **UTC** e gira solo sul branch di default. GitHub lo
  sospende dopo 60 giorni di inattività del repo.
- Con `paths` e `branches` insieme devono valere ENTRAMBI i filtri.
- Le PR da fork girano con `GITHUB_TOKEN` in sola lettura e senza segreti.
- `pull_request` fa il checkout del **merge commit** tra PR e base, non
  dell'ultimo commit del branch.

## Note dopo l'esecuzione

Due run il 29/09/2026: uno da `push` (commit iniziale) e uno manuale con
`ambiente=produzione`, `verbose=true`.

- Run da push: gira solo lo step "Dettagli del push", gli altri tre sono
  `skipped`. Il job `solo-in-produzione` è `skipped` per intero.
  `github.event.head_commit.message` contiene il messaggio del commit;
  `startsWith(github.ref, 'refs/tags/')` vale `false`.
- Run manuale: gli input arrivano correttamente in `inputs.*`, il job
  `solo-in-produzione` gira, il payload in `$GITHUB_EVENT_PATH` contiene un
  oggetto `inputs` con i tre valori. Lo step "Dettagli del push" è skipped.
- Nota sull'`if`: nel run manuale con `verbose=true` lo step del payload gira;
  la condizione `inputs.verbose == true` confronta un booleano, non la
  stringa `'true'` (per `workflow_dispatch` gli input `boolean` sono tipizzati
  davvero, a differenza di quelli dei `workflow_call`, da verificare nella
  lezione 06).
- Verifica del filtro `paths`: il push di questo file di appunti non ha fatto
  partire nessun workflow (vedi commit successivo).
- Ancora da provare: il trigger `pull_request` e il trigger su tag `v*`.
  Lo `schedule` del lunedì si vedrà da solo.
- **Corretto dopo la lezione 11**: actionlint ha segnalato che titolo della
  PR, messaggio del commit e `github.head_ref` erano inseriti direttamente
  negli script (script injection). Ora passano da `env:`.
