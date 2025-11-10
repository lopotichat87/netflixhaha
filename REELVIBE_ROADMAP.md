# 🎬 ReelVibe - Roadmap d'Implémentation

## 🎯 Vision

**ReelVibe** - Une plateforme sociale de curation de films avec analyse émotionnelle et collaboration en temps réel.

---

## 📋 Phases d'Implémentation

### 🚀 Phase 0 : Rebranding (1-2 jours)
**Priorité : HAUTE**

- [ ] Renommer l'application en "ReelVibe"
- [ ] Créer le nouveau logo et l'identité visuelle
- [ ] Mettre à jour tous les textes et branding
- [ ] Définir la nouvelle palette de couleurs

**Couleurs ReelVibe** :
- Primaire : Violet/Pourpre (#8B5CF6) - Créativité et émotion
- Secondaire : Cyan (#06B6D4) - Technologie et modernité
- Accent : Rose (#EC4899) - Passion et social
- Fond : Noir profond (#0A0A0A)

---

### 🎨 Phase 1 : Personnalisation du Profil (1 semaine)
**Priorité : HAUTE** ⭐

#### 1.1 Thèmes Visuels
- [ ] Système de thèmes (Dark, Light, Cinema, Neon, Vintage)
- [ ] Sélecteur de thème dans les paramètres
- [ ] Persistance du thème choisi
- [ ] Couleurs personnalisées par thème

#### 1.2 Profil Stylisé
- [ ] Bannière de profil personnalisable
- [ ] Avatar avec frames/bordures thématiques
- [ ] Bio enrichie avec Markdown
- [ ] Badges et achievements
- [ ] Statistiques visuelles élégantes

**Stack Technique** :
```tsx
// Contexte de thème
ThemeContext (React Context)
// Stockage
localStorage + Supabase user_preferences
// Composants
ThemeSelector, ProfileBanner, AvatarFrame
```

**Base de Données** :
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  theme VARCHAR(50) DEFAULT 'dark',
  banner_url TEXT,
  avatar_frame VARCHAR(50),
  custom_colors JSONB,
  updated_at TIMESTAMP
);
```

---

### 😊 Phase 2 : Analyse Émotionnelle (2 semaines)
**Priorité : HAUTE** ⭐⭐

#### 2.1 Système d'Émotions
- [ ] Taxonomie d'émotions (Joyeux, Triste, Inspirant, Intense, etc.)
- [ ] Tags émotionnels sur les films
- [ ] Analyse des critiques pour détecter les émotions
- [ ] Mood selector (Slider d'humeur)

#### 2.2 Détection Automatique
- [ ] NLP basique pour analyser les reviews
- [ ] Agrégation des émotions par film
- [ ] Score émotionnel composite

#### 2.3 Recommandations par Humeur
- [ ] Filtre "Comment je me sens ?" sur la page d'accueil
- [ ] Recommandations basées sur l'humeur actuelle
- [ ] Historique des humeurs et des films regardés

**Stack Technique** :
```tsx
// API
OpenAI GPT-4 (analyse de sentiment)
// ou
Sentiment.js (gratuit, basique)
// Composants
MoodSelector, EmotionTags, MoodBasedRecommendations
```

**Base de Données** :
```sql
CREATE TABLE movie_emotions (
  id BIGSERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10),
  emotion_type VARCHAR(50), -- joy, sadness, excitement, etc.
  intensity DECIMAL(3,2), -- 0.00 to 1.00
  source VARCHAR(20) -- 'user_tags', 'review_analysis', 'manual'
);

CREATE TABLE user_mood_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  mood VARCHAR(50),
  intensity INTEGER, -- 1-10
  watched_media_id INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

### 👥 Phase 3 : Mode Cinéma Collaboratif (2-3 semaines)
**Priorité : MOYENNE** ⭐⭐⭐

#### 3.1 Listes Collaboratives
- [ ] Créer une "Watch Party List"
- [ ] Inviter des amis (par email ou username)
- [ ] Permissions (admin, éditeur, viewer)
- [ ] Votes sur les films de la liste

#### 3.2 Chat Temps Réel
- [ ] Salle de chat par liste collaborative
- [ ] Messages en temps réel (WebSocket)
- [ ] Notifications push
- [ ] Réactions rapides (emoji)

#### 3.3 Système de Votes
- [ ] Upvote/Downvote sur les suggestions
- [ ] Timer pour la décision finale
- [ ] Algorithme de consensus

**Stack Technique** :
```tsx
// Temps réel
Supabase Realtime (WebSocket)
// ou
Socket.io + Redis
// Composants
CollaborativeList, ChatRoom, VotingSystem
```

**Base de Données** :
```sql
CREATE TABLE collaborative_lists (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100),
  creator_id UUID,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE list_members (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES collaborative_lists(id),
  user_id UUID,
  role VARCHAR(20), -- 'admin', 'editor', 'viewer'
  joined_at TIMESTAMP
);

CREATE TABLE list_suggestions (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT,
  media_id INTEGER,
  media_type VARCHAR(10),
  suggested_by UUID,
  votes JSONB, -- {user_id: vote_value}
  status VARCHAR(20), -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP
);

CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT,
  user_id UUID,
  message TEXT,
  type VARCHAR(20), -- 'text', 'reaction', 'system'
  created_at TIMESTAMP
);
```

---

### 🤝 Phase 4 : Recommandations entre Amis (1 semaine)
**Priorité : MOYENNE** ⭐⭐

#### 4.1 Système d'Amis
- [ ] Envoyer/accepter demandes d'ami
- [ ] Liste d'amis
- [ ] Profils publics/privés

#### 4.2 Recommandations Sociales
- [ ] "Mes amis ont aimé" dans les recommandations
- [ ] Compatibilité de goûts (score)
- [ ] Feed d'activités des amis
- [ ] Notifications de recommandations

**Base de Données** :
```sql
CREATE TABLE friendships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  friend_id UUID,
  status VARCHAR(20), -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP,
  UNIQUE(user_id, friend_id)
);

CREATE TABLE friend_recommendations (
  id BIGSERIAL PRIMARY KEY,
  from_user_id UUID,
  to_user_id UUID,
  media_id INTEGER,
  media_type VARCHAR(10),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

CREATE TABLE taste_compatibility (
  user_a_id UUID,
  user_b_id UUID,
  score DECIMAL(3,2), -- 0.00 to 1.00
  common_likes INTEGER,
  calculated_at TIMESTAMP,
  PRIMARY KEY(user_a_id, user_b_id)
);
```

---

### 🎙️ Phase 5 : Micro-Critiques Audio/Vidéo (2 semaines)
**Priorité : BASSE** ⭐

#### 5.1 Upload Audio
- [ ] Enregistrement audio dans le navigateur
- [ ] Upload vers stockage cloud
- [ ] Player audio dans les reviews
- [ ] Limite de durée (30s-2min)

#### 5.2 Upload Vidéo
- [ ] Enregistrement vidéo (webcam)
- [ ] Upload vidéo (ou lien YouTube)
- [ ] Miniature générée automatiquement
- [ ] Player vidéo intégré

**Stack Technique** :
```tsx
// Stockage
Supabase Storage (fichiers audio/vidéo)
// ou
Cloudinary, AWS S3
// Enregistrement
MediaRecorder API (natif navigateur)
// Composants
AudioRecorder, VideoRecorder, MediaPlayer
```

**Base de Données** :
```sql
ALTER TABLE ratings ADD COLUMN media_review_url TEXT;
ALTER TABLE ratings ADD COLUMN media_review_type VARCHAR(10); -- 'audio', 'video'
ALTER TABLE ratings ADD COLUMN media_review_duration INTEGER; -- en secondes
```

---

### 📅 Phase 6 : Calendrier de Sorties (1 semaine)
**Priorité : MOYENNE** ⭐⭐

#### 6.1 Calendrier Personnel
- [ ] Vue calendrier des sorties de films
- [ ] Filtres par genre/pays
- [ ] Films à venir dans ma watchlist
- [ ] Synchronisation avec TMDB releases

#### 6.2 Calendrier Collaboratif
- [ ] Calendrier partagé avec amis
- [ ] Événements "Aller voir X ensemble"
- [ ] Rappels avant la sortie

#### 6.3 Notifications
- [ ] Notifications push (navigateur)
- [ ] Emails de rappel
- [ ] Résumé hebdomadaire

**Stack Technique** :
```tsx
// Calendrier
FullCalendar ou react-big-calendar
// Notifications
Web Push API + Service Worker
// ou
OneSignal (service tiers)
// Composants
ReleaseCalendar, EventCreator, NotificationManager
```

**Base de Données** :
```sql
CREATE TABLE release_events (
  id BIGSERIAL PRIMARY KEY,
  media_id INTEGER,
  media_type VARCHAR(10),
  release_date DATE,
  region VARCHAR(10), -- 'FR', 'US', 'Worldwide'
  type VARCHAR(20), -- 'theatrical', 'streaming', 'dvd'
);

CREATE TABLE user_calendar_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  media_id INTEGER,
  event_type VARCHAR(50), -- 'release_reminder', 'watch_together'
  event_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP
);

CREATE TABLE shared_events (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT,
  created_by UUID,
  invited_users UUID[],
  location TEXT,
  status VARCHAR(20) -- 'confirmed', 'tentative', 'cancelled'
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  notification_types JSONB, -- {releases: true, friends: true, etc.}
  frequency VARCHAR(20) -- 'instant', 'daily', 'weekly'
);
```

---

## 🛠️ Stack Technique Global

### Frontend
- **Framework** : Next.js 15 + React 19
- **Styling** : TailwindCSS + Framer Motion
- **État** : React Context + TanStack Query
- **Temps Réel** : Supabase Realtime
- **Icons** : Lucide React

### Backend
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Storage** : Supabase Storage
- **API externe** : TMDB API
- **Analyse sentiment** : OpenAI API ou Sentiment.js

### Temps Réel
- **WebSocket** : Supabase Realtime
- **Alternative** : Socket.io + Redis

### Notifications
- **Web Push** : Service Worker + Push API
- **Email** : Supabase Email ou SendGrid

---

## 📊 Timeline Estimée

| Phase | Durée | Difficulté |
|-------|-------|-----------|
| **0. Rebranding** | 1-2 jours | Facile |
| **1. Personnalisation** | 1 semaine | Moyenne |
| **2. Analyse Émotionnelle** | 2 semaines | Difficile |
| **3. Cinéma Collaboratif** | 2-3 semaines | Très Difficile |
| **4. Recommandations Amis** | 1 semaine | Moyenne |
| **5. Critiques Audio/Vidéo** | 2 semaines | Difficile |
| **6. Calendrier** | 1 semaine | Moyenne |

**Total estimé** : 9-11 semaines pour tout implémenter

---

## 🎯 Ordre de Priorité Recommandé

### Sprint 1 (2 semaines)
1. ✅ Rebranding ReelVibe
2. ✅ Personnalisation du profil (thèmes)

### Sprint 2 (2 semaines)
3. ✅ Analyse émotionnelle basique
4. ✅ Mood selector

### Sprint 3 (2 semaines)
5. ✅ Système d'amis
6. ✅ Recommandations entre amis

### Sprint 4 (3 semaines)
7. ✅ Mode cinéma collaboratif
8. ✅ Chat temps réel

### Sprint 5 (2 semaines)
9. ✅ Calendrier de sorties
10. ✅ Notifications

### Sprint 6 (2 semaines)
11. ✅ Micro-critiques audio/vidéo

---

## 🚀 Par Où Commencer ?

**Je recommande de commencer par :**

1. **Rebranding** (quick win, visible immédiatement)
2. **Personnalisation du profil** (améliore l'engagement)
3. **Analyse émotionnelle** (fonctionnalité signature unique)

**Voulez-vous que je commence à implémenter la Phase 0 (Rebranding) ?**

---

## 📝 Notes Importantes

### Coûts à Prévoir
- OpenAI API : ~$0.002 par requête (analyse sentiment)
- Supabase Storage : Gratuit jusqu'à 1GB, puis $0.021/GB
- Notifications Push : Gratuit (service natif) ou OneSignal gratuit jusqu'à 10k utilisateurs

### Alternatives Gratuites
- **Analyse sentiment** : Sentiment.js (gratuit mais moins précis)
- **Chat** : Supabase Realtime (inclus dans le plan gratuit)
- **Storage** : Supabase Storage (1GB gratuit)

### Scalabilité
- Supabase gratuit : 500MB DB, 1GB Storage, 2GB bandwidth
- Pour production : Plan Pro ~$25/mois recommandé

---

## 🎨 Prochaine Étape

Confirmez et je commence par :
1. ✅ Renommer en ReelVibe
2. ✅ Créer la nouvelle identité visuelle
3. ✅ Mettre à jour le logo et les couleurs
4. ✅ Créer le système de thèmes

**Prêt à transformer votre application en ReelVibe ? 🚀**
