/**
 * Script pour remplir les métadonnées manquantes (title, poster_path) 
 * des favoris existants en utilisant l'API TMDB
 * 
 * Exécuter avec: npx tsx scripts/backfill-favorites-metadata.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Favorite {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string | null;
  poster_path: string | null;
}

async function fetchMediaDetails(mediaId: number, mediaType: 'movie' | 'tv') {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      title: data.title || data.name || 'Sans titre',
      poster_path: data.poster_path || null,
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de ${mediaType}/${mediaId}:`, error);
    return null;
  }
}

async function backfillFavoritesMetadata() {
  console.log('🚀 Début du backfill des métadonnées favorites...\n');

  // Récupérer tous les favoris sans title ou poster_path
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('id, media_id, media_type, title, poster_path')
    .or('title.is.null,poster_path.is.null');

  if (error) {
    console.error('❌ Erreur lors de la récupération des favoris:', error);
    return;
  }

  if (!favorites || favorites.length === 0) {
    console.log('✅ Tous les favoris ont déjà leurs métadonnées !');
    return;
  }

  console.log(`📊 ${favorites.length} favoris nécessitent des métadonnées\n`);

  let updated = 0;
  let failed = 0;

  // Traiter par lots de 5 pour éviter de surcharger l'API TMDB
  for (let i = 0; i < favorites.length; i += 5) {
    const batch = favorites.slice(i, i + 5);
    
    await Promise.all(
      batch.map(async (favorite: Favorite) => {
        // Attendre un peu entre les requêtes pour respecter les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 250));
        
        const details = await fetchMediaDetails(favorite.media_id, favorite.media_type);
        
        if (details) {
          const { error: updateError } = await supabase
            .from('favorites')
            .update({
              title: details.title,
              poster_path: details.poster_path,
            })
            .eq('id', favorite.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour ${favorite.id}:`, updateError);
            failed++;
          } else {
            updated++;
            console.log(`✅ Mis à jour: ${details.title}`);
          }
        } else {
          failed++;
        }
      })
    );
  }

  console.log('\n📊 Résumé:');
  console.log(`   ✅ ${updated} favoris mis à jour`);
  console.log(`   ❌ ${failed} échecs`);
  console.log('\n✨ Backfill terminé !');
}

// Exécuter le script
backfillFavoritesMetadata().catch(console.error);
