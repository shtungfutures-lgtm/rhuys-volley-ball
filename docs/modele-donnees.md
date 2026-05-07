# Modèle de données - MVP Prospection

## Entités principales

- `tenants` : entreprise cliente
- `users` : utilisateurs de l'entreprise
- `companies` : entreprises prospectées
- `contacts` : contacts de prospection
- `prospects` : opportunités de prospection
- `activities` : interactions réalisées
- `tasks` : actions planifiées (relances)

## Relations

- 1 tenant -> N users
- 1 tenant -> N prospects
- 1 company -> N contacts
- 1 contact -> N prospects
- 1 prospect -> N activities
- 1 prospect -> N tasks

## Décisions de modélisation

- `prospects` est l'entité centrale pour piloter le pipeline.
- `activities` est immutable (journal d'audit métier).
- `tasks` porte la logique opérationnelle (cadences et relances).

## Index prioritaires

- `prospects(tenant_id, status)`
- `prospects(tenant_id, owner_user_id, next_action_at)`
- `tasks(tenant_id, owner_user_id, due_at, state)`
- `activities(prospect_id, occurred_at desc)`
