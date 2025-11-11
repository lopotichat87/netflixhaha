'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SessionDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionInfo({
        hasSession: !!session,
        email: session?.user?.email,
        expiresAt: session?.expires_at,
        localStorage: typeof window !== 'undefined' ? {
          hasToken: !!localStorage.getItem('sb-ewdhqukmewpfzpaxflyz-auth-token'),
          keys: Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'))
        } : null
      });
    };

    checkSession();

    // Recheck every 5 seconds
    const interval = setInterval(checkSession, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!sessionInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm border border-purple-500 z-50">
      <h3 className="font-bold mb-2 text-purple-400">🔍 Session Debug</h3>
      <div className="space-y-1">
        <p>Session: <span className={sessionInfo.hasSession ? 'text-green-400' : 'text-red-400'}>
          {sessionInfo.hasSession ? '✅ Active' : '❌ Inactive'}
        </span></p>
        {sessionInfo.email && <p>User: {sessionInfo.email}</p>}
        <p>LocalStorage Keys: {sessionInfo.localStorage?.keys.length || 0}</p>
        {sessionInfo.localStorage?.keys.map((key: string) => (
          <p key={key} className="text-gray-400 text-[10px] truncate">• {key}</p>
        ))}
      </div>
    </div>
  );
}
