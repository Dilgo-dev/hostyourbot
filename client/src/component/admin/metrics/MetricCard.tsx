import { motion } from 'framer-motion';
import type { ComponentType } from 'react';

interface MetricCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  percentage?: number;
  delay?: number;
  color?: string;
}

export default function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  percentage,
  delay = 0,
  color = 'purple',
}: MetricCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-400';
      case 'green':
        return 'text-green-400';
      case 'yellow':
        return 'text-yellow-400';
      case 'red':
        return 'text-red-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`${getColorClasses()} text-3xl`} />
        <span className="text-slate-400 text-sm">{title}</span>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-400 text-sm">{subtitle}</p>
      {percentage !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}% utilisé</p>
        </div>
      )}
    </motion.div>
  );
}
