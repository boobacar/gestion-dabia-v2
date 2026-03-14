# Deploy Prod Checklist — Gestion Dabia v2

## 1) Pré-déploiement

- [ ] `npm run lint` passe
- [ ] `npm run build` passe
- [ ] Variables `.env` prod configurées
- [ ] Backup Supabase disponible (snapshot / PITR)
- [ ] Migration DB prête (`supabase/migrations/*`)

## 2) Base de données

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
npx supabase migration list
```

- [ ] Migration RLS hardening appliquée
- [ ] Aucune erreur policy/version

## 3) Smoke tests fonctionnels

### Admin
- [ ] login
- [ ] création patient
- [ ] création RDV
- [ ] ajout salle d’attente
- [ ] création facture + paiement
- [ ] génération devis/facture PDF

### Secrétaire
- [ ] triage online appointments
- [ ] rappels/logs
- [ ] documents patient

### Dentiste
- [ ] actes patient
- [ ] ordonnances
- [ ] certificats
- [ ] prothèses

## 4) Sécurité

- [ ] `.env` non versionné
- [ ] RLS active sur tables sensibles
- [ ] rôles (`admin`, `dentist`, `secretary`, `assistant`) cohérents dans `profiles`

## 5) Post-déploiement

- [ ] monitoring erreurs 30-60 min
- [ ] export CSV test OK
- [ ] backup post-release
