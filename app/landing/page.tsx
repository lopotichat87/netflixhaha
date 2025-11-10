'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, Heart, Users, Calendar, TrendingUp, Sparkles, Star, MessageSquare, ListPlus, Share2, Eye, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import AppScreenshot from '@/components/AppScreenshot';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              ReelVibe
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <p className="text-xl md:text-2xl text-gray-400">
                Ressentez chaque film
              </p>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed"
          >
            Découvrez, notez et partagez vos films selon vos <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold">émotions</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/signup">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70">
                <span className="relative z-10">Commencer gratuitement</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-8 py-4 border-2 border-purple-500/50 rounded-full font-semibold text-lg hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300">
                Se connecter
              </button>
            </Link>
          </motion.div>

          {/* Texte Défilant Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 relative overflow-hidden py-6"
          >
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: ["0%", "-100%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-12 px-8">
                  <span 
                    className="text-3xl md:text-5xl font-black uppercase"
                    style={{
                      WebkitTextStroke: '2px rgba(168, 85, 247, 0.5)',
                      WebkitTextFillColor: 'transparent'
                    } as React.CSSProperties}
                  >
                    Découvrez
                  </span>
                  <span 
                    className="text-3xl md:text-5xl font-black uppercase"
                    style={{
                      WebkitTextStroke: '2px rgba(236, 72, 153, 0.5)',
                      WebkitTextFillColor: 'transparent'
                    } as React.CSSProperties}
                  >
                    Notez
                  </span>
                  <span 
                    className="text-3xl md:text-5xl font-black uppercase"
                    style={{
                      WebkitTextStroke: '2px rgba(34, 211, 238, 0.5)',
                      WebkitTextFillColor: 'transparent'
                    } as React.CSSProperties}
                  >
                    Partagez
                  </span>
                  <span 
                    className="text-3xl md:text-5xl font-black uppercase"
                    style={{
                      WebkitTextStroke: '2px rgba(168, 85, 247, 0.5)',
                      WebkitTextFillColor: 'transparent'
                    } as React.CSSProperties}
                  >
                    Créez
                  </span>
                  <span 
                    className="text-3xl md:text-5xl font-black uppercase"
                    style={{
                      WebkitTextStroke: '2px rgba(236, 72, 153, 0.5)',
                      WebkitTextFillColor: 'transparent'
                    } as React.CSSProperties}
                  >
                    Connectez
                  </span>
                  <span 
                    className="text-3xl md:text-5xl font-black uppercase"
                    style={{
                      WebkitTextStroke: '2px rgba(34, 211, 238, 0.5)',
                      WebkitTextFillColor: 'transparent'
                    } as React.CSSProperties}
                  >
                    Explorez
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Compteurs Animés */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <AnimatedCounter 
              end={245}
              suffix=""
              label="Films référencés"
              color="text-purple-400"
              duration={2.5}
            />
            <AnimatedCounter 
              end={89}
              suffix=""
              label="Utilisateurs actifs"
              color="text-pink-400"
              duration={2.5}
            />
            <AnimatedCounter 
              end={312}
              suffix=""
              label="Critiques partagées"
              color="text-cyan-400"
              duration={2.5}
            />
            <AnimatedCounter 
              end={56}
              suffix=""
              label="Listes créées"
              color="text-yellow-400"
              duration={2.5}
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-purple-500/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-purple-500 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Showcase Section 1 - Découverte */}
      <div className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-32"
          >
            <div>
              <h2 className="text-5xl font-bold mb-6">
                Découvrez votre <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">prochaine obsession</span>
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Parcourez notre catalogue de films et séries avec des filtres intelligents. Trouvez exactement ce que vous cherchez grâce à notre système de recherche avancé.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Catalogue mis à jour quotidiennement
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Filtres par genre, année, note moyenne
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Informations détaillées sur chaque film
                </li>
              </ul>
            </div>
            <div className="relative">
              <AppScreenshot 
                imageSrc="/screenshots/catalog.png"
                alt="Catalogue de films et séries"
                delay={0.2}
              />
            </div>
          </motion.div>

          {/* Showcase 2 - Noter & Critiquer */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-32"
          >
            <div className="order-2 md:order-1 relative">
              <AppScreenshot 
                imageSrc="/screenshots/rating.png"
                alt="Système de notation et critiques"
                delay={0.2}
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-5xl font-bold mb-6">
                Partagez vos <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">avis et critiques</span>
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Notez les films que vous avez vus et écrivez des critiques détaillées. Inspirez la communauté avec vos recommandations.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <Star size={16} className="text-yellow-400" />
                  Système de notation de 1 à 5 étoiles
                </li>
                <li className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-yellow-400" />
                  Rédigez des critiques complètes
                </li>
                <li className="flex items-center gap-3">
                  <Eye size={16} className="text-yellow-400" />
                  Marquez les films comme vus
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Showcase 3 - Listes */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-32"
          >
            <div>
              <h2 className="text-5xl font-bold mb-6">
                Organisez votre <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">cinémathèque</span>
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Créez des listes personnalisées pour organiser vos films. Partagez-les avec vos amis ou gardez-les privées.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <ListPlus size={16} className="text-cyan-400" />
                  Listes illimitées
                </li>
                <li className="flex items-center gap-3">
                  <Share2 size={16} className="text-cyan-400" />
                  Partage public ou privé
                </li>
                <li className="flex items-center gap-3">
                  <Users size={16} className="text-cyan-400" />
                  Listes collaboratives
                </li>
              </ul>
            </div>
            <div className="relative">
              <AppScreenshot 
                imageSrc="/screenshots/lists.png"
                alt="Créez et partagez vos listes"
                delay={0.2}
              />
            </div>
          </motion.div>

          {/* Showcase 4 - Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 md:order-1 relative">
              <AppScreenshot 
                imageSrc="/screenshots/stats.png"
                alt="Statistiques et activité"
                delay={0.2}
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-5xl font-bold mb-6">
                Suivez votre <span className="text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">activité cinéma</span>
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Visualisez vos statistiques de visionnage, découvrez vos tendances et suivez votre progression.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <BarChart3 size={16} className="text-pink-400" />
                  Graphiques détaillés de votre activité
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-pink-400" />
                  Tendances et genres préférés
                </li>
                <li className="flex items-center gap-3">
                  <Calendar size={16} className="text-pink-400" />
                  Historique complet de visionnage
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 bg-gradient-to-b from-black via-purple-950/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Une expérience <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">unique</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              ReelVibe révolutionne la façon dont vous découvrez et partagez vos films préférés
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-14 h-14 mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon size={28} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-cyan-900/30 border border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl blur-xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Prêt à ressentir le cinéma autrement ?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Rejoignez la communauté ReelVibe et découvrez des films qui vous ressemblent
              </p>
              <Link href="/auth/signup">
                <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50">
                  Créer mon compte gratuit
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

const features = [
  {
    icon: Sparkles,
    title: 'Analyse Émotionnelle',
    description: 'Découvrez des films selon votre humeur du moment grâce à notre système d\'analyse émotionnelle unique.',
  },
  {
    icon: Users,
    title: 'Cinéma Collaboratif',
    description: 'Créez des listes partagées avec vos amis et décidez ensemble de votre prochaine soirée film.',
  },
  {
    icon: Heart,
    title: 'Notez & Partagez',
    description: 'Notez vos films, écrivez des critiques et découvrez ce que vos amis ont aimé.',
  },
  {
    icon: Calendar,
    title: 'Calendrier de Sorties',
    description: 'Ne manquez plus jamais une sortie avec notre calendrier personnalisé et nos notifications.',
  },
  {
    icon: TrendingUp,
    title: 'Recommandations Intelligentes',
    description: 'Des suggestions personnalisées basées sur vos goûts et ceux de votre communauté.',
  },
  {
    icon: Film,
    title: 'Base Immense',
    description: 'Accédez à des milliers de films et séries avec toutes les informations dont vous avez besoin.',
  },
];
