'use client';

import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import { Film } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNav />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 pt-32">
        <h1 className="text-5xl font-bold mb-6">Politique de Confidentialité</h1>
        <p className="text-gray-400 mb-12">Dernière mise à jour : Novembre 2025</p>

        {/* Introduction */}
        <section className="mb-12">
          <p className="text-gray-300 leading-relaxed text-lg">
            Chez ReelVibe, nous prenons très au sérieux la protection de vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons 
            vos informations.
          </p>
        </section>

        {/* Sections */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">1. Informations que nous collectons</h2>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Informations de compte :</strong> Nom d'utilisateur, email, mot de passe (hashé)</p>
              <p><strong className="text-white">Informations de profil :</strong> Photo de profil, bio, préférences de thème</p>
              <p><strong className="text-white">Activité :</strong> Films notés, critiques, listes créées, interactions sociales</p>
              <p><strong className="text-white">Données techniques :</strong> Adresse IP, type de navigateur, données d'utilisation</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">2. Comment nous utilisons vos données</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience (recommandations, thèmes)</li>
              <li>Permettre les interactions sociales (amis, watch parties)</li>
              <li>Analyser les tendances et améliorer nos algorithmes</li>
              <li>Communiquer avec vous (notifications, mises à jour)</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">3. Partage de données</h2>
            <p className="text-gray-300 mb-3">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong className="text-white">Avec votre consentement :</strong> Profils publics, listes partagées</li>
              <li><strong className="text-white">Fournisseurs de services :</strong> Hébergement (Supabase), analytique</li>
              <li><strong className="text-white">Obligations légales :</strong> Si requis par la loi</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">4. Sécurité</h2>
            <p className="text-gray-300">
              Nous utilisons des mesures de sécurité de pointe pour protéger vos données :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mt-3">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Mots de passe hashés avec bcrypt</li>
              <li>Authentification sécurisée via Supabase</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Surveillance continue des menaces</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">5. Vos droits</h2>
            <p className="text-gray-300 mb-3">Vous avez le droit de :</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Accéder à vos données personnelles</li>
              <li>Corriger des informations inexactes</li>
              <li>Supprimer votre compte et vos données</li>
              <li>Exporter vos données</li>
              <li>Vous opposer au traitement de certaines données</li>
              <li>Retirer votre consentement à tout moment</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">6. Cookies et technologies similaires</h2>
            <p className="text-gray-300">
              Nous utilisons des cookies pour améliorer votre expérience, mémoriser vos préférences 
              et analyser l'utilisation de notre site. Vous pouvez gérer vos préférences de cookies 
              dans les paramètres de votre navigateur.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">7. Conservation des données</h2>
            <p className="text-gray-300">
              Nous conservons vos données aussi longtemps que votre compte est actif ou selon les besoins 
              pour fournir nos services. Vous pouvez demander la suppression de votre compte à tout moment.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">8. Modifications</h2>
            <p className="text-gray-300">
              Nous pouvons mettre à jour cette politique occasionnellement. Nous vous notifierons de tout 
              changement significatif par email ou via une notification sur la plateforme.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">9. Contact</h2>
            <p className="text-gray-300">
              Pour toute question concernant cette politique ou vos données personnelles, contactez-nous à :
            </p>
            <p className="text-purple-400 mt-2">privacy@reelvibe.com</p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 text-center">
          <p className="text-gray-300 mb-4">
            En utilisant ReelVibe, vous acceptez cette politique de confidentialité.
          </p>
          <Link href="/auth/signup">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition">
              Créer mon compte
            </button>
          </Link>
        </div>
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
