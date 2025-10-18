import { supabase } from './supabase';

// ============================================
// ACTIVITY TRACKING
// ============================================

export interface ActivitySession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string | null;
  duration_minutes: number;
  created_at: string;
}

// Démarrer une session
async function startSession(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .insert({
      user_id: userId,
      session_start: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

// Terminer une session
async function endSession(sessionId: string): Promise<void> {
  const { data: session } = await supabase
    .from('activity_sessions')
    .select('session_start')
    .eq('id', sessionId)
    .single();

  if (!session) return;

  const start = new Date(session.session_start);
  const end = new Date();
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

  const { error } = await supabase
    .from('activity_sessions')
    .update({
      session_end: end.toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq('id', sessionId);

  if (error) throw error;
}

// Obtenir le temps total passé sur l'app
async function getTotalAppTime(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .not('session_end', 'is', null);

  if (error) throw error;
  
  return data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
}

// Obtenir le temps passé cette semaine
async function getWeeklyAppTime(userId: string): Promise<number> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('activity_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('session_start', weekAgo.toISOString())
    .not('session_end', 'is', null);

  if (error) throw error;
  
  return data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
}

// Obtenir le temps passé aujourd'hui
async function getTodayAppTime(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('activity_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('session_start', today.toISOString())
    .not('session_end', 'is', null);

  if (error) throw error;
  
  return data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
}

export const activityTracker = {
  startSession,
  endSession,
  getTotalAppTime,
  getWeeklyAppTime,
  getTodayAppTime,
};
