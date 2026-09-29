# Lezione 07 - Automazione di operazioni ripetitive

File: `.github/workflows/07-automazione.yml`

## Cosa dimostra

- `schedule` con cron per un lavoro periodico (lunedì 06:00 UTC).
- Un workflow che legge l'API GitHub con `gh api` e rigenera un file di
  documentazione (`docs/STATO.md`).
- Commit e push "da bot" con il `GITHUB_TOKEN` sul branch
  `automazione/stato`, solo se la tabella è cambiata.
- `[skip ci]` nel messaggio di commit: GitHub non avvia workflow `push` per
  quel commit (qui non servirebbe, ma è l'abitudine giusta).
- Segreto opzionale: `secrets` non si può usare in `if`, si passa da `env`.
  Senza segreto il job di notifica viene saltato, non fallisce.

## Come lanciarla

```bash
gh workflow run 07-automazione.yml && gh run watch
gh browse docs/STATO.md --branch automazione/stato   # il file pubblicato dal bot
```

Per attivare la notifica Slack: creare un Incoming Webhook e

```bash
gh secret set SLACK_WEBHOOK_URL
```

## Cosa osservare

1. Nel log dello step "Rigenero" si vede la tabella generata.
2. Sul branch `automazione/stato` c'è un commit di `github-actions[bot]`, e il
   riepilogo del run ha il link al file.

## Bot e branch protetti

Dalla lezione 12 `main` accetta modifiche solo via PR con `gate` verde. Il
push del bot fallisce con:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
remote: - Required status check "gate" is expected.
```

Le strade possibili:

| Soluzione | Pro | Contro |
|---|---|---|
| Branch dedicato non protetto (scelta qui) | Nessuna credenziale extra | Il file non sta su main |
| Il bot apre una PR | Passa dalle regole | Una PR aperta con GITHUB_TOKEN non avvia workflow, quindi `gate` non parte mai |
| Deploy key nel bypass del ruleset | Il file resta su main | Una chiave SSH da gestire come segreto |
| GitHub App nel bypass del ruleset | Soluzione "da produzione", token a scadenza | Serve creare e installare un'App |

## Trappola importante

I push fatti con `GITHUB_TOKEN` **non avviano altri workflow**: è una
protezione contro i loop infiniti. Se serve che il commit del bot faccia
partire la CI, occorre un PAT o una GitHub App.

## Note dopo l'esecuzione

Lancio manuale 29/09/2026: `docs/STATO.md` generato e committato da
`github-actions[bot]`, job `notifica` verde con lo step Slack `skipped`.

- Il commit del bot non ha avviato nessun workflow, sia per `[skip ci]` sia
  perché i push con `GITHUB_TOKEN` non generano eventi.
- Nella tabella 06 e 07 risultano "mai eseguito": erano in corso mentre lo
  script leggeva l'API, e `conclusion` è null finché il run non finisce.
  Da sistemare usando `.status` oltre a `.conclusion`.
- Il file contiene la data, quindi cambia sempre e viene committato a ogni
  run. Per un'automazione vera meglio togliere la data o confrontare solo
  la tabella.

29/09/2026, dopo la lezione 12. Il run è fallito con `GH013: Repository
rule violations`, perché il ruleset su `main` blocca anche il bot. È emerso
lanciando a mano tutti i workflow dopo l'aggiornamento delle action. Corretto:

- `STATO.md` ora vive sul branch `automazione/stato`, sovrascritto con
  `--force` a ogni aggiornamento. Il vecchio file su main è stato rimosso.
- Per l'esito si usa `.status` quando il run non è concluso, quindi un run in
  corso appare `in_progress` invece di "mai eseguito".
- Il confronto esclude la riga con la data. In pratica la tabella cambia quasi
  sempre, perché il conteggio dei run del workflow 07 stesso cresce a ogni
  lancio. Il confronto evita solo i commit dovuti alla data.
