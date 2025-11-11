'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Bonjour ! Je suis l'assistant virtuel de ReelVibe. Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Questions générales sur le fonctionnement
    if (message.includes('comment ça marche') || message.includes('comment ca marche') || message.includes('comment fonctionne')) {
      return "ReelVibe est simple ! 🎬\n\n1. **Créez un compte** gratuitement\n2. **Recherchez des films** qui vous intéressent\n3. **Notez et critiquez** vos films préférés\n4. **Créez des listes** pour organiser vos découvertes\n5. **Suivez des amis** pour voir leurs goûts\n6. **Recevez des recommandations** personnalisées\n\nQue voulez-vous savoir en particulier ?";
    }
    if (message.includes('c\'est quoi') || message.includes('cest quoi') || message.includes('qu\'est-ce que') || message.includes('quest-ce que')) {
      return "ReelVibe est votre réseau social de cinéma ! 🎥 C'est une plateforme où vous pouvez découvrir, noter, partager et discuter de films avec une communauté de passionnés. Pensez à Letterboxd ou IMDb, mais avec une touche française et des fonctionnalités sociales avancées !";
    }
    if (message.includes('débuter') || message.includes('commencer') || message.includes('démarrer') || message.includes('premiers pas')) {
      return "Pour bien débuter sur ReelVibe :\n\n✅ **Créez votre profil** avec une photo\n✅ **Notez quelques films** que vous avez vus\n✅ **Créez votre première liste** (ex: À regarder)\n✅ **Suivez des utilisateurs** intéressants\n✅ **Explorez** les recommandations\n\nVous êtes prêt à plonger dans l'univers du cinéma ! 🚀";
    }
    if (message.includes('pourquoi') && (message.includes('utiliser') || message.includes('rejoindre') || message.includes('inscrir'))) {
      return "Pourquoi rejoindre ReelVibe ? 🌟\n\n• **100% gratuit** sans publicité intrusive\n• **Recommandations personnalisées** basées sur vos goûts\n• **Communauté active** de cinéphiles\n• **Listes collaboratives** avec vos amis\n• **Interface moderne** et intuitive\n• **Découvrez** des films que vous allez adorer\n\nRejoignez des milliers de passionnés de cinéma ! 🎬";
    }
    if (message.includes('différence') || message.includes('vs') || message.includes('mieux que')) {
      return "ReelVibe se distingue par :\n\n🎯 **Focus social** : connectez avec d'autres cinéphiles\n🇫🇷 **Interface française** : entièrement en français\n🎨 **Design moderne** : expérience visuelle agréable\n🤝 **Listes collaboratives** : partagez avec vos amis\n💯 **100% gratuit** : toutes les fonctionnalités accessibles\n\nEssayez et voyez la différence ! ✨";
    }
    if (message.includes('à quoi sert') || message.includes('a quoi sert') || message.includes('utilité') || message.includes('but')) {
      return "ReelVibe sert à :\n\n🎬 **Organiser** votre vie cinématographique\n📊 **Suivre** vos films vus et à voir\n⭐ **Partager** vos avis avec la communauté\n👥 **Découvrir** ce que vos amis regardent\n🎯 **Recevoir** des recommandations sur-mesure\n📋 **Créer** des listes thématiques\n\nC'est votre compagnon cinéma personnel ! 🍿";
    }
    if (message.includes('pour qui') || message.includes('destiné') || message.includes('cible')) {
      return "ReelVibe est parfait pour :\n\n🎥 **Cinéphiles passionnés** qui adorent le cinéma\n📱 **Utilisateurs sociaux** qui aiment partager\n🎬 **Découvreurs** en quête de nouveaux films\n👨‍👩‍👧‍👦 **Groupes d'amis** planifiant des soirées film\n📚 **Collectionneurs** organisant leur watchlist\n\nSi vous aimez le cinéma, ReelVibe est fait pour vous ! ✨";
    }
    if (message.includes('combien') && (message.includes('film') || message.includes('utilisateur'))) {
      return "ReelVibe vous donne accès à :\n\n🎬 **Des milliers de films** dans notre base de données\n📺 **Des séries** également disponibles\n👥 **Une communauté** grandissante de cinéphiles\n📊 **Toutes les infos** : synopsis, cast, notes, etc.\n\nNotre catalogue s'enrichit constamment ! 🚀";
    }
    if (message.includes('qui a créé') || message.includes('créateur') || message.includes('développeur') || message.includes('dev') || message.includes('qui a fait')) {
      return "**ReelVibe** a été créé par **Adel Loukal** 👨‍💻\n\n🎓 **Développeur Full-Stack** passionné de cinéma et technologie\n\n**Stack technique :**\n• **Frontend** : Next.js 14, React, TypeScript\n• **UI** : TailwindCSS, Framer Motion\n• **Backend** : Supabase (PostgreSQL)\n• **Auth** : Supabase Auth\n• **Storage** : Supabase Storage\n• **API** : TMDB (The Movie Database)\n• **Deployment** : Vercel\n\n📧 Contact : adelloukal2@gmail.com\n🐦 Twitter : @dedel_75\n💻 GitHub : github.com/adellkl\n\nProjet réalisé avec ❤️ et beaucoup de ☕ !";
    }
    if (message.includes('techno') || message.includes('stack') || message.includes('framework') || message.includes('langage')) {
      return "**Stack technique de ReelVibe :**\n\n**Frontend** 🎨\n• Next.js 14 (App Router)\n• React 18\n• TypeScript\n• TailwindCSS\n• Framer Motion (animations)\n• Lucide Icons\n\n**Backend** 💾\n• Supabase\n• PostgreSQL\n• Supabase Auth\n• Supabase Storage\n• Row Level Security (RLS)\n\n**APIs** 🔌\n• TMDB API (films/séries)\n\n**Deployment** 🚀\n• Vercel (hosting)\n• Supabase Cloud\n\nUne stack moderne et performante ! ⚡";
    }
    if (message.includes('open source') || message.includes('code source') || message.includes('github')) {
      return "Le code de ReelVibe n'est pas encore open source, mais nous y réfléchissons ! 🤔\n\n📧 Pour toute question technique : adelloukal2@gmail.com\n💻 GitHub du créateur : github.com/adellkl\n\nRestez connectés pour les futures mises à jour ! 🚀";
    }
    if (message.includes('version') || message.includes('mise à jour') || message.includes('update')) {
      return "ReelVibe est en développement actif ! 🚀\n\n**Version actuelle** : Beta 1.0\n\n**Mises à jour régulières :**\n• Nouvelles fonctionnalités\n• Corrections de bugs\n• Améliorations UX\n• Optimisations performances\n\nSuivez-nous pour rester informé des nouveautés ! 📢";
    }
    if (message.includes('contribution') || message.includes('contribuer') || message.includes('participer')) {
      return "Vous voulez contribuer à ReelVibe ? Super ! 🎉\n\n**Comment aider :**\n• 🐛 Signalez des bugs\n• 💡 Proposez des idées\n• 📝 Partagez vos retours\n• 👥 Invitez vos amis\n• ⭐ Notez des films\n\n📧 Contactez : adelloukal2@gmail.com\n\nToute aide est précieuse ! 🙏";
    }
    if (message.includes('légal') || message.includes('droits') || message.includes('licence')) {
      return "ReelVibe respecte tous les droits :\n\n✅ Les données des films proviennent de TMDB\n✅ Nous ne diffusons pas de contenu protégé\n✅ Nous sommes une plateforme de découverte et discussion\n✅ Consultez nos Conditions d'utilisation pour plus d'infos\n\nTout est dans les règles ! 📜";
    }
    if (message.includes('langue') || message.includes('français') || message.includes('anglais')) {
      return "ReelVibe est actuellement disponible en français ! 🇫🇷\n\nL'interface, le contenu et le support sont 100% en français. D'autres langues pourraient être ajoutées selon la demande de la communauté.\n\nVous préférez une autre langue ? Faites-le nous savoir ! 🌍";
    }
    if (message.includes('connexion') || message.includes('se connecter') || message.includes('login')) {
      return "Pour vous connecter :\n\n1. Cliquez sur **'Connexion'** en haut à droite\n2. Entrez votre **email** et **mot de passe**\n3. Cliquez sur **'Se connecter'**\n\nPas encore de compte ? Créez-en un gratuitement ! 🎬";
    }
    if (message.includes('comment trouver') || message.includes('où trouver') || message.includes('localiser')) {
      return "Pour trouver quelque chose sur ReelVibe :\n\n🔍 **Barre de recherche** : en haut de chaque page\n📱 **Menu** : cliquez sur votre avatar\n🏠 **Page d'accueil** : tout est accessible de là\n📊 **Profil** : pour vos listes et activités\n\nTout est à portée de clic ! ⚡";
    }

    // Compte
    if (message.includes('compte') || message.includes('inscription') || message.includes('créer')) {
      return "Pour créer un compte, cliquez sur 'Créer un compte' en haut à droite, remplissez le formulaire avec votre email, nom d'utilisateur et mot de passe. C'est gratuit et rapide ! 🎬";
    }
    if (message.includes('mot de passe') || message.includes('oublié')) {
      return "Si vous avez oublié votre mot de passe, cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre email et suivez les instructions pour le réinitialiser. 🔑";
    }
    if (message.includes('profil') || message.includes('modifier')) {
      return "Pour modifier votre profil, allez dans 'Mon Profil' puis cliquez sur 'Modifier'. Vous pouvez changer votre photo, bio, bannière et informations personnelles. ✨";
    }

    // Notation
    if (message.includes('noter') || message.includes('note') || message.includes('étoile')) {
      return "Pour noter un film, allez sur sa page et cliquez sur 'Noter'. Sélectionnez votre note de 1 à 5 étoiles, ajoutez une critique si vous le souhaitez, puis enregistrez. Vous pouvez modifier votre note à tout moment ! ⭐";
    }
    if (message.includes('critique') || message.includes('avis')) {
      return "Vous pouvez laisser une critique détaillée lors de la notation d'un film. Partagez votre ressenti et aidez la communauté à découvrir de nouveaux films ! 📝";
    }

    // Listes
    if (message.includes('liste') || message.includes('watchlist')) {
      return "Créez des listes personnalisées dans 'Mes Listes'. Vous pouvez créer des listes publiques ou privées, et même des listes collaboratives avec vos amis ! 📋";
    }
    if (message.includes('collabor') || message.includes('partag')) {
      return "Oui ! Créez une liste collaborative et invitez vos amis par leur nom d'utilisateur. Ils pourront ajouter et retirer des films ensemble. Parfait pour organiser une soirée film ! 🎉";
    }

    // Social
    if (message.includes('suivre') || message.includes('ami') || message.includes('follow')) {
      return "Visitez le profil d'un utilisateur et cliquez sur 'Suivre'. Vous verrez son activité dans votre fil et découvrirez ses recommandations ! 👥";
    }
    if (message.includes('privé') || message.includes('confidentialité')) {
      return "Vous pouvez rendre votre profil privé dans les Paramètres. Vos informations personnelles sont protégées et vous contrôlez ce que vous partagez. 🔒";
    }

    // Recherche
    if (message.includes('recherche') || message.includes('trouver') || message.includes('chercher')) {
      return "Utilisez la barre de recherche en haut pour trouver des films, séries ou utilisateurs. Vous pouvez filtrer par genre, année, note et plus encore ! 🔍";
    }
    if (message.includes('recommandation') || message.includes('suggère') || message.includes('découvrir')) {
      return "Notre système de recommandations analyse vos goûts et ceux de votre communauté pour vous suggérer des films parfaits pour vous. Plus vous notez, meilleures sont les recommandations ! 🎯";
    }

    // Technique
    if (message.includes('gratuit') || message.includes('prix') || message.includes('payant')) {
      return "ReelVibe est 100% gratuit ! Toutes les fonctionnalités sont accessibles sans frais, sans publicité intrusive. Profitez pleinement de l'expérience ! 🎁";
    }
    if (message.includes('mobile') || message.includes('application') || message.includes('app')) {
      return "ReelVibe fonctionne parfaitement sur tous les appareils : ordinateur, tablette et mobile. Pas besoin de télécharger d'application, utilisez simplement votre navigateur ! 📱💻";
    }
    if (message.includes('sécurité') || message.includes('donnée') || message.includes('protection')) {
      return "Vos données sont protégées avec un cryptage SSL et des mesures de sécurité avancées. Consultez notre page Confidentialité pour plus de détails. 🛡️";
    }

    // Fonctionnalités
    if (message.includes('fonctionnalité') || message.includes('fonction') || message.includes('feature')) {
      return "ReelVibe offre : notation émotionnelle, listes collaboratives, recommandations personnalisées, fil d'activité social, découverte de films, calendrier de sorties et bien plus ! 🚀";
    }
    if (message.includes('like') || message.includes('favoris')) {
      return "Vous pouvez liker des films pour les retrouver facilement dans 'Mes Likes'. Vos amis peuvent voir vos films préférés et découvrir vos goûts ! ❤️";
    }

    // Support
    if (message.includes('contact') || message.includes('aide') || message.includes('support')) {
      return "Pour une assistance personnalisée, envoyez-nous un email à support@reelvibe.app ou consultez notre Centre d'Aide pour les questions fréquentes. 💌";
    }
    if (message.includes('bug') || message.includes('problème') || message.includes('erreur')) {
      return "Désolé pour ce désagrément ! Envoyez-nous un email à support@reelvibe.app avec une description du problème et des captures d'écran si possible. Nous résoudrons cela rapidement ! 🔧";
    }

    // Navigation et interface
    if (message.includes('navigation') || message.includes('menu') || message.includes('interface')) {
      return "L'interface ReelVibe est simple :\n\n🏠 **Accueil** : fil d'actualité et découvertes\n🔍 **Recherche** : trouvez films et utilisateurs\n👤 **Profil** : votre avatar en haut à droite\n📋 **Listes** : organisez vos films\n⚙️ **Paramètres** : personnalisez votre expérience\n\nTout est intuitif ! 🎯";
    }
    if (message.includes('film du jour') || message.includes('suggestion') || message.includes('que regarder')) {
      return "Pour trouver votre prochain film :\n\n🔥 **Tendances** : films populaires du moment\n⭐ **Mieux notés** : les pépites de la communauté\n🎯 **Pour vous** : recommandations personnalisées\n📋 **Listes** : explorez les sélections thématiques\n\nVous trouverez forcément votre bonheur ! 🍿";
    }
    if (message.includes('ami') || message.includes('inviter') || message.includes('partager avec')) {
      return "Pour inviter des amis sur ReelVibe :\n\n1. Partagez votre **lien de profil**\n2. Créez une **liste collaborative**\n3. Recommandez des **films** à vos amis\n4. Suivez-les pour voir leurs **activités**\n\nPlus on est de fous, plus on rit ! 🎉";
    }
    if (message.includes('notification') || message.includes('alerte') || message.includes('avertissement')) {
      return "Les notifications ReelVibe vous alertent pour :\n\n🔔 **Nouveaux followers**\n❤️ **Likes sur vos critiques**\n💬 **Commentaires** sur vos activités\n📋 **Invitations** à des listes\n🎬 **Sorties** de films attendus\n\nGérez-les dans Paramètres ! ⚙️";
    }
    if (message.includes('export') || message.includes('télécharger') || message.includes('sauvegarder')) {
      return "Vous pouvez exporter vos données :\n\n📊 Vos **notes** et critiques\n📋 Vos **listes** personnelles\n📈 Vos **statistiques**\n\nContactez le support pour plus d'infos sur l'export de données ! 💾";
    }
    if (message.includes('film indisponible') || message.includes('manque') || message.includes('pas trouvé')) {
      return "Si un film est manquant :\n\n1. Vérifiez l'orthographe du titre\n2. Essayez le titre **original** (anglais)\n3. Contactez-nous à **support@reelvibe.app**\n\nNotre base s'enrichit régulièrement ! 🎬";
    }
    if (message.includes('supprimer compte') || message.includes('désactiver') || message.includes('effacer')) {
      return "Pour gérer votre compte :\n\n⚙️ Allez dans **Paramètres** > **Compte**\n🔒 Option **Désactiver le compte**\n❌ Option **Supprimer définitivement**\n\nAttention : la suppression est irréversible ! ⚠️";
    }

    // Salutations
    if (message.includes('bonjour') || message.includes('salut') || message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Bonjour ! 👋 Comment puis-je vous aider avec ReelVibe aujourd'hui ?";
    }
    if (message.includes('merci') || message.includes('thank') || message.includes('cool') || message.includes('parfait')) {
      return "De rien ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider ! 😊";
    }
    if (message.includes('au revoir') || message.includes('bye') || message.includes('à plus') || message.includes('ciao')) {
      return "Au revoir ! Bon visionnage sur ReelVibe ! 🎬✨";
    }

    // Réponse par défaut
    return "Je ne suis pas sûr de comprendre votre question. Pouvez-vous la reformuler ou être plus précis ? Vous pouvez aussi consulter notre Centre d'Aide ou nous contacter à support@reelvibe.app. 🤔";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler un délai de réponse
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button - Minimaliste */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 transition-all group border border-gray-200"
          >
            <MessageCircle className="text-gray-700 group-hover:text-gray-900 transition-colors" size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white"></div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window - Minimaliste */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header - Minimaliste */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">En ligne</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-gray-200 rounded-lg transition flex items-center justify-center"
              >
                <X className="text-gray-600" size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-gray-900' 
                        : 'bg-gray-200'
                    }`}>
                      {message.sender === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-700" />}
                    </div>
                    <div className={`rounded-2xl p-3 ${
                      message.sender === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className={`text-sm leading-relaxed ${message.sender === 'user' ? 'text-white' : 'text-gray-900'}`}>{message.text}</p>
                      <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot size={16} className="text-gray-700" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Minimaliste */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition text-sm text-gray-900 placeholder:text-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Appuyez sur Entrée pour envoyer
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
