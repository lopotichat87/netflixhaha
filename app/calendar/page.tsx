'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Film, Clock, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  event_date: string;
  media_id?: number;
  media_type?: string;
  notes?: string;
  type: 'release' | 'personal' | 'shared';
}

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadEvents();
  }, [user, router]);

  const loadEvents = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      // Charger les événements utilisateur
      const { data: userEvents } = await supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', user!.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date');

      // Charger les sorties de films
      const { data: releases } = await supabase
        .from('release_events')
        .select('*')
        .gte('release_date', new Date().toISOString().split('T')[0])
        .eq('region', 'FR')
        .order('release_date')
        .limit(20);

      const allEvents: Event[] = [];

      if (userEvents) {
        allEvents.push(...userEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          event_date: e.event_date,
          media_id: e.media_id,
          media_type: e.media_type,
          notes: e.notes,
          type: 'personal' as const,
        })));
      }

      if (releases) {
        allEvents.push(...releases.map((r: any) => ({
          id: r.id,
          title: `Sortie : ${r.media_title}`,
          event_date: new Date(r.release_date).toISOString(),
          media_id: r.media_id,
          media_type: r.media_type,
          type: 'release' as const,
        })));
      }

      allEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      setEvents(allEvents);

    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: Event[] } = {};
    events.forEach(event => {
      const date = new Date(event.event_date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate();

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Calendrier</h1>
          <p className="text-gray-400">Ne manquez aucune sortie de film</p>
        </div>

        {Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <div key={date}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <CalendarIcon size={24} className="text-purple-400" />
                  {formatDate(dayEvents[0].event_date)}
                </h2>
                <div className="grid gap-4">
                  {dayEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-6 rounded-lg border-l-4 ${
                        event.type === 'release'
                          ? 'bg-cyan-900/10 border-cyan-500'
                          : event.type === 'shared'
                          ? 'bg-pink-900/10 border-pink-500'
                          : 'bg-purple-900/10 border-purple-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {event.type === 'release' && <Film size={20} className="text-cyan-400" />}
                            {event.type === 'shared' && <Users size={20} className="text-pink-400" />}
                            {event.type === 'personal' && <Clock size={20} className="text-purple-400" />}
                            <h3 className="text-lg font-bold">{event.title}</h3>
                          </div>
                          
                          {event.notes && (
                            <p className="text-gray-400 mb-3">{event.notes}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              {formatTime(event.event_date)}
                            </div>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs">
                              {event.type === 'release' ? 'Sortie cinéma' : event.type === 'shared' ? 'Événement partagé' : 'Personnel'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon size={40} className="text-purple-400 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Aucun événement à venir</h2>
            <p className="text-gray-400 mb-6">
              Les sorties de films apparaîtront ici automatiquement
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
