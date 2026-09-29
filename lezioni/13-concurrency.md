# Lezione 13 - Concurrency e timeout

File: `.github/workflows/13-concurrency.yml`

## Cosa dimostra

- `concurrency.group` + `cancel-in-progress: true`: il run nuovo cancella
  quello vecchio dello stesso gruppo.
- Il gruppo `${{ github.workflow }}-${{ github.ref }}` separa branch e PR
  diverse.
- Il contrasto con la 05, che usa `cancel-in-progress: false`: i deploy si
  mettono in coda, perché interrompere un deploy a metà è peggio che
  aspettare.
- `timeout-minutes`: il default è 360 minuti, quindi un job bloccato consuma
  6 ore.

## Come lanciarla

```bash
for i in 1 2 3; do gh workflow run 13-concurrency.yml; sleep 3; done
gh workflow run 13-concurrency.yml -f mostra-timeout=true
```

## Note dopo l'esecuzione

29/09/2026: quattro lanci ravvicinati, l'ultimo con `mostra-timeout=true`.

- I primi tre run sono **cancelled**. Il quarto li ha sostituiti.
- Nel quarto `lavoro-lungo` è verde dopo 90 secondi. Il job `timeout` è stato
  interrotto dopo 1 minuto con l'annotazione "The job has exceeded the maximum
  execution time of 1m0s".
- **Sorpresa**: un job in timeout risulta **cancelled**, non failure. Di
  conseguenza anche il run è "cancelled". Nella lista dei run non si
  distingue da una cancellazione per concurrency: bisogna aprire
  l'annotazione.
