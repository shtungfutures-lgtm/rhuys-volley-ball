# Cahier des charges MVP - SaaS de prospection commerciale

## 1. Problème

Les commerciaux perdent des opportunités faute de suivi rigoureux : relances oubliées, informations dispersées, faible visibilité sur les performances.

## 2. Cible

- PME (1 à 50 commerciaux)
- Equipes sales B2B avec cycle de vente court à moyen

## 3. Proposition de valeur

Un CRM orienté prospection qui automatise la discipline de relance et rend la performance lisible au quotidien.

## 4. Fonctionnalités MVP

### 4.1 Gestion des prospects
- Créer/modifier un prospect
- Associer entreprise, contact, owner
- Gérer un statut de pipeline

Statuts MVP :
- `NEW`
- `CONTACTED`
- `FOLLOW_UP`
- `MEETING_BOOKED`
- `QUALIFIED`
- `LOST`
- `WON`

### 4.2 Cadence de relance
- Planifier des tâches de relance
- Générer automatiquement des tâches à J+2, J+7, J+14
- Marquer les tâches comme faites/annulées

### 4.3 Journal d'activité
- Logguer appels, emails, messages LinkedIn, notes
- Timeline complète par prospect

### 4.4 Tableau de bord
- Nombre de nouveaux prospects / semaine
- Taux de réponse
- Taux de conversion (WON / total)
- Délai moyen entre création et premier rendez-vous

## 5. Ecrans MVP

1. Dashboard
2. Liste des prospects (filtres : owner, statut, date prochaine action)
3. Fiche prospect (infos + activités + tâches)
4. Vue tâches du jour/semaine
5. Paramètres équipe (basique)

## 6. Règles métier clés

- Chaque prospect doit avoir un `owner`.
- Un prospect sans prochaine action > 7 jours est en risque.
- Chaque interaction importante doit créer une activité.

## 7. KPI Produit (90 jours)

- Activation : % des comptes qui créent >= 20 prospects
- Usage : nombre moyen d'activités/commercial/semaine
- Valeur : réduction du % de prospects sans relance > 7 jours
- Rétention : comptes actifs à 30 jours

## 8. Hors périmètre MVP

- IA de scoring avancée
- Intégrations email/CRM complexes
- Téléphonie intégrée
