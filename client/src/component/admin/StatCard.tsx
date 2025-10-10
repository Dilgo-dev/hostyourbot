import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface StatCardProps {
  icon: IconType;
  title: string;
  value: string | number;
  subtitle: string;
  delay?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ icon: Icon, title, value, subtitle, delay = 0, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="text-purple-400 text-3xl" />
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-slate-500 text-xs">{subtitle}</p>
    </motion.div>
  );
}
