# Lezione 11 - Sicurezza

File: `.github/workflows/11-sicurezza.yml`, `.github/dependabot.yml`

## Cosa dimostra

- `permissions: {}` a livello di workflow, permessi concessi per singolo job.
- Pin di un'action a SHA completo, con commento della versione.
- **Script injection**: `${{ }}` dentro `run` trasforma testo in codice.
  La difesa è passare il valore da `env:`.
- actionlint come controllo automatico di tutti i workflow.
- Dependabot che apre PR per aggiornare action e dipendenze npm.

## Come lanciarla

```bash
gh workflow run 11-sicurezza.yml -f titolo='x"; echo INIETTATO; echo "'
```

In locale, prima di ogni push: `actionlint`.

## Note dopo l'esecuzione

29/09/2026.

- **Injection dimostrata.** Versione vulnerabile: bash riceve
  `echo "Titolo ricevuto: x"; echo INIETTATO; echo ""` e stampa `INIETTATO`
  su una riga a sé, cioè ha eseguito il comando. Versione sicura: stampa
  `Titolo ricevuto: x"; echo INIETTATO; echo "` come testo.
- **actionlint ha trovato injection nelle MIE lezioni.** Nella 02 titolo
  della PR, messaggio del commit e `github.head_ref` erano scritti
  direttamente negli script. Nella 06 c'era una variabile non quotata
  (shellcheck SC2086). Tutto corretto. Morale: actionlint va in CI da
  subito, non dopo.
- actionlint non segnala `inputs.*` di `workflow_dispatch` come non fidati,
  perché li può lanciare solo chi ha accesso in scrittura. Resta comunque
  buona abitudine passarli da `env`.
- Pin a SHA: il log mostra `Download action repository 'actions/checkout@11d5960...'`.
  Lo SHA è quello a cui puntava `@v4` quel giorno, letto dai log di un run
  precedente.
- **Dependabot** ha aperto due PR pochi secondi dopo il push di
  `dependabot.yml`: una per le action (5 aggiornamenti raggruppati), una per
  le dipendenze npm di sviluppo. Sono PR vere da valutare e unire a mano.
