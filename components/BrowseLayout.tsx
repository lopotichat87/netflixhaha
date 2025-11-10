'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrowseLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children: ReactNode;
}

export default function BrowseLayout({
  title,
  description,
  icon: Icon,
  iconColor = 'text-white',
  iconBg = 'from-purple-500 to-pink-500',
  children,
}: BrowseLayoutProps) {
  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header unifié */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon size={28} className={iconColor} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
              <p className="text-gray-400 text-sm md:text-base mt-1">{description}</p>
            </div>
          </div>
        </motion.div>

        {/* Contenu */}
        {children}
      </div>
    </div>
  );
}
