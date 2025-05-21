# LGTI - Système de Gestion d'Inventaire

Une application web moderne pour la gestion d'inventaire, le suivi des mouvements de stock, et la simulation de prix. Cette application permet aux entreprises de gérer efficacement leurs produits, catégories, mouvements de stock et de réaliser des simulations de prix.

![Logo](https://i.imgur.com/clMmAZC.png)

## Fonctionnalités

- Gestion complète des produits avec référencement et catégorisation
- Organisation hiérarchique des catégories de produits
- Suivi des mouvements de stock (entrées et sorties)
- Création de snapshots d'inventaire pour l'historique et l'analyse
- Simulations de prix avec facteurs d'ajustement
- Interface utilisateur multilingue (Français et Anglais)
- Thème clair/sombre
- Exportation des données au format CSV
- Authentification sécurisée des utilisateurs
- Administration via Directus
- Déploiement conteneurisé avec Docker

## Architecture du Projet

Le projet LGTI est composé de plusieurs composants qui fonctionnent ensemble :

### Backend

- **Directus CMS**: Headless CMS pour la gestion des données et l'API REST/GraphQL
- **MySQL**: Base de données relationnelle pour le stockage des données
- **Redis**: Cache pour améliorer les performances

### Frontend

- **React 19**: Bibliothèque UI avec TypeScript
- **Chakra UI 3**: Framework de composants UI
- **Zustand**: Gestion d'état
- **React Hook Form**: Gestion des formulaires avec validation Zod
- **i18next**: Internationalisation
- **React Router 7**: Routage
- **Directus SDK**: Client API pour communiquer avec le backend
- **Vite 6**: Outil de build

### Infrastructure

- **Docker**: Conteneurisation de tous les services
- **Nginx**: Serveur web et proxy inverse
- **Docker Compose**: Orchestration des conteneurs

## Installation et Déploiement

### Prérequis

- Docker et Docker Compose
- Git

### Installation

1. Clonez le dépôt :

    ```bash
    git clone https://github.com/votre-organisation/lgti.git
    cd lgti
    ```

2. Configurez les variables d'environnement :

    ```bash
    cp .env.example .env
    ```

3. Modifiez le fichier `.env` avec vos propres valeurs, notamment :

   - Les informations de connexion à la base de données
   - Les identifiants administrateur Directus
   - Les URL publiques
   - Les paramètres CORS

4. Démarrez les conteneurs :

    ```bash
    docker-compose up -d
    ```

L'application sera disponible aux adresses suivantes :

- Frontend : <http://localhost>
- API Directus : <http://localhost:8055>

### Modes de Déploiement

Le projet supporte deux modes de déploiement configurables via la variable `BUILD_TARGET` dans le fichier `.env` :

- **development** : Mode de développement avec hot-reloading
- **production** : Mode optimisé pour la production

## Structure du Projet

```text
/
├── frontend/                # Application React
│   ├── src/                 # Code source du frontend
│   ├── Dockerfile           # Configuration Docker pour le frontend
│   └── nginx.conf           # Configuration Nginx pour le frontend
│
├── backend/                 # Services backend
│   ├── directus/            # Extensions et uploads Directus
│   ├── mysql/               # Données MySQL persistantes
│   └── nginx/               # Configuration Nginx et certificats SSL
│
├── docker-compose.yml       # Configuration Docker Compose
└── .env.example             # Exemple de variables d'environnement
```

### Structure du Frontend

```text
frontend/src/
├── assets/              # Ressources statiques
├── domain/              # Logique métier et modèles
│   ├── entities/        # Types et interfaces des entités
│   └── store/           # État global avec Zustand
├── infrastructure/      # Communication avec les services externes
│   └── api/             # Client API Directus
├── presentation/        # Interface utilisateur
│   ├── components/      # Composants réutilisables
│   ├── hooks/           # Hooks personnalisés
│   ├── pages/           # Pages de l'application
│   └── routes/          # Configuration des routes
└── shared/              # Utilitaires partagés
    ├── i18n/            # Configuration de l'internationalisation
    ├── types/           # Types partagés
    └── utils/           # Fonctions utilitaires
```

## Configuration

### Variables d'Environnement

Le fichier `.env` contient toutes les configurations nécessaires pour le projet :

- **Application** : Configuration générale de l'application
- **Base de données** : Paramètres MySQL
- **Directus** : Configuration de l'administrateur et des secrets
- **API** : URL publique et tokens
- **CORS** : Origines autorisées
- **Cookies** : Configuration des cookies de session

### Configuration Nginx

Le serveur Nginx est configuré pour :

- Servir l'application frontend
- Faire office de proxy inverse pour l'API Directus
- Gérer les certificats SSL pour HTTPS

## Développement

### Frontend

Pour travailler sur le frontend en mode développement :

```bash
# Assurez-vous que BUILD_TARGET=development dans .env
docker-compose up -d
```

Les modifications du code source seront automatiquement rechargées.

### Backend (Directus)

L'administration du backend se fait via l'interface Directus accessible à l'URL configurée dans `PUBLIC_API_URL`.

## Internationalisation

L'application prend en charge plusieurs langues :

- Français (par défaut)
- Anglais

Les fichiers de traduction se trouvent dans `frontend/src/shared/i18n/locales/`.

## Captures d'écran

![Dashboard](https://i.imgur.com/aQZCRp4.png)
![Gestion+des+Produits](https://i.imgur.com/Zrfo15b.png)

## Auteurs

- Équipe de développement LGTI

## Licence

Propriétaire - Tous droits réservés © 2025 LGTI

## FAQ

### Comment ajouter un nouveau produit?

Accédez à la page Produits et cliquez sur le bouton "Ajouter un produit". Remplissez le formulaire avec les informations requises et cliquez sur "Enregistrer".

### Comment effectuer un mouvement de stock?

Accédez à la page Mouvements et cliquez sur "Ajouter un mouvement". Sélectionnez le type de mouvement (entrée ou sortie), le produit concerné, la quantité et le prix unitaire si nécessaire.

### Comment créer un snapshot d'inventaire?

Accédez à la page Produits, puis cliquez sur "Voir les snapshots" et "Créer un nouvel snapshot". Donnez un nom et une description à votre snapshot pour référence future.

### Comment configurer l'environnement de production?

1. Modifiez le fichier `.env` en définissant `BUILD_TARGET=production`
2. Configurez les URL publiques et les paramètres CORS appropriés
3. Redémarrez les conteneurs avec `docker-compose up -d`

### Comment accéder à l'administration Directus?

Utilisez l'URL configurée dans `PUBLIC_API_URL` (par défaut: <http://localhost:8055>) et connectez-vous avec les identifiants définis dans les variables `DIRECTUS_ADMIN_EMAIL` et `DIRECTUS_ADMIN_PASSWORD`.

### Comment mettre à jour le projet?

1. Tirez les dernières modifications : `git pull`
2. Reconstruisez les images : `docker-compose build`
3. Redémarrez les conteneurs : `docker-compose up -d`
