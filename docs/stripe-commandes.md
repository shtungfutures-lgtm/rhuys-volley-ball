# Stripe commandes boutique

## Ce qui est en place

- Webhook Stripe: `/api/stripe/webhook`
- Création du paiement Checkout: `/api/create-checkout-session`
- Stockage commandes (persistant): Netlify Blobs (`store: rhuys-cms`, clé `orders`)
- Endpoint admin sécurisé: `/api/admin/orders`
- Vue admin: `admin/simple.html` (bloc "Commandes boutique")

## Variables d'environnement à configurer sur Netlify

- `STRIPE_WEBHOOK_SECRET` (obligatoire): secret du webhook Stripe
- `STRIPE_SECRET_KEY` (obligatoire): clé API Stripe pour créer les sessions Checkout et récupérer le détail des line items
- `RESEND_API_KEY` (optionnel): clé Resend pour l'email de notification
- `STRIPE_ORDER_NOTIFY_TO` (optionnel): email qui reçoit les notifications de commande
- `STRIPE_ORDER_NOTIFY_FROM` (optionnel): expéditeur email (ex: `Rhuys Volley <boutique@votredomaine.fr>`)
- `CLUB_EMAIL` (optionnel): fallback de destination email si `STRIPE_ORDER_NOTIFY_TO` est absent

Les variables admin existantes restent utilisées pour sécuriser `/api/admin/orders`:
- `CMS_ADMIN_USERNAME`
- `CMS_ADMIN_PASSWORD`
- `CMS_SESSION_SECRET` (ou `CMS_SECRET`)

## Configuration Stripe

1. Ouvrir le Dashboard Stripe (mode test ou live selon besoin).
2. Créer un endpoint webhook vers:
   - `https://<votre-site>.netlify.app/api/stripe/webhook`
3. Événement à envoyer:
   - `checkout.session.completed`
4. Copier le `Signing secret` Stripe dans `STRIPE_WEBHOOK_SECRET`.

## Notes

- Le webhook ignore les sessions non payées.
- La déduplication évite les doublons si Stripe renvoie le même événement.
- Si l'email n'est pas configuré, la commande est quand même enregistrée.
- Les choix taille, couleur et quantité sont transmis à Stripe dans les métadonnées de la session Checkout.
