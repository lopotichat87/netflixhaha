import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { historyHelpers } from '@/lib/supabase';

export function useHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const data = await historyHelpers.getHistory(user.id);
      return data.slice(0, 20);
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
