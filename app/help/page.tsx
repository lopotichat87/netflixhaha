'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Mail, MessageCircle, Film } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: "Compte",
      questions: [
        {
          q: "Comment créer un compte ?",
          a: "Cliquez sur 'Créer un compte' en haut de la page, remplissez le formulaire avec votre email, nom d'utilisateur et mot de passe. Un email de confirmation vous sera envoyé."
        },
        {
          q: "J'ai oublié mon mot de passe, que faire ?",
          a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre email et suivez les instructions pour réinitialiser votre mot de passe."
        },
        {
          q: "Comment modifier mon profil ?",
          a: "Allez dans 'Mon Profil', cliquez sur 'Modifier le profil'. Vous pouvez changer votre avatar, bio, nom d'affichage et autres informations personnelles."
        }
      ]
    },
    {
      category: "Notation & Critiques",
      questions: [
        {
          q: "Comment noter un film ?",
          a: "Sur la page d'un film, cliquez sur le bouton 'Noter'. Sélectionnez votre note de 1 à 5 étoiles, ajoutez optionnellement une critique, puis cliquez sur 'Enregistrer'."
        },
        {
          q: "Puis-je modifier ma note après l'avoir publiée ?",
          a: "Oui ! Retournez sur la page du film et cliquez à nouveau sur 'Noter'. Votre note actuelle s'affichera et vous pourrez la modifier."
        },
        {
          q: "Comment supprimer une critique ?",
          a: "Allez sur la page du film, trouvez votre critique et cliquez sur l'icône de poubelle. Confirmez la suppression."
        }
      ]
    },
    {
      category: "Listes",
      questions: [
        {
          q: "Comment créer une liste ?",
          a: "Allez dans 'Mes Listes' et cliquez sur 'Créer une nouvelle liste'. Donnez-lui un nom, une description et choisissez si elle est publique ou privée."
        },
        {
          q: "Puis-je collaborer sur une liste avec mes amis ?",
          a: "Oui ! Créez une liste collaborative et invitez vos amis par leur nom d'utilisateur. Ils pourront ajouter et retirer des films."
        },
        {
          q: "Comment ajouter un film à une liste ?",
          a: "Sur la page d'un film, cliquez sur 'Ajouter à une liste', sélectionnez la liste de destination, et confirmez."
        }
      ]
    },
    {
      category: "Social",
      questions: [
        {
          q: "Comment suivre d'autres utilisateurs ?",
          a: "Visitez le profil de l'utilisateur et cliquez sur 'Suivre'. Vous verrez son activité dans votre fil d'actualité."
        },
        {
          q: "Comment voir ce que mes amis ont aimé ?",
          a: "Allez sur leur profil et consultez leur onglet 'Likes' ou 'Favoris' pour découvrir leurs films préférés."
        },
        {
          q: "Puis-je rendre mon profil privé ?",
          a: "Actuellement tous les profils sont publics pour encourager les découvertes et le partage dans la communauté."
        }
      ]
    },
    {
      category: "Technique",
      questions: [
        {
          q: "Sur quels appareils puis-je utiliser ReelVibe ?",
          a: "ReelVibe fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge) et est optimisé pour mobile, tablette et desktop."
        },
        {
          q: "Mes données sont-elles sécurisées ?",
          a: "Oui, nous utilisons un cryptage SSL et des mesures de sécurité avancées pour protéger vos données. Consultez notre page Confidentialité pour plus de détails."
        },
        {
          q: "L'application est-elle gratuite ?",
          a: "Oui, ReelVibe est 100% gratuit ! Toutes les fonctionnalités sont accessibles sans frais."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => 
        qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Menu Flottant */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
        <div className="max-w-7xl mx-auto bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
          <div className="px-6">
            <div className="flex items-center justify-center h-16">
            <Link href="/landing" className="flex items-center gap-2">
              <Film size={32} className="text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ReelVibe
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/landing#features" className="text-gray-300 hover:text-white transition-colors font-medium">
                Fonctionnalités
              </Link>
              <Link href="/help" className="text-white font-semibold">
                Aide
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <button className="hidden sm:block px-4 py-2 text-white hover:text-gray-300 transition-colors font-medium">
                  Connexion
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                  Créer un compte
                </button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative py-24 px-4 overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <HelpCircle className="w-20 h-20 mx-auto mb-6 text-blue-400" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Centre d'Aide
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {filteredFaqs.map((category, catIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-blue-400">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((qa, qIndex) => {
                const globalIndex = catIndex * 100 + qIndex;
                const isOpen = openIndex === globalIndex;

                return (
                  <motion.div
                    key={qIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: qIndex * 0.05 }}
                    className="border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition"
                    >
                      <span className="font-semibold text-lg pr-4">{qa.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="text-blue-400 flex-shrink-0" size={24} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/10">
                            {qa.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-gradient-to-b from-black via-blue-950/10 to-black"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Vous ne trouvez pas de réponse ?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Notre équipe est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:support@reelvibe.app">
              <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 rounded-full hover:bg-blue-700 transition font-semibold">
                <Mail size={20} />
                Envoyer un email
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      <Footer />
      
      {/* Chatbot flottant */}
      <Chatbot />
    </div>
  );
}
