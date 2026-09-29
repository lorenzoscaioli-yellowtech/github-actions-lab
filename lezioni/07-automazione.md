# Lezione 07 - Automazione di operazioni ripetitive

File: `.github/workflows/07-automazione.yml`

## Cosa dimostra

- `schedule` con cron per un lavoro periodico (lunedì 06:00 UTC).
- Un workflow che legge l'API GitHub con `gh api` e rigenera un file di
  documentazione (`docs/STATO.md`).
- Commit e push "da bot" con il `GITHUB_TOKEN`, solo se il file è cambiato.
- `[skip ci]` nel messaggio di commit: GitHub non avvia workflow `push` per
  quel commit (qui non servirebbe, ma è l'abitudine giusta).
- Segreto opzionale: `secrets` non si può usare in `if`, si passa da `env`.
  Senza segreto il job di notifica viene saltato, non fallisce.

## Come lanciarla

```bash
gh workflow run 07-automazione.yml && gh run watch
git pull   # per vedere docs/STATO.md committato dal bot
```

Per attivare la notifica Slack: creare un Incoming Webhook e

```bash
gh secret set SLACK_WEBHOOK_URL
```

## Cosa osservare

1. Nel log dello step "Rigenero" si vede la tabella generata.
2. Nella storia del repo compare un commit di `github-actions[bot]`.
3. Al secondo lancio ravvicinato: "Nessun cambiamento" (solo la data cambia,
   quindi in realtà committa ogni volta: dubbio da sistemare, vedi sotto).

## Trappola importante

I push fatti con `GITHUB_TOKEN` **non avviano altri workflow**: è una
protezione contro i loop infiniti. Se serve che il commit del bot faccia
partire la CI, occorre un PAT o una GitHub App.

## Note dopo l'esecuzione

_(da compilare)_
