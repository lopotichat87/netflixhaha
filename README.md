# 🎬 Netflix Clone

Un clone Netflix moderne et élégant construit avec Next.js 15, React 19, TypeScript et Tailwind CSS.

![Netflix Clone](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Fonctionnalités

### Interface & UX
- 🎥 **Hero Section dynamique** avec film tendance et animations Framer Motion
- 📱 **Design responsive** optimisé pour mobile et desktop
- 🎨 **Interface Netflix authentique** avec animations fluides
- 🎯 **Cartes interactives** avec effets hover et transitions
- 🎬 **Catégories de films** : Tendances, Populaires, Mieux notés, Prochainement, Nouveautés

### Fonctionnalités Vidéo
- 📄 **Pages de détails** avec bandes-annonces YouTube intégrées
- 🎬 **Lecteur Video.js** professionnel avec contrôles personnalisés
- ▶️ **Lecture fluide** avec support HTML5

### Performance & Analytics
- ⚡ **Performance optimale** avec Next.js 15 et Turbopack
- 📊 **Google Analytics GA4** pour le suivi des utilisateurs
- 🏷️ **Google Tag Manager** pour la gestion des événements
- 📈 **Cloudflare Browser Insights** pour le monitoring RUM
- 🌐 **PWA** - Application installable sur mobile et desktop
- 🚀 **HTTP/3** via Cloudflare CDN pour une vitesse maximale

### Composants UI
- 🎨 **shadcn/ui** - Composants UI modernes et accessibles
- 🔘 **Radix UI** - Primitives UI avec accessibilité intégrée
- ✨ **Framer Motion** - Animations et transitions fluides

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- Un compte TMDB (The Movie Database) pour obtenir une clé API

### Étapes d'installation

1. **Cloner le projet** (si ce n'est pas déjà fait)
```bash
cd netflix-clone
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env.local` à la racine du projet avec les clés suivantes :

```bash
# TMDB API (REQUIS)
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_api_ici

# Google Analytics GA4 (Optionnel)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager (Optionnel)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Cloudflare Browser Insights (Optionnel)
NEXT_PUBLIC_CLOUDFLARE_TOKEN=votre_cloudflare_token
```

   **Pour obtenir les clés :**
   - **TMDB** : [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - **Google Analytics** : [analytics.google.com](https://analytics.google.com/)
   - **Google Tag Manager** : [tagmanager.google.com](https://tagmanager.google.com/)
   - **Cloudflare** : Dashboard Cloudflare > Analytics > Web Analytics

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir l'application**

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
netflix-clone/
├── app/                    # Pages Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── globals.css        # Styles globaux
│   └── movie/[id]/        # Pages de détails des films
├── components/            # Composants React réutilisables
│   ├── Navbar.tsx        # Barre de navigation
│   ├── Hero.tsx          # Section hero
│   ├── MovieCard.tsx     # Carte de film
│   └── MovieRow.tsx      # Rangée de films défilante
├── lib/                   # Utilitaires et services
│   └── tmdb.ts           # Service API TMDB
├── types/                 # Types TypeScript
│   └── movie.ts          # Interfaces pour les films
└── public/               # Assets statiques
```

## 🛠️ Technologies utilisées

### Framework & Core
- **Next.js 15.5.6** - Framework React avec App Router et Turbopack
- **React 19.1.0** - Bibliothèque UI
- **TypeScript** - Typage statique
- **React Router 6** - Navigation côté client

### UI & Styling
- **Tailwind CSS 4** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI réutilisables
- **Radix UI** - Primitives UI accessibles
- **Framer Motion** - Animations fluides et transitions
- **Lucide React** - Icônes modernes (Google Font API compatible)

### Media & Video
- **Video.js** - Lecteur vidéo HTML5 professionnel
- **@videojs/themes** - Thèmes pour Video.js

### Analytics & Monitoring
- **Google Analytics GA4** - Analyse d'audience
- **Google Tag Manager** - Gestion des balises
- **Cloudflare Browser Insights** - RUM (Real User Monitoring)

### API & Data
- **Axios** - Client HTTP pour les appels API
- **TMDB API** - Base de données de films

### PWA & Performance
- **PWA (Progressive Web App)** - Application installable
- **HTTP/3** - Protocole moderne (via Cloudflare CDN)
- **Cloudflare CDN** - Distribution de contenu globale

## 📝 Scripts disponibles

```bash
npm run dev      # Lancer le serveur de développement avec Turbopack
npm run build    # Créer une version de production
npm run start    # Lancer le serveur de production
npm run lint     # Vérifier le code avec ESLint
```

## 🎨 Fonctionnalités à venir

- [ ] Système d'authentification
- [ ] Ma liste personnalisée
- [ ] Recherche avancée de films
- [ ] Filtres par genre
- [ ] Mode sombre/clair
- [ ] Lecteur vidéo intégré
- [ ] Profils utilisateurs multiples

## 📸 Aperçu

L'application comprend :
- Une navbar fixe avec effet de transparence au scroll
- Une section hero avec le film tendance du moment
- Des rangées de films défilantes horizontalement
- Des cartes de films avec effets hover élégants
- Des pages de détails complètes avec bandes-annonces

## Configuration TMDB

Pour obtenir votre clé API TMDB :

1. Créez un compte sur [themoviedb.org](https://www.themoviedb.org/)
2. Allez dans **Paramètres** → **API**
3. Demandez une clé API (gratuite)
4. Copiez votre clé API v3
5. Ajoutez-la dans `.env.local`

## Licence

Ce projet est à but éducatif uniquement.

## Crédits

- Design inspiré de [Netflix](https://www.netflix.com)
- Données de films fournies par [TMDB](https://www.themoviedb.org)

---

Développé avec ❤️ en utilisant Next.js et React
