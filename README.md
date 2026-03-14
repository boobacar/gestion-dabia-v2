# Gestion Dabia v2

Nouveau projet from-scratch pour la plateforme de gestion de la Clinique Dentaire Dabia.

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (DB/Auth/Storage/Realtime)
- Tailwind CSS

## Docs projet

- Blueprint produit/technique: `BLUEPRINT_DABIA_V2.md`
- Migration SQL initiale: `supabase/migrations/20260314024500_init_core.sql`

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir: `http://localhost:3000`

## Variables d'environnement

Copier `.env.example` vers `.env.local` et compléter:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

## Structure initiale

- Routes modules globales (`/dashboard`, `/appointments`, `/patients`, etc.)
- Routes patient contextualisées (`/patients/[id]/*`)
- Shell navigation inspiré des habitudes Dentisto pour transition fluide équipe.

## Prochaine étape

Implémenter l'auth + RBAC + CRUD par module selon le blueprint.
