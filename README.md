# RHUYS VOLLEY BALL - Site vitrine

Site officiel du RHUYS VOLLEY BALL, construit en HTML, CSS et JavaScript simple, avec Decap CMS pour la gestion des contenus.

## Stack actuelle

- Site statique : HTML, CSS, JavaScript
- CMS : Decap CMS dans `admin/`
- Authentification CMS : Netlify Identity + Git Gateway
- Hébergement : Netlify
- Paiement boutique : Stripe Checkout via Netlify Functions
- Données éditables : fichiers JSON dans `content/`

## Structure principale

- `index.html` : accueil
- `club.html` : présentation du club
- `equipes.html` : équipes
- `horaires.html` : horaires d'entraînement
- `calendrier.html` : widgets calendrier / matchs
- `classements.html` : widgets classements
- `actualites.html` et `article.html` : actualités
- `boutique.html` : boutique club
- `partenaires.html` : partenaires
- `contact.html` : contact et formulaires
- `admin/` : Decap CMS
- `content/` : contenus éditables par le CMS
- `netlify/functions/` : fonctions serveur Stripe

## Commandes utiles

```bash
npm install
npm run check
npm run build
npx netlify build --offline
```

## Notes techniques

Next.js n'est plus utilisé par le site. Le projet est publié comme site statique avec `publish = "."` dans `netlify.toml`.

Ne pas stocker de secrets dans le frontend. Les clés Stripe doivent rester dans les variables d'environnement Netlify.
