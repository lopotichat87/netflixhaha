# 🎨 Phase 1 : Système de Thèmes - Guide Complet

## ✅ Fichiers Créés

### 1. **`lib/theme.ts`** - Configuration des thèmes
Contient 5 thèmes complets avec couleurs et gradients

### 2. **`contexts/ThemeContext.tsx`** - Context React
Gestion globale du thème actif

### 3. **`components/ThemeSelector.tsx`** - Sélecteur UI
Interface pour choisir le thème

---

## 🚀 Intégration dans l'Application

### Étape 1 : Wrapper l'app avec ThemeProvider

Modifiez `app/layout.tsx` :

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Étape 2 : Ajouter ThemeSelector dans les paramètres

Créez ou modifiez `app/settings/page.tsx` :

```tsx
import ThemeSelector from '@/components/ThemeSelector';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-24">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}
```

### Étape 3 : Adapter les composants existants

Utilisez les variables CSS dans vos composants :

```tsx
// Au lieu de classes hardcodées
<div className="bg-red-600">Button</div>

// Utilisez les variables CSS
<div className="bg-[var(--color-primary)]">Button</div>

// Ou créez des classes utilitaires dans tailwind.config.js
```

---

## 🎨 Les 5 Thèmes Disponibles

### 1. **ReelVibe** (Défaut)
```
Primaire: #8B5CF6 (Violet)
Secondaire: #06B6D4 (Cyan)
Accent: #EC4899 (Rose)
Background: #0A0A0A
```
**Ambiance** : Moderne, créatif, technologique

### 2. **Dark** (Netflix Classic)
```
Primaire: #E50914 (Rouge)
Secondaire: #B20710
Accent: #FFD700 (Or)
Background: #141414
```
**Ambiance** : Classique, cinéma, intensité

### 3. **Cinema** (Vintage)
```
Primaire: #D4AF37 (Or ancien)
Secondaire: #8B7355 (Bronze)
Accent: #CD5C5C (Rouge indien)
Background: #1C1C1C
```
**Ambiance** : Élégant, rétro, salle de cinéma

### 4. **Neon** (Cyberpunk)
```
Primaire: #00FFF0 (Cyan néon)
Secondaire: #FF006E (Rose néon)
Accent: #FFBE0B (Jaune néon)
Background: #000000
```
**Ambiance** : Futuriste, vibrant, tech

### 5. **Vintage** (Sépia)
```
Primaire: #8B4513 (Brun)
Secondaire: #D2691E (Chocolat)
Accent: #CD853F (Peru)
Background: #FFF8DC (Beige clair)
```
**Ambiance** : Rétro, chaleureux, nostalgie

---

## 💾 Persistance des Préférences

### LocalStorage (Actuel)
```typescript
localStorage.setItem('reelvibe-theme', themeName);
```

### Supabase (À implémenter)

Créez la table :
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  theme VARCHAR(50) DEFAULT 'reelvibe',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Modifiez `ThemeContext.tsx` :
```typescript
useEffect(() => {
  if (user) {
    // Charger depuis Supabase
    loadUserTheme(user.id).then(setCurrentTheme);
  }
}, [user]);

const setTheme = async (themeName: string) => {
  setCurrentTheme(themeName);
  if (user) {
    // Sauvegarder dans Supabase
    await saveUserTheme(user.id, themeName);
  }
};
```

---

## 🎯 Utilisation dans les Composants

### Avec useTheme Hook
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  return (
    <div>
      <p>Thème actuel: {currentTheme}</p>
      <button onClick={() => setTheme('neon')}>
        Neon
      </button>
    </div>
  );
}
```

### Avec CSS Variables
```tsx
<div 
  className="p-4 rounded-lg"
  style={{
    backgroundColor: 'var(--color-card)',
    borderColor: 'var(--color-border)',
    background: 'var(--gradient-card)'
  }}
>
  Content
</div>
```

### Avec TailwindCSS
Ajoutez dans `tailwind.config.js` :
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-primary)',
        'theme-secondary': 'var(--color-secondary)',
        'theme-accent': 'var(--color-accent)',
      },
      backgroundImage: {
        'theme-hero': 'var(--gradient-hero)',
        'theme-button': 'var(--gradient-button)',
      }
    }
  }
}
```

Utilisez :
```tsx
<button className="bg-theme-primary text-white">
  Button
</button>
```

---

## ✨ Transitions Smooth

Ajoutez dans `globals.css` :
```css
:root {
  transition: all 0.3s ease-in-out;
}

* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
```

---

## 📱 Responsive & Accessibilité

### Preview Mobile
Le `ThemeSelector` s'adapte automatiquement :
- Desktop : 3 colonnes
- Tablet : 2 colonnes
- Mobile : 1 colonne

### Accessibilité
```tsx
<button
  onClick={() => setTheme(theme.name)}
  aria-label={`Choisir le thème ${theme.displayName}`}
  aria-pressed={currentTheme === theme.name}
>
  {/* Contenu */}
</button>
```

---

## 🎨 Personnalisation Avancée

### Créer un Nouveau Thème

Dans `lib/theme.ts`, ajoutez :
```typescript
export const themes: Record<string, Theme> = {
  // ... thèmes existants
  
  myTheme: {
    name: 'myTheme',
    displayName: 'Mon Thème',
    colors: {
      primary: '#YOUR_COLOR',
      secondary: '#YOUR_COLOR',
      accent: '#YOUR_COLOR',
      background: '#YOUR_COLOR',
      foreground: '#YOUR_COLOR',
      muted: '#YOUR_COLOR',
      border: '#YOUR_COLOR',
      card: '#YOUR_COLOR',
      cardHover: '#YOUR_COLOR',
    },
    gradients: {
      hero: 'linear-gradient(...)',
      card: 'linear-gradient(...)',
      button: 'linear-gradient(...)',
    },
  },
};
```

### Thème Personnalisé Utilisateur

Permettre aux utilisateurs de créer leur propre thème :
```tsx
interface CustomTheme extends Theme {
  isCustom: true;
  userId: string;
}
```

---

## 🚀 Prochaines Améliorations

### Prévisualisation Temps Réel
```tsx
<ThemePreview theme={theme}>
  <MovieCard media={exampleMovie} />
  <Button>Example</Button>
</ThemePreview>
```

### Animation de Transition
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentTheme}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Thème Automatique (Jour/Nuit)
```typescript
useEffect(() => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    // Thème jour
    setTheme('vintage');
  } else {
    // Thème nuit
    setTheme('reelvibe');
  }
}, []);
```

---

## ✅ Checklist d'Intégration

- [ ] Ajouter `ThemeProvider` dans `layout.tsx`
- [ ] Créer page `/settings` avec `ThemeSelector`
- [ ] Tester tous les thèmes
- [ ] Adapter les composants principaux aux variables CSS
- [ ] Ajouter transitions smooth dans `globals.css`
- [ ] Tester la persistance (localStorage)
- [ ] Intégrer avec Supabase (user_preferences)
- [ ] Tester responsive mobile
- [ ] Ajouter tests unitaires

---

## 🎉 Résultat Final

Les utilisateurs peuvent maintenant :
- ✅ Choisir parmi 5 thèmes uniques
- ✅ Prévisualiser avant de choisir
- ✅ Sauvegarder leur préférence
- ✅ Changer instantanément avec transitions smooth
- ✅ Personnaliser leur expérience ReelVibe

**La Phase 1 est prête ! Passons à la Phase 2 : Analyse Émotionnelle ? 😊**
