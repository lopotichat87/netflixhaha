# Correction Erreur Suspense - Next.js 15

## Problème
Next.js 15 requiert que `useSearchParams()` soit enveloppé dans une boundary `<Suspense>`.

Erreur :
```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/activity"
```

## Pages corrigées

### ✅ `/activity` - Corrigé
- Créé composant `ActivityContent` avec `useSearchParams()`
- Enveloppé dans `<Suspense>` avec fallback spinner

### ✅ `/movies` - Corrigé
- Créé composant `MoviesContent` avec `useSearchParams()`
- Enveloppé dans `<Suspense>` avec fallback spinner

### ✅ `/browse/series` - Corrigé
- Créé composant `SeriesContent` avec `useSearchParams()`
- Enveloppé dans `<Suspense>` avec fallback spinner

### ✅ `/recherche` - Déjà correct
- Déjà configuré avec `SearchContent` + `<Suspense>`

### ✅ `/auth/login` - Déjà correct
- Déjà configuré avec `LoginForm` + `<Suspense>`

## Pattern utilisé

```tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PageContent() {
  const searchParams = useSearchParams(); // ✅ OK dans un composant enfant
  // ... reste du code
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin ..."></div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
```

## Résultat
✅ Toutes les pages avec `useSearchParams()` sont maintenant compatibles Next.js 15
✅ Le build ne devrait plus échouer sur ces erreurs
✅ Les fallbacks fournissent une expérience de chargement cohérente
