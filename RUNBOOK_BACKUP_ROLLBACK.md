# Runbook Backup / Rollback — Gestion Dabia v2

## Backup recommandé avant release

1. Créer un backup DB Supabase (dashboard / PITR)
2. Tagger le commit applicatif:

```bash
git tag -a pre-release-<date> -m "Backup point before release"
git push origin --tags
```

## Rollback applicatif (code)

```bash
# revenir au commit précédent
git log --oneline -n 10
git revert <commit_sha>
git push origin master
```

## Rollback DB (urgence)

Option A (recommandé): restaurer backup/PITR Supabase.

Option B (partiel): appliquer migration corrective (rollback policy/data) puis:

```bash
npx supabase db push
```

## Vérifications après rollback

- login OK
- patients/RDV/factures/paiements OK
- exports/PDF OK
- policies RLS cohérentes
