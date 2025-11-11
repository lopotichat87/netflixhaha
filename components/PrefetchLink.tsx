'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

/**
 * Composant Link optimisé avec prefetch automatique au hover
 * pour une navigation ultra-rapide
 */
export default function PrefetchLink({ 
  href, 
  children, 
  className = '',
  prefetch = true 
}: PrefetchLinkProps) {
  const router = useRouter();

  // Précharger la route au survol
  const handleMouseEnter = () => {
    if (prefetch) {
      router.prefetch(href);
    }
  };

  return (
    <Link 
      href={href} 
      className={className}
      onMouseEnter={handleMouseEnter}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}
