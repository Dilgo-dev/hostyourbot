import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaRobot, FaServer, FaFileAlt, FaSlidersH } from 'react-icons/fa';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function QuickActions() {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      title: 'Gérer les utilisateurs',
      description: 'Voir et modifier les comptes utilisateurs',
      icon: <FaUsers />,
      path: '/dashboard/admin/users',
      color: 'purple',
    },
    {
      title: 'Surveiller les bots',
      description: 'Gérer les bots déployés',
      icon: <FaRobot />,
      path: '/dashboard/admin/bots',
      color: 'blue',
    },
    {
      title: 'Métriques système',
      description: 'Analyser les performances du cluster',
      icon: <FaServer />,
      path: '/dashboard/admin/system',
      color: 'green',
    },
    {
      title: 'Consulter les logs',
      description: 'Voir l\'historique des événements',
      icon: <FaFileAlt />,
      path: '/dashboard/admin/logs',
      color: 'yellow',
    },
    {
      title: 'Configuration',
      description: 'Paramètres et configuration système',
      icon: <FaSlidersH />,
      path: '/dashboard/admin/config',
      color: 'red',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'text-purple-400 hover:border-purple-500/50',
      blue: 'text-blue-400 hover:border-blue-500/50',
      green: 'text-green-400 hover:border-green-500/50',
      yellow: 'text-yellow-400 hover:border-yellow-500/50',
      red: 'text-red-400 hover:border-red-500/50',
    };
    return colors[color] || colors.purple;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Actions rapides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            onClick={() => navigate(action.path)}
            className={`bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-left transition-all ${getColorClasses(action.color)} hover:bg-slate-700`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-2xl ${getColorClasses(action.color).split(' ')[0]}`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                <p className="text-slate-400 text-sm">{action.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
