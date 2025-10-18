'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PinPrompt from './PinPrompt';

interface PinGuardProps {
  children: React.ReactNode;
}

export default function PinGuard({ children }: PinGuardProps) {
  const { user, profile, loading, pinVerified, setPinVerified } = useAuth();
  const router = useRouter();
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user && profile && !loading) {
      // Si le profil a un PIN et qu'il n'est pas vérifié
      if (profile.profile_pin && !pinVerified) {
        setShowPinPrompt(true);
      } else {
        setShowPinPrompt(false);
      }
    } else {
      setShowPinPrompt(false);
    }
  }, [user, profile, pinVerified, loading]);

  const handlePinSubmit = (enteredPin: string) => {
    if (profile && enteredPin === profile.profile_pin) {
      setPinVerified(true);
      setShowPinPrompt(false);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 300);
    }
  };

  const handleCancel = () => {
    router.push('/');
    setShowPinPrompt(false);
  };

  if (showPinPrompt && profile) {
    const [emoji, color] = profile.avatar_url?.split('|') || ['👤', 'bg-gray-600'];
    
    return (
      <>
        {children}
        <PinPrompt
          onSubmit={handlePinSubmit}
          onCancel={handleCancel}
          username={profile.username}
          avatar={emoji}
          color={color}
        />
      </>
    );
  }

  return <>{children}</>;
}
