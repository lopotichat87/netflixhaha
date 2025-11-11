'use client';

import Link from 'next/link';
import { Film, Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo et description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Film size={32} className="text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ReelVibe
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Votre plateforme sociale de cinéma et séries. Découvrez, notez, partagez et connectez avec d'autres passionnés.
            </p>
          </div>

          {/* Navigation - Retiré */}

          {/* À propos */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">À propos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/landing" className="text-gray-400 hover:text-white transition">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition">
                  Aide
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © {currentYear} ReelVibe. Tous droits réservés.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://x.com/dedel_75" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://github.com/adellkl" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="mailto:adelloukal2@gmail.com" 
                className="text-gray-400 hover:text-purple-400 transition"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
