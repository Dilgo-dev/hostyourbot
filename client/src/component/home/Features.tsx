import React from 'react';
import { motion } from 'framer-motion';
import {
  FaRocket,
  FaServer,
  FaDiscord,
  FaTerminal,
  FaPuzzlePiece,
  FaShieldAlt,
  FaCog,
  FaBell,
  FaCode,
  FaSync,
} from 'react-icons/fa';

const features = [
  {
    icon: FaRocket,
    title: 'Déploiement en un clic',
    description: 'Interface intuitive pour déployer votre bot en quelques secondes sans configuration complexe',
  },
  {
    icon: FaServer,
    title: 'Infrastructure Kubernetes',
    description: 'Scalabilité automatique, haute disponibilité et orchestration puissante pour vos bots',
  },
  {
    icon: FaDiscord,
    title: 'Support multi-plateformes',
    description: 'Compatible avec Discord, Telegram et d\'autres plateformes de messagerie',
  },
  {
    icon: FaTerminal,
    title: 'Logs en temps réel',
    description: 'Surveillance et debugging facile avec accès aux logs de vos bots en direct',
  },
  {
    icon: FaPuzzlePiece,
    title: 'Builder visuel',
    description: 'Créez des workflows Discord.js complexes sans écrire une ligne de code',
  },
  {
    icon: FaShieldAlt,
    title: 'Sécurité avancée',
    description: 'Isolation des containers, authentification 2FA et protection contre les attaques',
  },
  {
    icon: FaCog,
    title: 'Variables d\'environnement',
    description: 'Configuration flexible avec gestion sécurisée des variables et secrets',
  },
  {
    icon: FaBell,
    title: 'Monitoring intelligent',
    description: 'Alertes Discord automatiques et métriques en temps réel de votre cluster',
  },
  {
    icon: FaCode,
    title: 'API REST complète',
    description: 'Intégrez facilement vos services avec notre API REST bien documentée',
  },
  {
    icon: FaSync,
    title: 'Gestion des versions',
    description: 'Mettez à jour vos bots facilement avec suivi des versions et rollback rapide',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  return (
    <section id="fonctionnalites" className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Une plateforme complète avec tous les outils pour héberger et gérer vos bots professionnellement
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="bg-purple-600/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors duration-300">
                  <Icon className="text-3xl text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
