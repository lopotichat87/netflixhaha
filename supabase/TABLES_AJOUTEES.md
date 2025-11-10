# 📊 Tables Manquantes à Ajouter

## 🎯 Récapitulatif

Vous avez **17 tables existantes**.  
Il manque **13 tables** pour ReelVibe complet.

---

## ✅ Tables Existantes (17)

1. ✓ `activities`
2. ✓ `activity_sessions`
3. ✓ `chat_messages`
4. ✓ `favorites`
5. ✓ `list_items`
6. ✓ `party_sync`
7. ✓ `profiles`
8. ✓ `ratings`
9. ✓ `recent_ratings` (vue)
10. ✓ `user_follows`
11. ✓ `user_lists`
12. ✓ `user_profiles`
13. ✓ `user_stats` (vue)
14. ✓ `viewing_stats`
15. ✓ `watch_history`
16. ✓ `watch_parties`

---

## ❌ Tables Manquantes (13)

### **Thèmes & Préférences**
1. **`user_preferences`** ⭐ IMPORTANT
   - Thèmes (reelvibe, dark, cinema, neon, vintage)
   - Bannière, avatar frame
   - Préférences langue et notifications

### **Social & Amis**
2. **`friendships`** ⭐ IMPORTANT
   - Système d'amis (pending, accepted, blocked)
   - Base pour recommandations sociales

3. **`friend_recommendations`**
   - Recommandations de films entre amis
   - Messages personnalisés

4. **`taste_compatibility`**
   - Score de compatibilité entre utilisateurs
   - Nombre de likes communs

### **Cinéma Collaboratif**
5. **`collaborative_lists`** ⭐ IMPORTANT
   - Listes partagées pour watch parties
   - System de votes activable

6. **`list_members`**
   - Membres des listes (admin, editor, viewer)
   - Permissions

7. **`list_suggestions`**
   - Suggestions de films avec votes
   - Status (pending, accepted, rejected)

### **Analyse Émotionnelle**
8. **`movie_emotions`** ⭐ IMPORTANT
   - Émotions par film (joy, sadness, excitement...)
   - Intensité 0-1
   - Source (user_tags, review_analysis, manual)

9. **`user_mood_history`**
   - Historique d'humeur utilisateur
   - Lien avec films regardés
   - Intensité 1-10

### **Calendrier**
10. **`release_events`** ⭐ IMPORTANT
    - Sorties de films (theatrical, streaming, dvd)
    - Par région (FR, US, etc.)

11. **`user_calendar_events`**
    - Événements personnels
    - Rappels

12. **`shared_events`**
    - Événements partagés (aller voir un film ensemble)
    - Statut (confirmed, tentative, cancelled)

### **Notifications**
13. **`notification_preferences`**
    - Préférences email/push
    - Types de notifications
    - Heures silencieuses

---

## 🚀 Installation

### Étape 1 : Exécuter le script

```sql
-- Dans Supabase SQL Editor
-- Copiez le contenu de add_missing_tables.sql
-- Cliquez sur Run
```

### Étape 2 : Vérifier

```sql
-- Vérifier que les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Étape 3 : Tester

```sql
-- Créer une préférence de thème
INSERT INTO user_preferences (user_id, theme)
VALUES (auth.uid(), 'neon');

-- Ajouter un ami
INSERT INTO friendships (user_id, friend_id, status)
VALUES (auth.uid(), 'uuid-ami', 'pending');
```

---

## 🎨 Nouvelles Fonctionnalités Disponibles

### 1. Thèmes Personnalisables
```typescript
// Récupérer le thème utilisateur
const { data } = await supabase
  .from('user_preferences')
  .select('theme')
  .single();
```

### 2. Système d'Amis
```typescript
// Envoyer demande d'ami
await supabase.from('friendships').insert({
  user_id: currentUserId,
  friend_id: friendId,
  status: 'pending'
});
```

### 3. Watch Parties Collaboratives
```typescript
// Créer une liste collaborative
const { data: list } = await supabase
  .from('collaborative_lists')
  .insert({
    name: 'Soirée Film',
    creator_id: userId,
    voting_enabled: true
  })
  .select()
  .single();

// Inviter des amis
await supabase.from('list_members').insert([
  { list_id: list.id, user_id: friend1Id, role: 'editor' },
  { list_id: list.id, user_id: friend2Id, role: 'viewer' }
]);
```

### 4. Recommandations par Humeur
```typescript
// Chercher films selon émotion
const { data } = await supabase
  .from('movie_emotions')
  .select('media_id, media_type')
  .eq('emotion_type', 'joy')
  .gte('intensity', 0.7);
```

### 5. Calendrier de Sorties
```typescript
// Sorties à venir
const { data } = await supabase
  .from('release_events')
  .select('*')
  .eq('region', 'FR')
  .gte('release_date', new Date())
  .order('release_date');
```

---

## ⚡ Impact des Nouvelles Tables

### Fonctionnalités Activées
✅ **Thèmes** : 5 thèmes personnalisables  
✅ **Amis** : Système complet d'amitié  
✅ **Social** : Recommandations entre amis  
✅ **Collaboratif** : Listes partagées avec votes  
✅ **Émotions** : Recommandations par humeur  
✅ **Calendrier** : Ne manquez aucune sortie  
✅ **Notifications** : Préférences personnalisées  

### Pages à Créer
- `/settings` - Gérer thème et préférences
- `/friends` - Liste d'amis
- `/parties` - Listes collaboratives
- `/calendar` - Calendrier de sorties
- `/mood` - Recommandations par humeur

---

## 🔧 Maintenance

### Nettoyage des anciennes suggestions
```sql
DELETE FROM list_suggestions
WHERE status = 'rejected'
  AND created_at < NOW() - INTERVAL '30 days';
```

### Recalculer la compatibilité
```sql
-- À faire via un script backend
-- Comparer les ratings entre utilisateurs
```

---

## 📊 Statistiques Après Ajout

**Avant** : 17 tables  
**Après** : 30 tables  
**+** 13 nouvelles fonctionnalités majeures  

---

## ✅ Checklist

- [ ] Exécuter `add_missing_tables.sql`
- [ ] Vérifier que les 13 tables sont créées
- [ ] Tester RLS (essayer d'insérer une préférence)
- [ ] Créer les pages frontend correspondantes
- [ ] Implémenter les hooks React pour ces tables

---

## 🎉 Résultat

Votre base ReelVibe sera **complète** avec :
- ✅ Système de thèmes
- ✅ Réseau social complet
- ✅ Watch parties collaboratives
- ✅ Analyse émotionnelle
- ✅ Calendrier intelligent
- ✅ Notifications personnalisées

**Prêt pour toutes les fonctionnalités avancées ! 🚀**
