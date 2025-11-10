import { parseAvatar } from '@/lib/avatar';

interface AvatarProps {
  avatarUrl: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-24 h-24 text-5xl',
  '2xl': 'w-32 h-32 text-6xl'
};

export default function Avatar({ avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const avatar = parseAvatar(avatarUrl);
  const sizeClass = sizeClasses[size];

  if (avatar.isImage && avatar.imageUrl) {
    return (
      <img
        src={avatar.imageUrl}
        alt="Avatar"
        className={`${sizeClass} rounded-full object-cover border-2 border-white/20 ${className}`}
      />
    );
  }

  return (
    <div className={`${avatar.color} ${sizeClass} rounded-full flex items-center justify-center ${className}`}>
      {avatar.emoji}
    </div>
  );
}
