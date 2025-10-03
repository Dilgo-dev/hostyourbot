import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaServer, FaShieldAlt } from 'react-icons/fa';

export default function Hero() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 pt-16">
      <div className="max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-6"
        >
          <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30">
            Hébergement simple et puissant
          </span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Déployez vos bots
          <span className="block text-purple-400">
            en quelques clics
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
        >
          Une plateforme moderne pour héberger et gérer vos bots Discord, Telegram et plus encore avec Kubernetes.
        </motion.p>

        {/* Boutons CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2">
            <FaRocket />
            Commencer gratuitement
          </button>
          <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
            Voir la documentation
          </button>
        </motion.div>

        {/* Features cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <FaRocket className="text-4xl text-purple-400 mb-4 mx-auto" />
            <h3 className="text-white font-semibold text-lg mb-2">Déploiement rapide</h3>
            <p className="text-slate-400 text-sm">Déployez votre bot en moins de 2 minutes</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <FaServer className="text-4xl text-purple-400 mb-4 mx-auto" />
            <h3 className="text-white font-semibold text-lg mb-2">Infrastructure K8s</h3>
            <p className="text-slate-400 text-sm">Propulsé par Kubernetes pour la scalabilité</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <FaShieldAlt className="text-4xl text-purple-400 mb-4 mx-auto" />
            <h3 className="text-white font-semibold text-lg mb-2">Sécurisé</h3>
            <p className="text-slate-400 text-sm">Isolation et sécurité garanties</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}