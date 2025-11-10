# 🎨 Nouveau Menu ReelVibe - Structure

## 📋 Navigation Principale

### **Visiteur (Non connecté)**
```
ReelVibe Logo | Découvrir | Fonctionnalités | [Se connecter] [S'inscrire]
```

### **Utilisateur Connecté**
```
ReelVibe Logo | Accueil | Découvrir | Ma Collection | Communauté | [Avatar Menu]
```

---

## 🎯 Structure Détaillée

### 1. **Accueil** (`/home`)
- Page personnalisée
- Films vus récemment
- Recommandations

### 2. **Découvrir**
Dropdown avec :
- 🎬 Films (`/films`)
- 📺 Séries (`/series`)
- 🎭 Sagas (`/sagas`)
- ✨ Nouveautés (`/nouveautes`)
- 🔥 Tendances (`/trending`)

### 3. **Ma Collection**
Dropdown avec :
- ❤️ Mes Likes (`/likes`)
- 📋 Mes Listes (`/my-lists`)
- ⭐ Mes Critiques (`/reviews`)
- 📊 Statistiques (`/stats`)
- 👁️ Films Vus (`/watched`)

### 4. **Communauté** (Nouveau)
Dropdown avec :
- 👥 Mes Amis (`/friends`)
- 🎭 Watch Parties (`/parties`)
- 📅 Calendrier Partagé (`/calendar`)
- 💬 Activités (`/activity`)

### 5. **Avatar Menu**
Dropdown avec :
- 👤 Mon Profil (`/profile`)
- ⚙️ Paramètres (`/settings`)
- 🎨 Thèmes (Modal)
- 📖 Aide (`/help`)
- 🚪 Déconnexion

---

## 🔍 Barre de Recherche
- Position : Milieu/Droite
- Placeholder : "Rechercher un film, une série..."
- Résultats en dropdown avec mini-posters

---

## 📱 Menu Mobile
Structure simplifiée :
```
Hamburger Menu
├─ Accueil
├─ Découvrir
│  ├─ Films
│  ├─ Séries
│  └─ Nouveautés
├─ Ma Collection
│  ├─ Mes Likes
│  ├─ Mes Listes
│  └─ Statistiques
├─ Communauté
│  ├─ Amis
│  └─ Watch Parties
├─ Mon Profil
├─ Paramètres
└─ Déconnexion
```

---

## ❌ Éléments Supprimés

- ❌ "Watch" / "Lecture"
- ❌ "Watch Party" (déplacé dans Communauté)
- ❌ "Historique" (renommé en "Films Vus")
- ❌ Toute référence à streaming/vidéo

---

## ✨ Nouveaux Éléments

- ✅ "Communauté" (section sociale)
- ✅ "Films Vus" (au lieu de "Historique")
- ✅ "Mes Critiques" (dans Ma Collection)
- ✅ "Calendrier" (sorties de films)
- ✅ "Activités" (feed social)

---

## 🎨 Style Visual

### Couleurs
- Active : Gradient purple-pink
- Hover : Purple glow
- Default : Gray-300
- Background : Black/transparent

### Animations
- Smooth transitions (300ms)
- Scale on hover (1.05x)
- Dropdown fade-in
- Icon rotations (chevrons)

---

## 📊 Hiérarchie d'Importance

**Niveau 1** (Toujours visible)
- Accueil
- Découvrir
- Ma Collection
- Avatar

**Niveau 2** (Dropdown)
- Sous-sections de chaque catégorie

**Niveau 3** (Contextuels)
- Notifications
- Messages (futur)
- Badges (futur)
