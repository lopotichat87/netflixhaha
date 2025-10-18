'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Smile, Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { WatchPartySync } from '@/lib/party-sync';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: Date;
  color: string;
}

interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👏', '🔥', '💯', '🎉'];
const USER_COLORS = ['#E50914', '#0080FF', '#00D4AA', '#FFB800', '#FF6B6B', '#9D50BB'];

export default function WatchPartyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const type = params.type as string;
  const id = params.id as string;
  const mediaId = parseInt(id);

  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [onlineUsers] = useState(1);
  const [iframeReady, setIframeReady] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const syncRef = useRef<WatchPartySync | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/watch-party/${type}/${id}`);
      return;
    }

    const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery'];
    setUserName(names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100));
    setUserColor(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

    if (!type || !id || isNaN(mediaId) || (type !== 'movie' && type !== 'tv')) {
      router.push('/');
      return;
    }

    if (user) {
      loadMedia();
    }
    simulateMessages();

    // Initialiser la synchronisation Watch Party
    if (user && id) {
      const partyId = `${type}-${id}`;
      syncRef.current = new WatchPartySync(partyId, user.id, (sync) => {
        // Callback quand un autre utilisateur change l'état
        console.log('Sync update from another user:', sync);
        // Note: La synchronisation iframe nécessiterait une API du lecteur
      });
      
      syncRef.current.initialize();
    }

    return () => {
      if (syncRef.current) {
        syncRef.current.disconnect();
      }
    };
  }, [type, id, user]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const BASE_URL = 'https://api.themoviedb.org/3';

      const response = await fetch(
        `${BASE_URL}/${type}/${mediaId}?api_key=${API_KEY}&language=fr-FR`
      );
      const data = await response.json();
      setMedia(data);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const simulateMessages = () => {
    // Pas de messages de démonstration
    setMessages([]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: userName,
      avatar: '👤',
      message: newMessage,
      timestamp: new Date(),
      color: userColor
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const sendReaction = (emoji: string) => {
    const videoRect = videoRef.current?.getBoundingClientRect();
    if (!videoRect) return;

    const reaction: Reaction = {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * (videoRect.width - 50),
      y: videoRect.height - 100,
      timestamp: Date.now()
    };

    setReactions([...reactions, reaction]);
    setShowEmojiPicker(false);

    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!media) {
    router.push('/');
    return null;
  }

  const title = media.title || media.name || 'Sans titre';
  const streamingUrl = type === 'movie' 
    ? `https://vidsrc.xyz/embed/movie/${mediaId}`
    : `https://vidsrc.xyz/embed/tv/${mediaId}/1/1`;

  return (
    <div className="relative bg-black min-h-screen">
      <Navbar />

      <div className="pt-20 flex flex-col lg:flex-row gap-4 p-4">
        {/* Video Player Section */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
              <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition"
            >
              <ArrowLeft size={20} />
              <span>Quitter la Watch Party</span>
            </button>

            <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-full">
              <Users size={18} className="text-green-400" />
              <span className="text-sm font-semibold">{onlineUsers} en ligne</span>
            </div>
          </div>

          {/* Video Player */}
          <div ref={videoRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={streamingUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="origin"
            />

            {/* Floating Reactions */}
            <AnimatePresence>
              {reactions.map((reaction) => (
                <motion.div
                  key={reaction.id}
                  className="absolute text-4xl pointer-events-none"
                  initial={{ x: reaction.x, y: reaction.y, opacity: 1, scale: 0 }}
                  animate={{ y: reaction.y - 200, opacity: 0, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                >
                  {reaction.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Reaction Bar */}
          <div className="mt-4 flex items-center justify-between bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
              >
                <Smile size={20} />
              </button>
              
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-2 bg-gray-800 p-2 rounded-full"
                >
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>

        {/* Chat Section */}
        <div className={`lg:w-96 flex flex-col bg-gray-900 rounded-lg overflow-hidden transition-all ${showChat ? 'h-[600px]' : 'h-12'}`}>
          {/* Chat Header */}
          <div 
            className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer"
            onClick={() => setShowChat(!showChat)}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Chat en direct</h3>
            </div>
            <span className="text-xs bg-red-600 px-2 py-1 rounded-full">{messages.length}</span>
          </div>

          {showChat && (
            <>
              {/* Messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: msg.color }}>
                        {msg.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm" style={{ color: msg.color }}>
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Envoyer un message..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white transition"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
