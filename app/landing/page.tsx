'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, Heart, Users, Calendar, TrendingUp, Sparkles, Star, MessageSquare, ListPlus, Share2, Eye, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import AppScreenshot from '@/components/AppScreenshot';
import AnimatedCounter from '@/components/AnimatedCounter';
import Chatbot from '@/components/Chatbot';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const featuresRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  // Sections pour la navigation (dans l'ordre d'apparition)
  const sections = [
    { id: 'hero', label: 'Accueil' },
    { id: 'films', label: 'Films' },
    { id: 'showcase', label: 'Découverte' },
    { id: 'features', label: 'Expérience' },
    { id: 'cta', label: 'Commencer' },
  ];

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  // Animation GSAP sobre et efficace
  useEffect(() => {
    // Attendre que les refs soient prêts
    const timer = setTimeout(() => {
      if (!featuresRef.current || !titleRef.current || !subtitleRef.current || cardsRef.current.length === 0) return;

      const ctx = gsap.context(() => {
        // Animation du titre avec effet reveal
        gsap.fromTo(titleRef.current,
          {
            opacity: 0,
            y: 100,
            scale: 0.9,
          },
          {
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power4.out',
          }
        );

        // Animation du sous-titre (décalé)
        gsap.fromTo(subtitleRef.current,
          {
            opacity: 0,
            y: 60,
          },
          {
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3,
            ease: 'power3.out',
          }
        );

        // Animation des cartes avec effet de vague
        const validCards = cardsRef.current.filter(card => card !== null && card !== undefined);

        gsap.fromTo(validCards,
          {
            opacity: 0,
            y: 80,
            rotateX: 20,
            scale: 0.95,
          },
          {
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1,
            stagger: {
              amount: 0.8,
              from: 'start',
              ease: 'power2.out',
            },
            ease: 'expo.out',
          }
        );
      }, featuresRef);

      // Hover sobre - UNIQUEMENT gradient qui suit la souris (en dehors du contexte GSAP)
      const validCards = cardsRef.current.filter(card => card !== null && card !== undefined);
      const handlers: Array<{ card: HTMLDivElement; handleMove: (e: MouseEvent) => void }> = [];

      validCards.forEach((card) => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        };

        const handleMouseEnter = () => {
          card.style.setProperty('--opacity', '1');
        };

        const handleMouseLeave = () => {
          card.style.setProperty('--opacity', '0');
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        handlers.push({ card, handleMove: handleMouseMove });
      });

      return () => {
        ctx.revert();
        // Nettoyer les event listeners
        handlers.forEach(({ card }) => {
          const newCard = card;
          const oldHandlers = (newCard as any).__mouseHandlers;
          if (oldHandlers) {
            newCard.removeEventListener('mousemove', oldHandlers.move);
            newCard.removeEventListener('mouseenter', oldHandlers.enter);
            newCard.removeEventListener('mouseleave', oldHandlers.leave);
          }
        });
      };
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Tracker la position du scroll pour la navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculer quelle section est active
      const sectionElements = sections.map(section => 
        document.getElementById(section.id)
      ).filter(Boolean);

      let currentSection = 0;
      sectionElements.forEach((element, index) => {
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = index;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour scroller vers une section
  const scrollToSection = (index: number) => {
    const section = document.getElementById(sections[index].id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Custom Scrollbar avec points */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className="group relative flex items-center justify-center w-8 h-8"
            aria-label={section.label}
          >
            {/* Point - Allumé si <= activeSection */}
            <div
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index <= activeSection
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            />
            
            {/* Beau cercle autour du point actif */}
            {activeSection === index && (
              <>
                {/* Cercle principal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full border-2 border-yellow-400 animate-pulse" />
                </div>
                {/* Cercle extérieur */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full border border-yellow-500/30" />
                </div>
              </>
            )}

            {/* Label au hover */}
            <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 backdrop-blur-md text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap border border-yellow-500/30 shadow-xl">
                {section.label}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Menu Flottant */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
        <div className="max-w-7xl mx-auto bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/landing" className="flex items-center gap-2">
                <Film size={32} className="text-purple-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ReelVibe
                </span>
              </Link>

              {/* Menu Links - Center */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Aide
                </Link>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Conditions
                </Link>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Confidentialité
                </Link>
              </div>

              {/* Action Buttons - Right */}
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

      {/* Hero Section */}
      <div id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Curved Background Shape - Full Screen */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 1024" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                <stop offset="40%" style={{ stopColor: '#0a0a0a', stopOpacity: 0.95 }} />
                <stop offset="70%" style={{ stopColor: '#1a0820', stopOpacity: 0.7 }} />
                <stop offset="100%" style={{ stopColor: '#2d1b4e', stopOpacity: 0.4 }} />
              </linearGradient>
            </defs>
            <path
              d="M 0,0 L 1440,0 L 1440,1024 C 1200,700 1000,750 720,800 C 440,850 240,900 0,1024 Z"
              fill="url(#heroGradient)"
            />
          </svg>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            className="absolute bottom-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                1,289+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                47k
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Notes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                94%
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Satisfaction</div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Section Films Populaires */}
      <div id="films" className="relative overflow-hidden bg-gradient-to-b from-black via-purple-950/5 to-black py-24">
        {/* Hero Card avec carrousel en arrière-plan */}
        <div className="relative max-w-7xl mx-auto px-5">
          <div className="relative h-[500px] flex items-center justify-center">

            {/* Carrousel en arrière-plan - Ligne du haut */}
            <div className="absolute top-12 left-0 right-0 flex gap-3 animate-scroll-continuous opacity-30 blur-[2px]">
              {[
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
                { poster: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
                { poster: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
                { poster: '/i0enkzsL5dPeneWnjl1fCWm6L7k.jpg' },
                { poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
                { poster: '/2Sns5oMb356JNdBHgBETjIpRYy9.jpg' },
                { poster: '/k9tv1rXZbOhH7eiCk4XsGGFnGt.jpg' },
                // Duplicate pour loop infini
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
                { poster: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
                { poster: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
                { poster: '/i0enkzsL5dPeneWnjl1fCWm6L7k.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
                { poster: '/2Sns5oMb356JNdBHgBETjIpRYy9.jpg' },
                { poster: '/k9tv1rXZbOhH7eiCk4XsGGFnGt.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
              ].map((film, index) => (
                <div key={index} className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${film.poster}`}
                    alt="Film"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Carrousel en arrière-plan - Ligne du bas */}
            <div className="absolute bottom-12 left-0 right-0 flex gap-3 animate-scroll-reverse opacity-30 blur-[2px]">
              {[
                { poster: '/k9tv1rXZbOhH7eiCk4XsGGFnGt.jpg' },
                { poster: '/2Sns5oMb356JNdBHgBETjIpRYy9.jpg' },
                { poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
                { poster: '/i0enkzsL5dPeneWnjl1fCWm6L7k.jpg' },
                { poster: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
                { poster: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
                { poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                // Duplicate pour loop infini
                { poster: '/k9tv1rXZbOhH7eiCk4XsGGFnGt.jpg' },
                { poster: '/2Sns5oMb356JNdBHgBETjIpRYy9.jpg' },
                { poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
                { poster: '/i0enkzsL5dPeneWnjl1fCWm6L7k.jpg' },
                { poster: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
                { poster: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
                { poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/2Sns5oMb356JNdBHgBETjIpRYy9.jpg' },
                { poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
                { poster: '/i0enkzsL5dPeneWnjl1fCWm6L7k.jpg' },
                { poster: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
                { poster: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
                { poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
                { poster: '/2Sns5oMb356JNdBHgBETjIpRYy9.jpg' },
                { poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
                { poster: '/i0enkzsL5dPeneWnjl1fCWm6L7k.jpg' },
                { poster: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
                { poster: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
                { poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
                { poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
                { poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
                { poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
                { poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
                { poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
                { poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
                { poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
                { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
                { poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
                { poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
                { poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
              ].map((film, index) => (
                <div key={index} className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${film.poster}`}
                    alt="Film"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Carte centrale */}
            <div className="relative z-10">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-200/50 max-w-md">
                {/* Lignes verticales décoratives */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-20">
                  <div className="absolute inset-0 flex gap-1 justify-center">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className="w-px h-full bg-gradient-to-b from-pink-500 via-purple-500 to-transparent" />
                    ))}
                  </div>
                </div>

                {/* Contenu */}
                <div className="relative text-center">
                  {/* Badge animé */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
                      En vedette
                    </span>
                  </div>

                  {/* Icône avec gradient */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl">
                        <Film size={48} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Titre avec style */}
                  <h3 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
                    Films populaires
                  </h3>
                  
                  <p className="text-gray-600 text-xl mb-6 font-medium">
                    Découvrez notre sélection
                  </p>

                  {/* Divider décoratif */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-300"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-300"></div>
                  </div>

                  {/* Stats avec icônes */}
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Film size={16} className="text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-700">20 films</span>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Star size={16} className="text-pink-600 fill-pink-600" />
                      </div>
                      <span className="font-semibold text-gray-700">Mise à jour quotidienne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Section 1 - Découverte */}
      <div id="showcase" className="py-24 px-4">
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

      {/* Features Section avec GSAP - Bento Grid Layout */}
      <div id="features" ref={featuresRef} className="py-24 px-4 bg-gradient-to-b from-black via-purple-950/10 to-black" style={{ perspective: '1000px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold mb-4">
              Une expérience <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">unique</span>
            </h2>
            <p ref={subtitleRef} className="text-gray-400 text-lg max-w-2xl mx-auto">
              ReelVibe révolutionne la façon dont vous découvrez et partagez vos films préférés
            </p>
          </div>

          {/* Bento Grid - Layout Asymétrique */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
            {/* Première carte - Large */}
            <div
              ref={(el) => {
                if (el) cardsRef.current[0] = el;
              }}
              className="bento-card group relative md:col-span-3 md:row-span-2 p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-black border border-purple-500/30 cursor-pointer"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center backdrop-blur-sm">
                    {(() => {
                      const Icon = features[0].icon;
                      return <Icon size={32} className="text-purple-300" />;
                    })()}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    {features[0].title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{features[0].description}</p>
                </div>
              </div>
            </div>

            {/* Deuxième carte - Moyenne Haute */}
            <div
              ref={(el) => {
                if (el) cardsRef.current[1] = el;
              }}
              className="bento-card group relative md:col-span-3 p-6 rounded-2xl bg-gradient-to-br from-pink-900/30 to-black border border-pink-500/30 cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
                  {(() => {
                    const Icon = features[1].icon;
                    return <Icon size={28} className="text-pink-300" />;
                  })()}
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {features[1].title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{features[1].description}</p>
              </div>
            </div>

            {/* Troisième carte - Petite */}
            <div
              ref={(el) => {
                if (el) cardsRef.current[2] = el;
              }}
              className="bento-card group relative md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-black border border-cyan-500/30 cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                  {(() => {
                    const Icon = features[2].icon;
                    return <Icon size={24} className="text-cyan-300" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {features[2].title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{features[2].description}</p>
              </div>
            </div>

            {/* Quatrième carte - Moyenne */}
            <div
              ref={(el) => {
                if (el) cardsRef.current[3] = el;
              }}
              className="bento-card group relative md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-black border border-blue-500/30 cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  {(() => {
                    const Icon = features[3].icon;
                    return <Icon size={24} className="text-blue-300" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {features[3].title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{features[3].description}</p>
              </div>
            </div>

            {/* Cinquième et Sixième cartes - Petites */}
            {features.slice(4, 6).map((feature, index) => (
              <div
                key={feature.title}
                ref={(el) => {
                  if (el) cardsRef.current[index + 4] = el;
                }}
                className="bento-card group relative md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black border border-gray-700/50 cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <feature.icon size={24} className="text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="cta" className="py-24 px-4">
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

      {/* Chatbot */}
      <Chatbot />
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
