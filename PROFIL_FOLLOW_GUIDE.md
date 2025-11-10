# Guide : Système de Follow et Édition de Profil 🎯

## Ce qui a été créé

### 1. Table Friendships (Base de données)
**Fichier** : `create-friendships-table.sql`

**Exécuter dans Supabase** :
```sql
-- Crée la table friendships pour gérer les relations follow
-- Avec RLS pour la sécurité
-- Index pour les performances
```

**Caractéristiques** :
- ✅ Un utilisateur peut suivre plusieurs personnes
- ✅ Un utilisateur ne peut pas se suivre lui-même
- ✅ Une relation unique par paire d'utilisateurs
- ✅ RLS activé (tout le monde peut voir, seul l'owner peut modifier)

### 2. Modal d'Édition de Profil
**Fichier** : `components/EditProfileModal.tsx`

**Fonctionnalités** :
- ✅ Modification du nom d'utilisateur
- ✅ Modification de la bio (200 caractères max)
- ✅ Modification de la bannière (URL)
- ✅ Validation en temps réel
- ✅ Aperçu de la bannière
- ✅ Messages d'erreur clairs
- ✅ Animation d'enregistrement
- ✅ Vérification que le username n'est pas déjà pris

**Validations** :
- Nom d'utilisateur : 3-20 caractères, alphanumériques + underscore uniquement
- Bio : 200 caractères max
- Bannière : URL valide

### 3. Page Profil Améliorée
**Fichier** : `app/profile/[username]/page.tsx`

**Ajouts** :
- ✅ Bouton "Modifier" pour le propriétaire
- ✅ Bouton "Suivre / Ne plus suivre" pour les visiteurs
- ✅ Icônes UserPlus / UserMinus dynamiques
- ✅ Compteurs Followers / Following en temps réel
- ✅ État de chargement sur les boutons
- ✅ Gestion d'erreur avec alertes
- ✅ Redirection vers login si non connecté

## Comment utiliser

### Pour l'utilisateur (Modifier son profil) :

1. Aller sur son propre profil (`/profile/[votre-username]`)
2. Cliquer sur le bouton "Modifier" à côté du nom
3. Modifier les champs souhaités :
   - **Username** : Nom d'utilisateur unique
   - **Bio** : Description personnelle
   - **Bannière** : URL d'une image
4. Cliquer sur "Enregistrer"
5. Le profil se met à jour automatiquement !

### Pour suivre quelqu'un :

1. Visiter le profil d'un autre utilisateur
2. Cliquer sur "Suivre" (bouton gradient purple/pink)
3. Le bouton devient "Ne plus suivre" (gris)
4. Les compteurs se mettent à jour instantanément

### Pour ne plus suivre :

1. Cliquer sur "Ne plus suivre"
2. Le bouton redevient "Suivre"
3. Les compteurs se décrémentent

## États du bouton Follow

| État | Apparence | Icône | Action |
|------|-----------|-------|--------|
| **Non suivi** | Gradient purple/pink | UserPlus | → Suivre |
| **Suivi** | Gris transparent | UserMinus | → Ne plus suivre |
| **Loading** | Spinner | - | Attend... |
| **Non connecté** | Gradient purple/pink | UserPlus | → Redirect login |

## Sécurité

### Base de données (RLS Supabase) :
- ✅ Lecture publique (pour compter followers)
- ✅ Insertion réservée à l'owner
- ✅ Suppression réservée à l'owner
- ✅ Impossible de se suivre soi-même (CHECK constraint)
- ✅ Relation unique (UNIQUE constraint)

### Frontend :
- ✅ Vérification du username avant sauvegarde
- ✅ Validation des caractères autorisés
- ✅ Messages d'erreur explicites
- ✅ Désactivation des boutons pendant le chargement
- ✅ Gestion des cas non connectés

## Checklist d'installation

- [ ] Exécuter `create-friendships-table.sql` dans Supabase
- [ ] Vérifier que la colonne `updated_at` existe dans la table `profiles`
- [ ] Tester la création/modification de profil
- [ ] Tester le système de follow/unfollow
- [ ] Vérifier les compteurs en temps réel
- [ ] Tester avec un utilisateur non connecté

## Problèmes courants

### "username already taken"
→ Le nom d'utilisateur est déjà pris par un autre utilisateur

### "Error toggling follow"
→ Vérifier que la table `friendships` existe et que les RLS sont configurées

### Modal ne s'ouvre pas
→ Vérifier que `EditProfileModal` est bien importé

### Bouton Follow ne marche pas
→ Vérifier que l'utilisateur est connecté (sinon redirect vers login)

## Prochaines améliorations possibles

- [ ] Avatar personnalisé (upload d'image)
- [ ] Système de demande de suivi (pending/accepted)
- [ ] Notif
