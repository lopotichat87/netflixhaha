# 📊 Base de Données ReelVibe - Guide Complet

## 🗄️ Structure de la Base de Données

### Fichiers SQL
- **`reelvibe_complete.sql`** - Script complet de création (NOUVEAU)
- **`migration.sql`** - Migration initiale (ancien)

---

## 🚀 Installation Rapide

### Méthode 1 : Via Supabase Dashboard

1. Connectez-vous à https://supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une **New Query**
5. Copiez le contenu de `reelvibe_complete.sql`
6. Cliquez sur **Run**
7. ✅ Terminé !

### Méthode 2 : Via CLI Supabase

```bash
# Si vous avez Supabase CLI installé
supabase db reset
supabase db push

# Ou exécuter directement le fichier
psql $DATABASE_URL < supabase/reelvibe_complete.sql
```

---

## 📋 Tables Créées (20 au total)

### 🔐 **Authentification & Profils**
1. **`profiles`** - Profils utilisateurs
2. **`user_preferences`** - Préférences et thèmes

### ⭐ **Films & Critiques**
3. **`ratings`** - Notes, critiques, likes
4. **`user_lists`** - Listes personnelles
5. **`list_items`** - Contenu des listes

### 👥 **Social**
6. **`user_follows`** - Système de suivi
7. **`activities`** - Journal d'activités
8. **`friendships`** - Système d'amis
9. **`friend_recommendations`** - Recommandations entre amis
10. **`taste_compatibility`** - Score de compatibilité

### 🎭 **Cinéma Collaboratif**
11. **`collaborative_lists`** - Listes partagées
12. **`list_members`** - Membres des listes
13. **`list_suggestions`** - Suggestions de films
14. **`chat_messages`** - Chat temps réel

### 😊 **Analyse Émotionnelle**
15. **`movie_emotions`** - Émotions par film
16. **`user_mood_history`** - Historique d'humeur

### 📅 **Calendrier**
17. **`release_events`** - Sorties de films
18. **`user_calendar_events`** - Événements perso
19. **`shared_events`** - Événements partagés
20. **`notification_preferences`** - Préférences notifs

---

## 🔧 Fonctionnalités Incluses

### Triggers Automatiques
- ✅ `updated_at` auto-mis à jour
- ✅ Création d'activité lors d'un rating
- ✅ Validation des données

### Vues Pratiques
- 📊 `user_stats` - Statistiques utilisateur
- 📝 `recent_ratings` - Ratings récents
- 📰 `activities_feed` - Feed d'activités

### Row Level Security (RLS)
- 🔒 Policies de sécurité sur toutes les tables
- 👤 Chaque utilisateur voit ses propres données
- 🌍 Données publiques visibles par tous

### Index Optimisés
- ⚡ Recherches rapides
- 🚀 Performances optimales
- 📈 Scalabilité assurée

---

## 📊 Schéma des Relations

```
auth.users (Supabase Auth)
    ├─→ profiles (1:1)
    ├─→ user_preferences (1:1)
    ├─→ ratings (1:N)
    ├─→ user_lists (1:N)
    ├─→ user_follows (N:M)
    ├─→ friendships (N:M)
    ├─→ activities (1:N)
    ├─→ collaborative_lists (1:N)
    ├─→ user_mood_history (1:N)
    └─→ user_calendar_events (1:N)

ratings
    └─→ activities (trigger auto)

user_lists
    └─→ list_items (1:N)

collaborative_lists
    ├─→ list_members (1:N)
    ├─→ list_suggestions (1:N)
    └─→ chat_messages (1:N)
```

---

## 🎯 Exemples d'Utilisation

### Créer un profil
```sql
INSERT INTO profiles (user_id, username, email, avatar_url)
VALUES (
  auth.uid(),
  'JohnDoe',
  'john@example.com',
  '🎬|bg-purple-600'
);
```

### Noter un film
```sql
INSERT INTO ratings (user_id, media_id, media_type, media_title, rating, review, is_liked)
VALUES (
  auth.uid(),
  550, -- Fight Club
  'movie',
  'Fight Club',
  5.0,
  'Un chef-d''œuvre absolu!',
  true
);
```

### Créer une liste
```sql
INSERT INTO user_lists (user_id, name, description, is_public)
VALUES (
  auth.uid(),
  'Mes films préférés',
  'Une sélection de mes coups de cœur',
  true
)
RETURNING id;
```

### Ajouter à une liste
```sql
INSERT INTO list_items (list_id, media_id, media_type, media_title, position)
VALUES (
  1, -- ID de la liste
  550,
  'movie',
  'Fight Club',
  1
);
```

### Devenir ami
```sql
INSERT INTO friendships (user_id, friend_id, status)
VALUES (
  auth.uid(),
  'uuid-de-l-ami',
  'pending'
);
```

### Chercher des amis avec goûts similaires
```sql
SELECT 
  p.username,
  tc.score,
  tc.common_likes
FROM taste_compatibility tc
JOIN profiles p ON (
  CASE 
    WHEN tc.user_a_id = auth.uid() THEN p.user_id = tc.user_b_id
    ELSE p.user_id = tc.user_a_id
  END
)
WHERE tc.user_a_id = auth.uid() OR tc.user_b_id = auth.uid()
ORDER BY tc.score DESC
LIMIT 10;
```

---

## 🔍 Requêtes Utiles

### Stats utilisateur
```sql
SELECT * FROM user_stats WHERE user_id = auth.uid();
```

### Feed d'activités
```sql
SELECT * FROM activities_feed LIMIT 50;
```

### Films les mieux notés
```sql
SELECT 
  media_id,
  media_title,
  AVG(rating) as avg_rating,
  COUNT(*) as rating_count
FROM ratings
WHERE rating IS NOT NULL
GROUP BY media_id, media_title
HAVING COUNT(*) >= 5
ORDER BY avg_rating DESC, rating_count DESC
LIMIT 100;
```

### Amis ayant aimé un film
```sql
SELECT DISTINCT
  p.username,
  p.avatar_url,
  r.rating,
  r.review
FROM ratings r
JOIN friendships f ON (
  (f.user_id = auth.uid() AND f.friend_id = r.user_id)
  OR
  (f.friend_id = auth.uid() AND f.user_id = r.user_id)
)
JOIN profiles p ON p.user_id = r.user_id
WHERE r.media_id = 550 -- Fight Club
  AND r.is_liked = true
  AND f.status = 'accepted';
```

---

## 🛠️ Maintenance

### Vérifier la santé de la DB
```sql
-- Nombre d'enregistrements par table
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY n_tup_ins DESC;
```

### Nettoyer les anciennes activités
```sql
DELETE FROM activities
WHERE created_at < NOW() - INTERVAL '6 months';
```

### Recalculer la compatibilité des goûts
```sql
-- À implémenter dans une fonction SQL ou via backend
-- Comparer les ratings communs entre utilisateurs
```

---

## ⚠️ Points Importants

### Avant d'exécuter
1. **Backup** : Toujours faire une sauvegarde avant
2. **Test** : Tester sur un environnement de dev d'abord
3. **Review** : Vérifier les policies RLS selon vos besoins

### Après l'exécution
1. ✅ Vérifier que toutes les tables sont créées
2. ✅ Tester les policies RLS
3. ✅ Créer un profil de test
4. ✅ Noter un film de test

### Performance
- Les index sont optimisés pour les requêtes courantes
- RLS peut impacter les performances sur grandes tables
- Pensez à paginer les résultats (LIMIT + OFFSET)

---

## 🔐 Sécurité

### Policies RLS Activées
Toutes les tables ont RLS activé pour protéger les données.

### Règles principales :
- ✅ Lecture publique pour profils et ratings
- 🔒 Modification uniquement de ses propres données
- 👥 Friendships visibles uniquement par les concernés
- 📝 Listes privées invisibles aux autres

### Désactiver RLS (DÉVELOPPEMENT UNIQUEMENT)
```sql
-- NE JAMAIS FAIRE EN PRODUCTION !
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
```

---

## 📚 Documentation Supabase

- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 🆘 Problèmes Courants

### Erreur : "relation already exists"
**Solution** : La table existe déjà. Utilisez `DROP TABLE` ou `IF NOT EXISTS`

### Erreur : "permission denied"
**Solution** : Vérifiez les policies RLS ou utilisez le service_role key

### Performances lentes
**Solution** : 
- Ajoutez des index supplémentaires
- Utilisez EXPLAIN ANALYZE
- Paginafiez les résultats

---

## ✅ Checklist Post-Installation

- [ ] Toutes les tables créées
- [ ] Triggers fonctionnels
- [ ] Vues accessibles
- [ ] RLS testé
- [ ] Profil de test créé
- [ ] Rating de test créé
- [ ] Liste de test créée
- [ ] Amitié de test créée

---

## 🎉 Résultat

Vous avez maintenant une base de données **complète** pour ReelVibe avec :
- ✅ 20 tables optimisées
- ✅ Sécurité RLS
- ✅ Triggers automatiques
- ✅ Vues pratiques
- ✅ Index de performance
- ✅ Support pour toutes les fonctionnalités

**La base est prête pour accueillir des milliers d'utilisateurs ! 🚀**
