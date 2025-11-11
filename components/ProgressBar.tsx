'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 50, // Plus rapide
      minimum: 0.1,
      easing: 'ease',
      speed: 200 // Navigation plus rapide
    });
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
