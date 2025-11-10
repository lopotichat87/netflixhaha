// EXEMPLES D'UTILISATION DU SYSTÈME DE SÉCURITÉ

// ============================================================================
// EXEMPLE 1: Protéger une page entière (Mes Likes)
// ============================================================================
// app/likes/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LikesPage() {
  return (
    <ProtectedRoute showLockScreen={true}>
      <div>
        <h1>Mes Likes</h1>
        {/* Contenu réservé aux utilisateurs connectés */}
      </div>
    </ProtectedRoute>
  );
}

// ============================================================================
// EXEMPLE 2: Protéger une action (Bouton Like)
// ============================================================================
// components/LikeButton.tsx
'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Heart } from 'lucide-react';
import AuthRequired from '@/components/AuthRequired';

export default function LikeButton({ movieId }: { movieId: number }) {
  const { isAuthenticated, withAuth } = useAuthGuard();

  const handleLike = async () => {
    // Cette fonction ne s'exécutera que si authentifié
    await fetch(`/api/like/${movieId}`, { method: 'POST' });
  };

  return (
    <AuthRequired action="liker ce film">
      <button 
        onClick={withAuth(handleLike)}
        className="px-4 py-2 bg-pink-600 rounded-lg"
      >
        <Heart className={isAuthenticated ? 'fill-current' : ''} />
      </button>
    </AuthRequired>
  );
}

// ============================================================================
// EXEMPLE 3: Page Profil avec Édition Conditionnelle
// ============================================================================
// app/profile/[username]/page.tsx
'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Edit } from 'lucide-react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user, isOwner } = useAuthGuard();
  
  // Supposons qu'on récupère le profil
  const profileUserId = 'user-id-from-db';
  const isOwnProfile = isOwner(profileUserId);

  return (
    <div>
      <h1>Profil de {params.username}</h1>
      
      {/* Bouton édition visible uniquement pour le propriétaire */}
      {isOwnProfile && (
        <button>
          <Edit size={20} />
          Modifier mon profil
        </button>
      )}
      
      {/* Contenu public visible par tous */}
      <div>Statistiques publiques...</div>
    </div>
  );
}

// ============================================================================
// EXEMPLE 4: Formulaire Commentaire avec Vérification
// ============================================================================
// components/CommentForm.tsx
'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function CommentForm({ mediaId }: { mediaId: number }) {
  const { user, isAuthenticated } = useAuthGuard();
  const [comment, setComment] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
        <Lock size={48} className="mx-auto mb-4 text-purple-400" />
        <h3 className="text-xl font-bold mb-2">Connexion requise</h3>
        <p className="text-gray-400 mb-4">
          Connectez-vous pour laisser un commentaire
        </p>
        <Link href="/auth/login">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold flex items-center gap-2 mx-auto">
            <LogIn size={20} />
            Se connecter
          </button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Soumettre le commentaire
    await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ mediaId, comment, userId: user?.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre commentaire..."
        className="w-full p-4 bg-gray-900 rounded-lg"
        rows={4}
      />
      <button 
        type="submit"
        className="px-6 py-3 bg-purple-600 rounded-lg"
      >
        Publier
      </button>
    </form>
  );
}

// ============================================================================
// EXEMPLE 5: Page de Connexion avec Redirect si Déjà Connecté
// ============================================================================
// app/auth/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Rediriger vers la page d'accueil si déjà connecté
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (isAuthenticated) {
    return null; // En cours de redirection
  }

  return (
    <div>
      <h1>Connexion</h1>
      {/* Formulaire de connexion */}
    </div>
  );
}

// ============================================================================
// EXEMPLE 6: Action Follow/Unfollow avec Vérification
// ============================================================================
// components/FollowButton.tsx
'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthRequired from '@/components/AuthRequired';
import { UserPlus, UserMinus } from 'lucide-react';

export default function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user, withAuth } = useAuthGuard();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    // Cette fonction ne s'exécutera que si authentifié
    setIsFollowing(!isFollowing);
    await fetch('/api/follow', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, action: isFollowing ? 'unfollow' : 'follow' })
    });
  };

  // Ne pas afficher si c'est son propre profil
  if (user?.id === targetUserId) {
    return null;
  }

  return (
    <AuthRequired action="suivre cet utilisateur">
      <button
        onClick={withAuth(handleFollow)}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          isFollowing 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isFollowing ? (
          <>
            <UserMinus size={16} className="inline mr-2" />
            Ne plus suivre
          </>
        ) : (
          <>
            <UserPlus size={16} className="inline mr-2" />
            Suivre
          </>
        )}
      </button>
    </AuthRequired>
  );
}

// ============================================================================
// EXEMPLE 7: Bouton Ajouter à une Liste
// ============================================================================
// components/AddToListButton.tsx
'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthRequired from '@/components/AuthRequired';
import { Plus } from 'lucide-react';

export default function AddToListButton({ mediaId, mediaType }: { 
  mediaId: number; 
  mediaType: 'movie' | 'tv';
}) {
  const { withAuth } = useAuthGuard();
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <AuthRequired action="ajouter à une liste">
        <button
          onClick={withAuth(handleOpenModal)}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} className="inline mr-2" />
          Ajouter à une liste
        </button>
      </AuthRequired>

      {showModal && (
        <div>Modal de sélection de liste...</div>
      )}
    </>
  );
}

// ============================================================================
// EXEMPLE 8: Page Paramètres avec Vérification Owner
// ============================================================================
// app/profile/[username]/edit/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';

export default function EditProfilePage({ params }: { params: { username: string } }) {
  const { user, loading, requireOwnership } = useAuthGuard();
  const router = useRouter();

  // Supposons qu'on récupère l'ID du profil depuis la BDD
  const profileUserId = 'profile-user-id'; // À remplacer par vraie requête

  useEffect(() => {
    if (!loading) {
      // Vérifier que l'utilisateur est bien le propriétaire
      const canEdit = requireOwnership(profileUserId, `/profile/${params.username}`);
      if (!canEdit) {
        alert('Vous ne pouvez modifier que votre propre profil');
      }
    }
  }, [loading, profileUserId, params.username, requireOwnership]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (user?.id !== profileUserId) {
    return null; // En cours de redirection
  }

  return (
    <div>
      <h1>Modifier mon profil</h1>
      {/* Formulaire d'édition */}
    </div>
  );
}
