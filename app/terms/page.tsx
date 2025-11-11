'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Check } from 'lucide-react';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNav />

      {/* Hero */}
      <div className="relative py-24 px-4 overflow-hidden pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <FileText className="w-20 h-20 mx-auto mb-6 text-purple-400" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Conditions d'Utilisation
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">Dernière mise à jour : Novembre 2025</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <p className="text-gray-300 leading-relaxed text-lg">
            En accédant et en utilisant ReelVibe, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </p>
        </motion.section>

        {/* Sections */}
        <section className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-white/5 to-transparent p-6 rounded-xl border-l-4 border-purple-500"
          >
            <h2 className="text-2xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              <Check size={24} />
              1. Acceptation des conditions
            </h2>
            <p className="text-gray-300 leading-relaxed">
              En créant un compte ou en utilisant ReelVibe, vous acceptez ces conditions d'utilisation, 
              notre politique de confidentialité et toutes les règles applicables. Ces conditions constituent 
              un accord légal entre vous et ReelVibe.
            </p>
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">2. Utilisation du service</h2>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Âge minimum :</strong> Vous devez avoir au moins 13 ans pour utiliser ReelVibe.</p>
              <p><strong className="text-white">Compte :</strong> Vous êtes responsable de la confidentialité de votre compte et de toutes les activités sous votre compte.</p>
              <p><strong className="text-white">Exactitude :</strong> Vous vous engagez à fournir des informations exactes et à jour.</p>
              <p><strong className="text-white">Usage personnel :</strong> Votre compte est personnel et ne peut être partagé.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">3. Contenu utilisateur</h2>
            <p className="text-gray-300 mb-3">En publiant du contenu sur ReelVibe, vous :</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Conservez la propriété de votre contenu</li>
              <li>Accordez à ReelVibe une licence pour afficher et distribuer ce contenu</li>
              <li>Garantissez que vous avez le droit de publier ce contenu</li>
              <li>Acceptez que votre contenu public soit visible par tous les utilisateurs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">4. Comportement interdit</h2>
            <p className="text-gray-300 mb-3">Vous ne devez pas :</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Publier du contenu illégal, offensant, diffamatoire ou haineux</li>
              <li>Harceler, intimider ou menacer d'autres utilisateurs</li>
              <li>Usurper l'identité d'une autre personne</li>
              <li>Spammer ou envoyer du contenu non sollicité</li>
              <li>Tenter d'accéder à des comptes non autorisés</li>
              <li>Utiliser des bots ou automatiser l'utilisation du service</li>
              <li>Collecter des données d'autres utilisateurs sans autorisation</li>
              <li>Interférer avec le bon fonctionnement du service</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">5. Propriété intellectuelle</h2>
            <p className="text-gray-300 mb-3">
              ReelVibe et son contenu original (design, logo, code) sont protégés par le droit d'auteur et 
              d'autres lois sur la propriété intellectuelle.
            </p>
            <p className="text-gray-300">
              Les informations sur les films proviennent de TMDB et sont utilisées conformément à leur licence.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">6. Modération du contenu</h2>
            <p className="text-gray-300">
              Nous nous réservons le droit de modérer, modifier ou supprimer tout contenu qui viole ces 
              conditions ou qui est jugé inapproprié. Nous pouvons également suspendre ou résilier des comptes 
              en cas de violation répétée.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">7. Disponibilité du service</h2>
            <p className="text-gray-300">
              Nous faisons de notre mieux pour maintenir ReelVibe disponible 24/7, mais nous ne garantissons pas 
              une disponibilité ininterrompue. Nous pouvons effectuer des maintenances ou des mises à jour qui 
              peuvent temporairement affecter l'accès au service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">8. Limitation de responsabilité</h2>
            <p className="text-gray-300 mb-3">
              ReelVibe est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas responsables de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>La perte de données ou de contenu</li>
              <li>Les dommages directs ou indirects liés à l'utilisation du service</li>
              <li>Le contenu publié par d'autres utilisateurs</li>
              <li>Les interruptions de service ou bugs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">9. Modifications des conditions</h2>
            <p className="text-gray-300">
              Nous pouvons modifier ces conditions à tout moment. Les modifications significatives seront 
              notifiées par email ou via une notification sur la plateforme. L'utilisation continue du service 
              après ces modifications constitue votre acceptation des nouvelles conditions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">10. Résiliation</h2>
            <p className="text-gray-300">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Nous pouvons résilier 
              votre compte en cas de violation de ces conditions. En cas de résiliation, votre contenu public 
              peut rester visible, mais vous n'aurez plus accès à votre compte.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">11. Droit applicable</h2>
            <p className="text-gray-300">
              Ces conditions sont régies par les lois françaises. Tout litige sera soumis aux tribunaux compétents.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">12. Contact</h2>
            <p className="text-gray-300">
              Pour toute question concernant ces conditions, contactez-nous à :
            </p>
            <p className="text-purple-400 mt-2">legal@reelvibe.com</p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 text-center">
          <p className="text-gray-300 mb-4">
            En créant un compte, vous acceptez ces conditions d'utilisation.
          </p>
          <Link href="/auth/signup">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition">
              Créer mon compte
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
