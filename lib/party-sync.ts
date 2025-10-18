import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PartySync {
  id: string;
  party_id: string;
  playback_time: number;
  is_playing: boolean;
  updated_by: string | null;
  updated_at: string;
}

export class WatchPartySync {
  private channel: RealtimeChannel | null = null;
  private partyId: string;
  private userId: string;
  private onSyncUpdate: (sync: PartySync) => void;

  constructor(partyId: string, userId: string, onSyncUpdate: (sync: PartySync) => void) {
    this.partyId = partyId;
    this.userId = userId;
    this.onSyncUpdate = onSyncUpdate;
  }

  async initialize() {
    // Créer ou récupérer l'état de sync
    const { data: existing } = await supabase
      .from('party_sync')
      .select('*')
      .eq('party_id', this.partyId)
      .single();

    if (!existing) {
      await supabase
        .from('party_sync')
        .insert({
          party_id: this.partyId,
          playback_time: 0,
          is_playing: false,
          updated_by: this.userId,
        });
    }

    // S'abonner aux changements en temps réel
    this.channel = supabase
      .channel(`party-sync-${this.partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_sync',
          filter: `party_id=eq.${this.partyId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData && newData.updated_by !== this.userId) {
            this.onSyncUpdate(newData as PartySync);
          }
        }
      )
      .subscribe();
  }

  async updatePlaybackTime(time: number) {
    const { error } = await supabase
      .from('party_sync')
      .update({
        playback_time: time,
        updated_by: this.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('party_id', this.partyId);

    if (error) console.error('Error updating playback time:', error);
  }

  async updatePlayState(isPlaying: boolean) {
    const { error } = await supabase
      .from('party_sync')
      .update({
        is_playing: isPlaying,
        updated_by: this.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('party_id', this.partyId);

    if (error) console.error('Error updating play state:', error);
  }

  async updateBoth(time: number, isPlaying: boolean) {
    const { error } = await supabase
      .from('party_sync')
      .update({
        playback_time: time,
        is_playing: isPlaying,
        updated_by: this.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('party_id', this.partyId);

    if (error) console.error('Error updating sync:', error);
  }

  async getCurrentState(): Promise<PartySync | null> {
    const { data, error } = await supabase
      .from('party_sync')
      .select('*')
      .eq('party_id', this.partyId)
      .single();

    if (error) {
      console.error('Error getting current state:', error);
      return null;
    }

    return data;
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
