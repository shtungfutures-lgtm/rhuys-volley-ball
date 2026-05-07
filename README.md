# Sales Prospecting SaaS - Starter Kit

Ce dépôt contient une base de démarrage pour créer un SaaS qui aide les commerciaux à suivre leur prospection.

## Objectif du MVP

Permettre à une équipe commerciale de :
- centraliser ses prospects,
- planifier et suivre les relances,
- visualiser les performances de prospection.

## Ce qui est inclus

- Cadrage produit du MVP : `docs/mvp-cahier-des-charges.md`
- Modèle de données : `docs/modele-donnees.md`
- Schéma SQL initial : `db/schema.sql`
- Squelette d'application Next.js : `src/app/*`

## Stack recommandée

- Frontend : Next.js (App Router)
- Backend : Routes API Next.js
- Base de données : PostgreSQL
- Auth : Supabase Auth ou Auth.js
- Déploiement : Vercel + Neon/Supabase

## Lancement local (quand tu installeras les dépendances)

```bash
npm install
npm run dev
```

Puis ouvre `http://localhost:3000`.

## Feuille de route courte

1. Implémenter l'authentification et le multi-tenant.
2. Brancher PostgreSQL et migrer `db/schema.sql`.
3. Remplacer les mocks par des lectures/écritures en base.
4. Ajouter les rappels automatiques de relance.
