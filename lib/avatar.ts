// Helper pour gérer l'affichage des avatars (emoji ou image uploadée)

export interface AvatarData {
  isImage: boolean;
  emoji?: string;
  color?: string;
  imageUrl?: string;
}

export function parseAvatar(avatarUrl: string | null | undefined): AvatarData {
  if (!avatarUrl) {
    return {
      isImage: false,
      emoji: '👤',
      color: 'bg-gray-600'
    };
  }

  // Trim l'URL
  const trimmedUrl = avatarUrl.trim();

  // Si l'URL contient http ou https, ou supabase, c'est une image uploadée
  if (trimmedUrl.startsWith('http://') || 
      trimmedUrl.startsWith('https://') || 
      trimmedUrl.includes('supabase.co')) {
    console.log('🖼️ Avatar détecté comme image:', trimmedUrl);
    return {
      isImage: true,
      imageUrl: trimmedUrl
    };
  }

  // Sinon c'est un emoji avec format "emoji|color"
  const parts = trimmedUrl.split('|');
  console.log('😀 Avatar détecté comme emoji:', parts[0]);
  return {
    isImage: false,
    emoji: parts[0] || '👤',
    color: parts[1] || 'bg-gray-600'
  };
}
