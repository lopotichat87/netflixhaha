# 🔧 Fix: Erreur "Could not find the 'poster_path' column"

## ❌ Problème

Lors de l'ajout d'un film/série à une liste, cette erreur apparaît:
```
Error toggling list: {
  code: '23502', 
  message: "null value in column 'media_title' of relation 'list_items' violates not-null constraint"
}
```

**OU**

```
Error toggling list: {
  code: 'PGRST204', 
  message: "Could not find the 'poster_path' column of 'list_items' in the schema cache"
}
```

## 🔍 Cause

La table `list_items` dans Supabase n'a pas les colonnes `media_title` et `media_poster_path` nécessaires pour stocker les informations des médias.

## ✅ Solution

### Étape 1: Exécuter la migration SQL

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez et exécutez le contenu du fichier `add-poster-title-to-list-items.sql`:

```sql
-- Migration pour ajouter les colonnes manquantes à la table list_items
ALTER TABLE list_items 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS poster_path TEXT;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_media ON list_items(media_id, media_type);

-- Commentaires pour documentation
COMMENT ON COLUMN list_items.title IS 'Titre du film/série pour affichage dans la liste';
COMMENT ON COLUMN list_items.poster_path IS 'Chemin du poster TMDB pour affichage rapide';
```

### Étape 2: Vérifier la migration

Exécutez cette requête pour vérifier que les colonnes ont été ajoutées:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'list_items';
```

Vous devriez voir:
- `id`
- `list_id`
- `media_id`
- `media_type`
- `title` ✅ (nouveau)
- `poster_path` ✅ (nouveau)
- `added_at`

### Étape 3: Tester

1. Rafraîchissez votre application
2. Essayez d'ajouter un film/série à une liste
3. ✅ Ça devrait fonctionner !

## 📊 Structure Finale de list_items

```sql
CREATE TABLE list_items (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES user_lists(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title VARCHAR(255),           -- ✅ Titre du média
  poster_path TEXT,             -- ✅ Chemin du poster TMDB
  rank_order INTEGER,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, media_id, media_type)
);
```

## 🎯 Pourquoi ces colonnes ?

### `title`
Permet d'afficher le nom du film/série dans la liste sans avoir à faire un appel à l'API TMDB à chaque fois.

### `poster_path`
Permet d'afficher le poster directement depuis la base de données, ce qui:
- ⚡ Améliore les performances
- 💾 Réduit les appels API TMDB
- 🎨 Permet l'affichage immédiat des listes

## 🔄 Données Existantes

Si vous avez déjà des items dans vos listes (ajoutés avant cette migration), ils n'auront pas de `title` ni `poster_path`.

**Options:**
1. Les supprimer et les réajouter
2. Créer un script de backfill pour remplir les données manquantes
3. Modifier le code pour gérer les valeurs NULL

## ✅ Après la Migration

L'ajout à une liste fonctionnera correctement et stockera:
```typescript
{
  list_id: "uuid-de-la-liste",
  media_id: 12345,
  media_type: "movie",
  title: "Inception",              // ✅
  poster_path: "/poster.jpg"       // ✅
}
```

## 📝 Fichiers Concernés

- `/lib/lists.ts` - Fonction `addToList()` qui insère ces colonnes
- `/components/AddToListButton.tsx` - Composant qui appelle addToList()
- `add-poster-title-to-list-items.sql` - Migration SQL à exécuter

---

**Note:** Cette erreur se produit car le schéma de la base de données n'était pas synchronisé avec le code de l'application. La migration résout ce problème définitivement.
