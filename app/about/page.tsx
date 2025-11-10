'use client';

import Link from 'next/link';
import { Film, Heart, Users, Sparkles, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              ReelVibe
            </div>
          </Link>
          <Link href="/landing" className="text-gray-400 hover:text-white transition">
            Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          À propos de ReelVibe
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Ressentez chaque film différemment
        </p>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            ReelVibe est né d'une passion : celle de croire que chaque film raconte une histoire unique et 
            provoque des émotions différentes en chacun de nous. Notre mission est de créer une plateforme 
            où vous pouvez non seulement découvrir des films, mais aussi partager vos ressentis et connecter 
            avec d'autres cinéphiles qui vibent sur la même longueur d'onde.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg">
            Nous croyons que le cinéma est avant tout une expérience émotionnelle, et c'est exactement 
            ce que ReelVibe célèbre : vos émotions, vos critiques, votre vibe.
          </p>
        </section>

        {/* Ce qui nous différencie */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Ce qui nous rend unique</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20">
              <Sparkles className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Analyse Émotionnelle</h3>
              <p className="text-gray-400">
                Notre algorithme unique analyse les émotions dans les critiques pour vous recommander 
                des films selon votre humeur actuelle.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-pink-900/20 to-black border border-pink-500/20">
              <Users className="text-pink-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Cinéma Collaboratif</h3>
              <p className="text-gray-400">
                Créez des watch parties, décidez ensemble de votre prochain film à regarder 
                grâce à notre système de vote en temps réel.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-900/20 to-black border border-cyan-500/20">
              <Heart className="text-cyan-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Communauté Active</h3>
              <p className="text-gray-400">
                Suivez vos amis, découvrez leurs coups de cœur et partagez vos critiques 
                avec une communauté passionnée.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20">
              <TrendingUp className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Personnalisation Poussée</h3>
              <p className="text-gray-400">
                Thèmes personnalisables, profils stylisés et recommandations sur-mesure 
                pour une expérience unique.
              </p>
            </div>
          </div>
        </section>

        {/* Notre Histoire */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Notre Histoire</h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            Lancé en 2025, ReelVibe est né du constat simple que les plateformes de films existantes 
            se concentraient soit sur le streaming, soit sur la notation pure. Nous voulions quelque chose 
            de différent : une plateforme qui met l'émotion au centre de l'expérience.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            Inspirés par Letterboxd mais avec une vision moderne et sociale, nous avons créé ReelVibe 
            pour être le lieu où vous pouvez non seulement noter des films, mais aussi comprendre 
            pourquoi vous les aimez, découvrir des films qui correspondent à votre état d'esprit et 
            partager ces moments avec une communauté qui vous ressemble.
          </p>
        </section>

        {/* Valeurs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Nos Valeurs</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h3 className="text-xl font-bold mb-1">Authenticité</h3>
                <p className="text-gray-400">Nous célébrons les opinions honnêtes et les ressentis personnels.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
              <div>
                <h3 className="text-xl font-bold mb-1">Communauté</h3>
                <p className="text-gray-400">Le partage et la découverte collective sont au cœur de ReelVibe.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
              <div>
                <h3 className="text-xl font-bold mb-1">Innovation</h3>
                <p className="text-gray-400">Nous repoussons les limites de ce qu'une plateforme de films peut être.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h3 className="text-xl font-bold mb-1">Passion</h3>
                <p className="text-gray-400">Le cinéma est notre passion, et nous la partageons avec vous.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-cyan-900/30 border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-4">Rejoignez l'aventure</h2>
          <p className="text-gray-300 text-lg mb-6">
            Faites partie de la communauté ReelVibe et découvrez le cinéma autrement
          </p>
          <Link href="/auth/signup">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-purple-500/50">
              Créer mon compte gratuit
            </button>
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2025 ReelVibe. Ressentez chaque film.</p>
        </div>
      </footer>
    </div>
  );
}
