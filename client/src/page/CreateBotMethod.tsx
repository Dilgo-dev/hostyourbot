import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCode, FaUpload, FaWandMagicSparkles } from 'react-icons/fa6';
import DashboardLayout from '../component/dashboard/DashboardLayout';

export default function CreateBotMethod() {
  const navigate = useNavigate();

  const methods = [
    {
      id: 'nocode',
      title: 'Builder No-Code',
      description: 'Créez votre bot Discord visuellement sans écrire de code',
      icon: FaWandMagicSparkles,
      color: 'purple',
      path: '/builder?mode=deploy',
      features: [
        'Interface visuelle intuitive',
        'Génération automatique du code',
        'Pas de connaissances techniques requises',
        'Personnalisation des événements et actions',
      ],
    },
    {
      id: 'upload',
      title: 'Upload de Code',
      description: 'Téléversez votre propre code existant',
      icon: FaUpload,
      color: 'blue',
      path: '/dashboard/create',
      features: [
        'Support Node.js, Python, Go',
        'Configuration personnalisée',
        'Variables d\'environnement',
        'Contrôle total sur le code',
      ],
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft />
          Retour au dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">
            Comment souhaitez-vous créer votre bot ?
          </h1>
          <p className="text-slate-400">
            Choisissez la méthode qui correspond le mieux à vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {methods.map((method, index) => {
            const Icon = method.icon;
            const colorClasses = {
              purple: 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500',
              blue: 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500',
            }[method.color];

            return (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(method.path)}
                className={`bg-slate-800/50 border-2 ${colorClasses} rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 bg-${method.color}-600 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-xl font-bold mb-2">{method.title}</h2>
                    <p className="text-slate-400 text-sm">{method.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {method.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${method.color}-500`} />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className={`text-${method.color}-400 font-semibold group-hover:translate-x-1 transition-transform`}>
                    Commencer
                  </span>
                  <FaCode className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-400">💡</span>
            Recommandation
          </h3>
          <p className="text-slate-400 text-sm">
            Si vous débutez ou souhaitez créer rapidement un bot Discord simple, nous recommandons le{' '}
            <span className="text-purple-400 font-semibold">Builder No-Code</span>. Pour les projets
            plus complexes ou si vous avez déjà du code, utilisez l'
            <span className="text-blue-400 font-semibold">Upload de Code</span>.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
