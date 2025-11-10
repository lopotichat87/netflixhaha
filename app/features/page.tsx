'use client';

import { motion } from 'framer-motion';
import { Star, MessageSquare, ListPlus, Users, BarChart3, Heart, Eye, Share2, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function FeaturesPage() {
  const features = [
    {
      icon: Star,
      title: "Notation Avancée",
      description: "Notez vos films et séries de 1 à 5 étoiles. Ajoutez des critiques détaillées et partagez vos opinions avec la communauté.",
      color: "from-yellow-600 to-orange-600"
    },
    {
      icon: MessageSquare,
      title: "Critiques & Avis",
      description: "Rédigez des critiques complètes, lisez celles des autres utilisateurs et découvrez différents points de vue sur vos films préférés.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: ListPlus,
      title: "Listes Personnalisées",
      description: "Créez des listes illimitées pour organiser vos films. Publiques, privées ou collaboratives avec vos amis.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: Users,
      title: "Réseau Social",
      description: "Suivez d'autres cinéphiles, découvrez leurs goûts et partagez vos recommandations dans un environnement social.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Statistiques Détaillées",
      description: "Visualisez vos statistiques de visionnage, vos genres préférés et suivez votre progression avec des graphiques interactifs.",
      color: "from-pink-600 to-rose-600"
    },
    {
      icon: Heart,
      title: "Favoris & Likes",
      description: "Marquez vos films préférés, créez une collection de favoris et retrouvez facilement vos coups de cœur.",
      color: "from-red-600 to-pink-600"
    },
    {
      icon: Eye,
      title: "Suivi de Visionnage",
      description: "Gardez une trace de tous les films et séries que vous avez vus avec dates et notes personnelles.",
      color: "from-indigo-600 to-purple-600"
    },
    {
      icon: Share2,
      title: "Partage Social",
      description: "Partagez vos découvertes, listes et critiques avec vos amis sur les réseaux sociaux ou directement dans l'app.",
      color: "from-cyan-600 to-blue-600"
    },
    {
      icon: Sparkles,
      title: "Recommandations IA",
      description: "Algorithme intelligent qui analyse vos goûts et vous suggère des films parfaitement adaptés à vos préférences.",
      color: "from-purple-600 to-indigo-600"
    },
    {
      icon: Zap,
      title: "Notifications",
      description: "Recevez des alertes pour les nouvelles sorties, les recommandations d'amis et l'activité sur vos critiques.",
      color: "from-yellow-600 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Fonctionnalités
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Découvrez toutes les fonctionnalités qui font de ReelVibe la plateforme ultime pour les cinéphiles
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Rejoignez des milliers de cinéphiles et profitez de toutes nos fonctionnalités gratuitement
          </p>
          <Link href="/auth/signup">
            <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50">
              Créer mon compte gratuit
            </button>
          </Link>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
