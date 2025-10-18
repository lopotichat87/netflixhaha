# Configuration Supabase pour Netflix Clone

## 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com)
2. Crée un compte ou connecte-toi
3. Clique sur "New Project"
4. Nomme ton projet "netflix-clone"
5. Choisis une région proche de toi
6. Crée un mot de passe fort pour la base de données

## 2. Configurer la base de données

1. Dans le dashboard Supabase, va dans "SQL Editor"
2. Copie tout le contenu du fichier `supabase/schema.sql`
3. Colle-le dans l'éditeur SQL
4. Clique sur "Run" pour exécuter le script

Cela va créer toutes les tables nécessaires :
- `profiles` - Profils utilisateurs
- `favorites` - Ma Liste (favoris)
- `watch_history` - Historique de visionnage
- `watch_parties` - Watch Parties
- `chat_messages` - Messages de chat

## 3. Récupérer les clés API

1. Va dans "Settings" > "API"
2. Copie l'URL du projet (`NEXT_PUBLIC_SUPABASE_URL`)
3. Copie la clé `anon public` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 4. Configurer les variables d'environnement

Ajoute ces lignes dans ton fichier `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Configurer l'authentification

1. Va dans "Authentication" > "Providers"
2. Active "Email" provider
3. Configure les URLs de redirection :
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 6. Tester la configuration

Redémarre ton serveur Next.js et teste :
- Inscription : `/auth/signup`
- Connexion : `/auth/login`

✅ C'est prêt !
