# Lezione 09 - Segreti, variabili, environment con approvazione

File: `.github/workflows/09-deploy-approvazione.yml`

## Cosa dimostra

- **Variabili** (`vars.*`, in chiaro) e **segreti** (`secrets.*`, cifrati e
  mascherati nei log), a livello di repo e di environment.
- Stesso nome, valore diverso per ambiente: `URL_DEPLOY` e `API_TOKEN`
  esistono sia in `staging` sia in `produzione`.
- Un job senza `environment:` non vede le variabili e i segreti degli
  environment.
- **Approvazione manuale**: il job `produzione` resta in "Waiting" finché un
  reviewer non approva.
- **Branch policy**: in `produzione` si può fare deploy solo da `main`.
- `environment.url`: il link compare nel run e nella pagina Deployments.

## Configurazione (già fatta, una volta sola)

```bash
R=repos/lorenzoscaioli-yellowtech/github-actions-lab
gh api -X PUT $R/environments/staging
# produzione: reviewer obbligatorio (il mio user id) e solo branch scelti
echo '{"reviewers":[{"type":"User","id":<USER_ID>}],"prevent_self_review":false,
       "deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}' \
  | gh api -X PUT $R/environments/produzione --input -
gh api -X POST $R/environments/produzione/deployment-branch-policies -f name=main

gh variable set NOME_PROGETTO --body "laboratorio-actions"            # repo
gh variable set URL_DEPLOY --env staging    --body "https://staging.esempio.it"
gh variable set URL_DEPLOY --env produzione --body "https://www.esempio.it"
gh secret set API_TOKEN --env staging    --body "token-finto-staging-123"
gh secret set API_TOKEN --env produzione --body "token-finto-produzione-456"
```

Tutto visibile anche in Settings > Environments e Settings > Secrets and variables.
Sui repo privati del piano gratuito i reviewer obbligatori non sono disponibili.

## Come lanciarla e approvare

```bash
gh workflow run 09-deploy-approvazione.yml
```

Poi nella pagina del run: **Review deployments** → spunta `produzione` →
**Approve and deploy**. Oppure da terminale:

```bash
ENV_ID=$(gh api repos/lorenzoscaioli-yellowtech/github-actions-lab/environments/produzione --jq .id)
gh api -X POST repos/lorenzoscaioli-yellowtech/github-actions-lab/actions/runs/<RUN_ID>/pending_deployments \
  -F "environment_ids[]=$ENV_ID" -f state=approved -f comment="ok"
```

## Note dopo l'esecuzione

29/09/2026, primo run: `senza-environment` e `staging` verdi in pochi
secondi, `produzione` in stato **waiting** con reviewer
`lorenzoscaioli-yellowtech`.

- Finché il run è in attesa, `gh run view --log` non restituisce i log
  nemmeno dei job già finiti: arrivano quando il run si chiude.
- Approvato dalla UI circa 18 minuti dopo: `produzione` è partito subito e il
  run è diventato verde.
- `senza-environment`: `NOME_PROGETTO` è visibile perché è di repo,
  `URL_DEPLOY` è vuoto e `API_TOKEN` non è impostato. Le variabili e i
  segreti degli environment esistono solo per i job che dichiarano quell'environment.
- `staging`: destinazione `https://staging.esempio.it`, token `***`, lunghezza 23.
- `produzione`: destinazione `https://www.esempio.it`, token `***`, lunghezza 26.
  Stesso codice e stessi nomi, valori diversi: è lo scopo degli environment.
- La lunghezza dimostra che il segreto c'è ed è diverso, senza stamparlo.
  Il mascheramento `***` vale solo per il valore esatto: una sua
  trasformazione, come base64 o un pezzo, NON viene mascherata.
- In Deployments del repo compaiono i due ambienti con il link `url`.
