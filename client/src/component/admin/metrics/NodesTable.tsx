import { motion } from 'framer-motion';
import { FaCheckCircle, FaServer } from 'react-icons/fa';
import { NodeMetrics } from '../../../services/metricsService';

interface NodesTableProps {
  nodes: NodeMetrics[];
}

export default function NodesTable({ nodes }: NodesTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <FaServer className="text-purple-400 text-2xl" />
        <h2 className="text-2xl font-bold text-white">Nodes du cluster</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Rôle</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Statut</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">CPU</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Mémoire</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Pods</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, index) => (
              <motion.tr
                key={node.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">{node.name}</td>
                <td className="py-3 px-4">
                  <span className="text-sm text-slate-300">{node.role}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-green-400">{node.status}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-sm">
                      {node.cpu.used.toFixed(1)}/{node.cpu.total} cores
                    </span>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          node.cpu.percentage > 80
                            ? 'bg-red-500'
                            : node.cpu.percentage > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${node.cpu.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{node.cpu.percentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-sm">
                      {node.memory.used.toFixed(1)}/{node.memory.total} GB
                    </span>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          node.memory.percentage > 80
                            ? 'bg-red-500'
                            : node.memory.percentage > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${node.memory.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{node.memory.percentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-white">
                  {node.pods.current}/{node.pods.max}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
