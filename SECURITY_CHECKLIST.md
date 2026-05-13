# Checklist sécurité - RHUYS VOLLEY BALL

Cette checklist est à vérifier avant la livraison finale au club, puis à chaque changement important du site.

## Accès et comptes

- [ ] 2FA GitHub activée pour les personnes qui ont accès au dépôt.
- [ ] 2FA Netlify activée pour les personnes qui ont accès au projet.
- [ ] Netlify Identity configuré en mode invitation only si Decap CMS / Git Gateway est utilisé.
- [ ] Seuls les responsables autorisés ont accès au CMS ou à l'administration.
- [ ] Les anciens accès des personnes qui ne gèrent plus le site sont supprimés.

## Domaine et HTTPS

- [ ] Domaine personnalisé connecté dans Netlify.
- [ ] HTTPS actif et certificat valide sur le domaine officiel.
- [ ] HTTP redirigé vers HTTPS.
- [ ] HSTS activé uniquement après validation complète du HTTPS sur le domaine officiel.
- [ ] Les emails du club et les DNS mail ne sont pas modifiés involontairement pendant la connexion du domaine.

## Administration et CMS

- [ ] Une seule interface admin est conservée et documentée pour le club.
- [ ] Ancien admin supprimé ou désactivé s'il n'est plus utilisé.
- [ ] Git Gateway activé si Decap CMS est l'interface retenue.
- [ ] Aucune clé secrète ou mot de passe n'est présent dans le frontend ou dans `admin/config.yml`.
- [ ] La procédure de publication CMS est expliquée au club.

## Site public

- [ ] Headers de sécurité actifs via `_headers`.
- [ ] `robots.txt` présent et bloque `/admin/`.
- [ ] Formulaires protégés contre le spam avec un honeypot ou une solution équivalente.
- [ ] Le site ne demande pas de données sensibles inutiles.
- [ ] Les mentions légales et la politique de confidentialité sont relues et complétées par le club.

## Dépendances et secrets

- [ ] `npm audit` vérifié avant livraison.
- [ ] Les vulnérabilités restantes sont documentées ou corrigées.
- [ ] Aucun secret dans le frontend, le dépôt Git ou les fichiers JSON publics.
- [ ] Les secrets Stripe, CMS et webhook sont stockés dans les variables d'environnement Netlify.
- [ ] `.env.local` reste local et n'est pas committé.

## Boutique Stripe

- [ ] `STRIPE_SECRET_KEY` configurée dans Netlify.
- [ ] Webhook Stripe configuré côté Stripe si le suivi des commandes est utilisé.
- [ ] Les Price IDs Stripe des produits sont corrects.
- [ ] Le mode test / mode production Stripe est clairement identifié avant ouverture au public.
