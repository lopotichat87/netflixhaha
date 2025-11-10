# 📊 Guide de Vérification des Statistiques Dynamiques

## Tables Utilisées pour les Stats

### 1. **Followers / Following** 
Table : `friendships`
```sql
SELECT 
  (SELECT COUNT(*) FROM friendships WHERE friend_id = 'USER_ID' AND status = 'accepted') as followers,
  (SELECT COUNT(*) FROM friendships WHERE user_id = 'USER_ID' AND status = 'accepted') as following;
```

### 2. **Films Vus**
Table : `ratings`
```sql
SELECT COUNT(*) as films_vus 
FROM ratings 
WHERE user_id = 'USER_ID' AND is_watched = true;
```

### 3. **Notes / Critiques**
Tables : `ratings` et `reviews`
```sql
-- Depuis ratings
SELECT COUNT(*) as notes_ratings 
FROM ratings 
WHERE user_id = 'USER_ID' AND rating IS NOT NULL AND rating > 0;

-- Depuis reviews (critiques détaillées)
SELECT COUNT(*) as critiques 
FROM reviews 
WHERE user_id = 'USER_ID';

-- Le profil affiche le max des deux
```

### 4. **Likes / Favoris**
Tables : `ratings` et `favorites`
```sql
-- Depuis ratings
SELECT COUNT(*) as likes_ratings 
FROM ratings 
WHERE user_id = 'USER_ID' AND is_liked = true;

-- Depuis favorites
SELECT COUNT(*) as favoris 
FROM favorites 
WHERE user_id = 'USER_ID';

-- Le profil affiche le max des deux
```

### 5. **Listes**
Table : `user_lists`
```sql
SELECT COUNT(*) as listes 
FROM user_lists 
WHERE user_id = 'USER_ID';
```

## Comment Tester ?

### 1. Vérifier les données dans Supabase

Ouvrez Supabase Dashboard → Table Editor :

**a) Vérifier `ratings`**
```sql
SELECT * FROM ratings WHERE user_id = 'VOTRE_USER_ID' LIMIT 10;
```

**b) Vérifier `favorites`**
```sql
SELECT * FROM favorites WHERE user_id = 'VOTRE_USER_ID' LIMIT 10;
```

**c) Vérifier `reviews`**
```sql
SELECT * FROM reviews WHERE user_id = 'VOTRE_USER_ID' LIMIT 10;
```

**d) Vérifier `friendships`**
```sql
SELECT * FROM friendships WHERE user_id = 'VOTRE_USER_ID' OR friend_id = 'VOTRE_USER_ID' LIMIT 10;
```

### 2. Voir les logs dans la console

Ouvrez la console du navigateur (F12) et rechargez le profil. Vous verrez :
```javascript
Profile stats: {
  watchedCount: X,
  ratedFromRatings: Y,
  reviewsCount: Z,
  likedFromRatings: A,
  favoritesCount: B,
  listsCount: C,
  finalStats: { watched: X, rated: max(Y,Z), liked: max(A,B), lists: C }
}
```

### 3. Actions qui créent des données

Pour voir les stats augmenter :

**Films vus** → Cliquez sur l'icône "œil" sur une page film
**Notes** → Notez un film avec 1-5 étoiles  
**Critiques** → Laissez un commentaire avec note sur une page film
**Likes** → Cliquez sur le cœur d'un film
**Followers** → Un autre utilisateur vous suit
**Following** → Vous suivez un autre utilisateur

## Statistiques Visuelles

Les stats ont maintenant :
- ✅ **Backgrounds colorés** pour chaque type
- ✅ **Animations hover** (scale 1.05)
- ✅ **Responsive** (flex-wrap)
- ✅ **Couleurs distinctes** :
  - 🟣 Purple : Films vus
  - 🩷 Pink : Notes
  - 🩵 Cyan : Likes
  - 🟡 Yellow : Listes
  - ⚪ White : Followers/Following

## Troubleshooting

### Les stats sont à 0 ?

1. **Vérifiez que vous êtes connecté**
```javascript
// Dans la console
localStorage.getItem('supabase.auth.token')
```

2. **Vérifiez votre user_id**
```sql
SELECT * FROM auth.users WHERE email = 'VOTRE_EMAIL';
```

3. **Vérifiez que les tables existent**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ratings', 'favorites', 'reviews', 'friendships', 'user_lists');
```

4. **Vérifiez les permissions RLS**
```sql
SELECT * FROM pg_policies WHERE tablename IN ('ratings', 'favorites', 'reviews', 'friendships', 'user_lists');
```

### Comment ajouter des données de test ?

```sql
-- Ajouter un film vu
INSERT INTO ratings (user_id, media_id, media_type, is_watched, media_title, media_poster)
VALUES ('VOTRE_USER_ID', 550, 'movie', true, 'Fight Club', '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');

-- Ajouter un like
INSERT INTO favorites (user_id, media_id, media_type)
VALUES ('VOTRE_USER_ID', 550, 'movie');

-- Ajouter une critique
INSERT INTO reviews (user_id, media_id, media_type, rating, comment)
VALUES ('VOTRE_USER_ID', 550, 'movie', 5, 'Film incroyable !');
```

## Résumé des Changements

✅ **Followers** : Chargé depuis `friendships` (dynamique)
✅ **Following** : Chargé depuis `friendships` (dynamique)
✅ **Films vus** : Calculé depuis `ratings.is_watched` (dynamique)
✅ **Notes** : Max entre `ratings` avec rating et `reviews` (dynamique)
✅ **Likes** : Max entre `ratings.is_liked` et `favorites` (dynamique)
✅ **Listes** : Chargé depuis `user_lists` (dynamique)

Toutes les stats sont maintenant **100% dynamiques** ! 🎉
