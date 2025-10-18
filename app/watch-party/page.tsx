'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Users, Link as LinkIcon, Copy, Check, Film, Tv, Search, ArrowRight } from 'lucide-react';

export default function WatchPartyCreatePage() {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [mediaId, setMediaId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [partyLink, setPartyLink] = useState('');
  const [copied, setCopied] = useState(false);

  const searchMedia = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${endpoint}?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data.results?.slice(0, 5) || []);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectMedia = (id: number, title: string) => {
    setMediaId(id.toString());
    setSearchQuery(title);
    setSearchResults([]);
  };

  const createParty = () => {
    if (!mediaId) return;
    
    const link = `${window.location.origin}/watch-party/${mediaType}/${mediaId}`;
    setPartyLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(partyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinParty = () => {
    if (partyLink) {
      router.push(`/watch-party/${mediaType}/${mediaId}`);
    }
  };

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-16 max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Users size={28} className="text-purple-500" />
            <h1 className="text-3xl font-bold">Watch Party</h1>
          </div>
          <p className="text-gray-400">
            Créez une session de visionnage synchronisé avec vos amis
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-800"
>
          {/* Media Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-300">Type de contenu</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMediaType('movie')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition ${
                  mediaType === 'movie'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                }`}
              >
                <Film size={20} />
                <span className="font-medium">Film</span>
              </button>
              <button
                onClick={() => setMediaType('tv')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition ${
                  mediaType === 'tv'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                }`}
              >
                <Tv size={20} />
                <span className="font-medium">Série</span>
              </button>
            </div>
          </div>

          {/* Media Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Rechercher un {mediaType === 'movie' ? 'film' : 'série'}
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMedia()}
                  placeholder={`Ex: ${mediaType === 'movie' ? 'Inception' : 'Breaking Bad'}`}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  onClick={searchMedia}
                  disabled={searching || !searchQuery.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition flex items-center gap-2"
                >
                  <Search size={18} />
                  {searching ? '...' : 'Chercher'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                >
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectMedia(result.id, result.title || result.name)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-gray-700 transition text-left"
                    >
                      {result.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                          alt={result.title || result.name}
                          className="w-12 h-18 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-gray-900 rounded flex items-center justify-center">
                          {mediaType === 'movie' ? <Film size={20} /> : <Tv size={20} />}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{result.title || result.name}</h4>
                        <p className="text-xs text-gray-400">
                          {(result.release_date || result.first_air_date || '').split('-')[0]} • ID: {result.id}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {mediaId && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <Check size={14} />
                {mediaType === 'movie' ? 'Film' : 'Série'} sélectionné (ID: {mediaId})
              </p>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={createParty}
            disabled={!mediaId}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <span>Créer la session</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Party Link */}
        {partyLink && (
          <div className="mt-6 bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon size={20} className="text-purple-500" />
              <h3 className="text-lg font-semibold">Lien de session</h3>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={partyLink}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                <span className="text-sm">{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <button
              onClick={joinParty}
              className="w-full bg-purple-600 hover:bg-purple-700 py-2.5 rounded-lg font-medium transition"
            >
              Rejoindre la session
            </button>

            <p className="mt-4 text-sm text-gray-400 text-center">
              Partagez ce lien avec vos amis
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-center">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-sm mb-1">Chat en direct</h3>
            <p className="text-xs text-gray-400">
              Discutez pendant le visionnage
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-center">
            <div className="text-2xl mb-2">😊</div>
            <h3 className="font-semibold text-sm mb-1">Réactions</h3>
            <p className="text-xs text-gray-400">
              Emojis en temps réel
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-sm mb-1">Multi-utilisateurs</h3>
            <p className="text-xs text-gray-400">
              Regardez ensemble
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
