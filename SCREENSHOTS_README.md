# Guide des Screenshots pour la Landing Page

## Structure des Screenshots

Créez un dossier `public/screenshots/` avec les images suivantes :

```
public/
└── screenshots/
    ├── catalog.png      (Catalogue de films)
    ├── rating.png       (Système de notation)
    ├── lists.png        (Gestion des listes)
    └── stats.png        (Statistiques)
```

## Comment Créer les Screenshots

### 1. Prendre les Screenshots

**Catalogue (catalog.png)** :
- Allez sur `/movies` ou `/tv-shows`
- Prenez une capture d'écran montrant la grille de films/séries
- Dimensions recommandées : 1920x1080

**Notation (rating.png)** :
- Ouvrez une page de film `/movie/[id]`
- Cliquez sur le bouton "Noter"
- Prenez une capture du modal de notation ouvert
- Ou capturez la section des critiques avec plusieurs avis
- Dimensions recommandées : 1920x1080

**Listes (lists.png)** :
- Allez sur `/my-lists`
- Capturez vos listes avec des films dedans
- Ou capturez le profil montrant les listes d'un utilisateur
- Dimensions recommandées : 1920x1080

**Statistiques (stats.png)** :
- Allez sur votre profil `/profile/[username]`
- Capturez l'onglet "Stats" avec les graphiques
- Ou capturez la section "Activité" 
- Dimensions recommandées : 1920x1080

### 2. Optimiser les Images

```bash
# Si vous avez ImageMagick installé
cd public/screenshots

# Redimensionner si nécessaire (largeur 1920px)
convert catalog.png -resize 1920x catalog.png

# Optimiser la taille
convert catalog.png -quality 85 -strip catalog.png

# Pour PNG, utilisez pngcrush
pngcrush -brute -rem allb -reduce catalog.png catalog-optimized.png
```

### 3. Utiliser un Service d'Optimisation en Ligne

Si vous n'avez pas ImageMagick :
- https://tinypng.com/
- https://squoosh.app/
- https://compressor.io/

Uploadez vos screenshots et téléchargez les versions optimisées.

## Alternative : Screenshots depuis votre navigateur

### Méthode 1 : Chrome DevTools

1. Ouvrez Chrome DevTools (F12)
2. `Cmd/Ctrl + Shift + P`
3. Tapez "Capture full size screenshot"
4. Sauvegardez dans `public/screenshots/`

### Méthode 2 : Extensions

**Chrome/Edge** :
- GoFullPage
- Awesome Screenshot

**Firefox** :
- Fireshot

## Placeholder Automatique

Si les images n'existent pas, le composant affiche automatiquement un placeholder avec :
- Un fond gradient
- Une icône 🎬
- Le texte "Aperçu de l'application"

## Animations Incluses

Les screenshots ont automatiquement :
- ✅ Animation d'apparition au scroll
- ✅ Effet hover avec zoom léger
- ✅ Barre de navigateur Chrome simulée
- ✅ Effet de glow au survol
- ✅ Bordures stylisées

## Conseils pour de Bonnes Captures

1. **Mode sombre activé** : Assurez-vous que l'app est en dark mode
2. **Données réalistes** : Remplissez avec de vrais films et données
3. **Résolution élevée** : 1920x1080 minimum pour la qualité
4. **Pas de données sensibles** : Évitez les vraies informations utilisateur
5. **Contenu varié** : Montrez différents genres, notes, etc.

## Test du Rendu

Pour tester vos screenshots :

1. Placez les images dans `public/screenshots/`
2. Allez sur `/landing`
3. Scrollez jusqu'aux sections showcase
4. Vérifiez que les images s'affichent correctement
5. Testez le hover et les animations

## Dépannage

**Image ne s'affiche pas** :
- Vérifiez le chemin : `public/screenshots/catalog.png`
- Vérifiez les permissions du fichier
- Vérifiez l'extension (png, jpg, jpeg)
- Rafraîchissez avec `Cmd/Ctrl + Shift + R`

**Image pixelisée** :
- Utilisez une résolution plus élevée
- Optimisez avec quality 85-90 au lieu de 60

**Image trop lourde** :
- Compressez avec TinyPNG
- Convertissez en WebP pour meilleur ratio

## Format WebP (Recommandé)

Pour de meilleures performances :

```bash
# Convertir PNG en WebP
cwebp -q 85 catalog.png -o catalog.webp

# Ensuite dans le code, changez :
imageSrc="/screenshots/catalog.webp"
```

## Exemples de Bonnes Captures

### Catalogue
- Grille de 20-30 films visibles
- Filtres en haut
- Navbar visible
- Variété de genres

### Notation
- Modal de notation ouvert
- Film en arrière-plan
- Étoiles bien visibles
- Interface claire

### Listes
- 2-3 listes affichées
- Films dans les listes
- Boutons d'action visibles
- Noms de listes clairs

### Stats
- Graphiques de l'année
- Compteurs de films vus
- Activité récente
- Distribution par genre
