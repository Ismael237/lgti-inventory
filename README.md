# LGTI - Système de Gestion d'Inventaire

Une application web moderne pour la gestion d'inventaire, le suivi des mouvements de stock, et la simulation de prix. Cette application permet aux entreprises de gérer efficacement leurs produits, catégories, mouvements de stock et de réaliser des simulations de prix.

![Logo](https://i.imgur.com/clMmAZC.png)

## Fonctionnalités

- Gestion complète des produits avec référencement, numéro de pièce et catégorisation
- Organisation hiérarchique des catégories de produits
- Suivi des mouvements de stock (entrées et sorties) avec historique détaillé
- Analyse statistique des mouvements de produits (quantités, montants, profits/pertes) avec filtrage par période
- Gestion des partenaires commerciaux (fournisseurs, clients, transporteurs)
- Création de snapshots d'inventaire pour l'historique et l'analyse
- Simulations de prix avec facteurs d'ajustement
- Génération et gestion de documents (factures, devis) avec numérotation automatique
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
    git clone https://github.com/Ismael237/lgti-inventory.git
    cd lgti-inventory
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

4. Générez les certificats SSL :

   **Pour le développement local :**

   Le script `scripts/generate-local-ssl.sh` utilise [mkcert](https://github.com/FiloSottile/mkcert) pour générer des certificats SSL locaux valides :

   ```bash
   # Installez mkcert d'abord
   # Sur Ubuntu/Debian : sudo apt install mkcert
   # Sur macOS : brew install mkcert

   # Générez les certificats pour tous les domaines locaux
   ./scripts/generate-local-ssl.sh inventory.lgticm.local www.lgticm.local lgticm.local api.lgticm.local www.api.lgticm.local
   ```

   **Pour l'environnement de production :**

   Le script `scripts/generate-online-ssl.sh` utilise Certbot (via Docker) pour obtenir des certificats Let's Encrypt valides :

   ```bash
   # Assurez-vous que le port 80 est accessible depuis l'internet
   ./scripts/generate-online-ssl.sh votre-domaine.com www.votre-domaine.com api.votre-domaine.com
   ```

   > **Note :** Pour l'environnement de production, remplacez les exemples de domaines par vos domaines réels.

5. Démarrez les conteneurs :

    ```bash
    docker-compose up -d
    ```


L'application sera disponible aux adresses suivantes :

- Frontend : <https://inventory.lgticm.local> (avec SSL local) ou <http://localhost> (sans SSL)
- API Directus : <https://api.lgticm.local> (avec SSL local) ou <http://localhost:8055> (sans SSL)

### Modes de Déploiement

Le projet supporte deux modes de déploiement configurables via la variable `BUILD_TARGET` dans le fichier `.env` :

- **development** : Mode de développement avec hot-reloading
- **production** : Mode optimisé pour la production

### Synchronisation de la Configuration Directus

Pour synchroniser la configuration Directus entre différents environnements, vous pouvez utiliser l'utilitaire directus-sync :

1. Créez un fichier de configuration basé sur l'exemple :

    ```bash
    cp backend/directus/config/directus-sync.example.config.js backend/directus/config/directus-sync.config.js
    ```

2. Modifiez le fichier `directus-sync.config.js` avec les paramètres suivants :

    ```javascript
    module.exports = {
        directusUrl: 'https://api.lgticm.local',      // URL de votre instance Directus
        directusToken: 'votre-token-admin-directus', // Token d'accès administrateur
        dumpPath: '../data/sync',                    // Chemin pour sauvegarder les configurations
    };
    ```

3. Pour exporter la configuration de Directus (collections, champs, relations) :

    ```bash
    npx directus-sync dump
    ```

4. Pour importer la configuration dans une nouvelle instance de Directus :

    ```bash
    npx directus-sync apply
    ```

> **Note :** Assurez-vous d'obtenir un token d'administrateur valide depuis l'interface Directus (Paramètres utilisateur > Token d'accès) et de l'ajouter à votre fichier de configuration.

5. Vérifiez que le `CREATE_SNAPSHOT_FLOW_ID` dans votre fichier `.env` correspond à l'ID du flow concerné dans votre instance Directus. Vous pouvez trouver cet ID dans l'interface d'administration Directus sous Paramètres > Flows.

### Initialisation des Types de Partenaires

La table `partner_type` doit être initialisée avec les valeurs de base pour le bon fonctionnement du système. La méthode recommandée est d'utiliser l'interface d'administration Directus :

1. Connectez-vous à l'interface Directus (par défaut: <http://localhost:8055>) avec vos identifiants administrateur
2. Naviguez vers Collections > partner_type
3. Cliquez sur "Créer un nouvel élément" pour chaque type de partenaire
4. Ajoutez les types standards suivants :
   - Fournisseur
   - Client
   - Transporteur
   - Autre

Alternativement, vous pouvez utiliser des requêtes SQL directes si nécessaire :

```bash
# Connectez-vous au conteneur MySQL
docker-compose exec mysql mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_DATABASE}

# Exécutez les commandes SQL
INSERT INTO partner_type (type_name) VALUES ('Fournisseur');
INSERT INTO partner_type (type_name) VALUES ('Client');
INSERT INTO partner_type (type_name) VALUES ('Transporteur');
INSERT INTO partner_type (type_name) VALUES ('Autre');
```

### Création des Comptes Utilisateurs

Pour permettre aux utilisateurs d'accéder à l'application frontend, vous devez créer des comptes avec le rôle "Inventory Analyst" dans Directus :

1. Connectez-vous à l'interface d'administration Directus avec un compte administrateur
2. Naviguez vers Utilisateurs > Utilisateurs
3. Cliquez sur "Créer un nouvel utilisateur"
4. Remplissez les informations de l'utilisateur :
   - Prénom et Nom
   - Email (servira d'identifiant de connexion)
   - Mot de passe
   - Sélectionnez le rôle "Inventory Analyst" dans le menu déroulant
5. Cliquez sur "Enregistrer"

Les utilisateurs avec ce rôle auront les permissions nécessaires pour utiliser toutes les fonctionnalités de l'application frontend, mais avec des restrictions appropriées sur les opérations sensibles dans le backend.

### Initialisation des Catégories et Produits

Pour initialiser rapidement votre système avec des catégories et produits, vous pouvez utiliser la fonctionnalité d'importation de Directus :

#### Préparation des fichiers d'importation

1. Créez des fichiers CSV ou JSON pour les catégories, produits, partenaires et mouvements en suivant ces structures :

   **categories.csv** (exemple) :
   ```csv
   name,parent_id
   Pièces mécaniques,
   Pièces électriques,
   Outillage,
   Moteurs,1
   Transmissions,1
   ```

   **partners.csv** (exemple) :
   ```csv
   name,code,address,contact_email,contact_phone
   ACME Fournitures,ACME,123 Rue Principale 75001 Paris,contact@acme.com,+33123456789
   TechnoSupply,TECH,456 Avenue Victor Hugo 69000 Lyon,info@technosupply.com,+33987654321
   MegaDistribution,MEGA,789 Boulevard Gambetta 33000 Bordeaux,service@megadistribution.com,+33567891234
   ```

   **partner_has_type.csv** (exemple pour associer les types aux partenaires) :
   ```csv
   partner_id,partner_type_id
   1,1
   2,1
   3,2
   3,3
   ```

   **products.csv** (exemple) :
   ```csv
   reference,description,part_number,unit_price_eur,category_id
   MEC001,Filtre à huile standard,FH-3344,12.50,1
   MEC002,Courroie de distribution,CD-9922,45.75,1
   ELEC001,Faisceau électrique principal,FE-1122,89.99,2
   OUT001,Clé à molette 12",CM-8877,15.25,3
   ```
   
   **movements.csv** (exemple pour initialiser le stock) :
   ```csv
   type,quantity,product_id,partner_id,unit_price_eur,notes
   IN,50,1,1,10.00,Stock initial
   IN,25,2,1,40.00,Stock initial
   IN,15,3,2,80.00,Stock initial
   IN,30,4,1,12.00,Stock initial
   ```

   > **Note :** Pour les champs de type relation (parent_id, category_id), utilisez l'ID numérique de l'enregistrement lié. Pour les catégories parent, importez d'abord les catégories de premier niveau, puis les sous-catégories dans une seconde importation.

#### Importation dans Directus

1. Connectez-vous à l'interface Directus
2. Naviguez vers la collection souhaitée (category, partner, product, movement, etc.)
3. Cliquez sur "Importer" dans le menu en haut à droite
4. Sélectionnez votre fichier CSV ou JSON

> **Important pour l'ordre d'importation** : 
> 1. Importez d'abord les types de partenaires (partner_type) si ce n'est pas déjà fait
> 2. Importez ensuite les catégories de premier niveau
> 3. Puis les catégories de second niveau (avec parent_id)
> 4. Ensuite les partenaires (partner)
> 5. Associez les types aux partenaires (partner_has_type)
> 6. Importez les produits
> 7. Enfin, importez les mouvements
5. Mappez les colonnes du fichier avec les champs de la collection
6. Lancez l'importation

#### Exemple de script d'initialisation (alternative)

Vous pouvez également créer un script personnalisé pour initialiser les données. Créez un fichier `seed-data.js` dans le répertoire `backend/directus/scripts` :

```javascript
// backend/directus/scripts/seed-data.js
const { createDirectus, rest, readItems, createItems } = require('@directus/sdk');
require('dotenv').config({ path: '../../../.env' });

const client = createDirectus(process.env.PUBLIC_API_URL)
  .with(rest());

async function seedData() {
  // Authentification admin
  await client.login({
    email: process.env.DIRECTUS_ADMIN_EMAIL,
    password: process.env.DIRECTUS_ADMIN_PASSWORD,
  });

  // Seed des catégories
  const categories = [
    { name: 'Pièces mécaniques' },
    { name: 'Pièces électriques' },
    { name: 'Outillage' },
  ];

  const createdCategories = await client.createItems('category', categories);
  console.log('Catégories créées:', createdCategories);

  // Seed des sous-catégories
  const subcategories = [
    { name: 'Moteurs', parent_id: createdCategories[0].id },
    { name: 'Transmissions', parent_id: createdCategories[0].id },
  ];

  const createdSubcategories = await client.createItems('category', subcategories);
  console.log('Sous-catégories créées:', createdSubcategories);
  
  // Seed des partenaires
  const partners = [
    { 
      name: 'ACME Fournitures', 
      code: 'ACME',
      address: '123 Rue Principale 75001 Paris',
      contact_email: 'contact@acme.com',
      contact_phone: '+33123456789'
    },
    { 
      name: 'TechnoSupply', 
      code: 'TECH',
      address: '456 Avenue Victor Hugo 69000 Lyon',
      contact_email: 'info@technosupply.com',
      contact_phone: '+33987654321'
    },
  ];

  const createdPartners = await client.createItems('partner', partners);
  console.log('Partenaires créés:', createdPartners);
  
  // Associer les types aux partenaires
  // Récupérer d'abord les types de partenaires
  const partnerTypes = await client.readItems('partner_type');
  
  const partnerHasTypes = [
    { 
      partner_id: createdPartners[0].id, 
      partner_type_id: partnerTypes.find(t => t.type_name === 'Fournisseur').id 
    },
    { 
      partner_id: createdPartners[1].id, 
      partner_type_id: partnerTypes.find(t => t.type_name === 'Client').id 
    },
  ];
  
  const createdPartnerHasTypes = await client.createItems('partner_has_type', partnerHasTypes);
  console.log('Associations de types de partenaires créées:', createdPartnerHasTypes);

  // Seed des produits
  const products = [
    {
      reference: 'MEC001',
      description: 'Filtre à huile standard',
      part_number: 'FH-3344',
      unit_price_eur: 12.50,
      category_id: createdCategories[0].id
    },
    {
      reference: 'ELEC001',
      description: 'Faisceau électrique principal',
      part_number: 'FE-1122',
      unit_price_eur: 89.99,
      category_id: createdCategories[1].id
    },
  ];

  const createdProducts = await client.createItems('product', products);
  console.log('Produits créés:', createdProducts);
  
  // Seed des mouvements initiaux (stock initial)
  const movements = [
    {
      type: 'IN',
      quantity: 50,
      product_id: createdProducts[0].id,
      partner_id: createdPartners[0].id, // Utilisation du premier partenaire (ACME)
      unit_price_eur: 10.00,
      notes: 'Stock initial'
    },
    {
      type: 'IN',
      quantity: 20,
      product_id: createdProducts[1].id,
      partner_id: createdPartners[0].id, // Utilisation du premier partenaire (ACME)
      unit_price_eur: 80.00,
      notes: 'Stock initial'
    },
  ];
  
  const createdMovements = await client.createItems('movement', movements);
  console.log('Mouvements initiaux créés:', createdMovements);
}

seedData()
  .then(() => console.log('Données initialisées avec succès'))
  .catch(err => console.error('Erreur lors de l\'initialisation des données:', err));
```

Pour exécuter ce script :

```bash
# Installer les dépendances nécessaires
cd backend/directus/scripts
npm init -y
npm install @directus/sdk dotus

# Exécuter le script
node seed-data.js
```

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

Accédez à la page Produits et cliquez sur le bouton "Ajouter un produit". Remplissez le formulaire avec les informations requises (référence, description, numéro de pièce, prix unitaire, catégorie) et cliquez sur "Enregistrer".

### Comment gérer les catégories de produits?

Naviguez vers la section Catégories depuis le menu principal. Vous pouvez ajouter des catégories parent ou des sous-catégories pour créer une hiérarchie adaptée à votre entreprise. Les produits peuvent ensuite être associés à n'importe quelle catégorie.

### Comment ajouter un nouveau partenaire commercial?

Accédez à la page Partenaires et cliquez sur "Ajouter un partenaire". Renseignez les informations de contact et sélectionnez un ou plusieurs types de partenaire (fournisseur, client, transporteur, autre). Un même partenaire peut avoir plusieurs rôles.

### Comment effectuer un mouvement de stock?

Accédez à la page Mouvements et cliquez sur "Ajouter un mouvement". Sélectionnez le type de mouvement (entrée ou sortie), le produit concerné, la quantité, le prix unitaire et le partenaire associé si nécessaire. Vous pouvez également ajouter des notes pour plus de détails.

### Comment consulter les statistiques de mouvements de produits?

Naviguez vers la page Statistiques de Mouvements depuis le menu principal. Vous pourrez visualiser pour chaque produit les quantités entrées/sorties, la différence, les montants entrés/sortis et le profit/perte. Utilisez les filtres pour affiner l'analyse par période.

### Comment créer un snapshot d'inventaire?

Accédez à la page Produits, puis cliquez sur "Voir les snapshots" et "Créer un nouvel snapshot". Donnez un nom et une description à votre snapshot pour référence future. Les snapshots sont un excellent moyen de capturer l'état de votre inventaire à un moment précis.

### Comment générer une facture ou un devis?

Allez dans la section Documents, puis cliquez sur "Nouveau document". Sélectionnez le type (facture ou devis), ajoutez les informations du client et les lignes de produits. Le système calculera automatiquement les totaux et générera un document formaté avec une référence unique.

### Comment effectuer une simulation de prix?

Dans la section Simulations, créez un nouveau scénario en spécifiant un facteur d'ajustement. Le système appliquera ce facteur aux prix actuels de vos produits pour vous aider à planifier des stratégies de prix.

### Comment configurer l'environnement de production?

1. Modifiez le fichier `.env` en définissant `BUILD_TARGET=production`
2. Configurez les URL publiques et les paramètres CORS appropriés
3. Générez des certificats SSL valides avec le script `generate-online-ssl.sh`
4. Redémarrez les conteneurs avec `docker-compose up -d`

### Comment accéder à l'administration Directus?

Utilisez l'URL configurée dans `PUBLIC_API_URL` (par défaut: <http://localhost:8055>) et connectez-vous avec les identifiants définis dans les variables `DIRECTUS_ADMIN_EMAIL` et `DIRECTUS_ADMIN_PASSWORD`.

### Comment mettre à jour le projet?

1. Tirez les dernières modifications : `git pull`
2. Reconstruisez les images : `docker-compose build`
3. Redémarrez les conteneurs : `docker-compose up -d`

### Comment résoudre les problèmes d'accès à la base de données?

Si vous rencontrez des erreurs de connexion à la base de données, vérifiez les points suivants :
1. Les identifiants dans le fichier `.env` sont corrects
2. Le conteneur MySQL est en cours d'exécution (`docker-compose ps`)
3. Les tables sont correctement initialisées, particulièrement la table `partner_type`
