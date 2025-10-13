import { PlanName } from '../../types/subscription';
import { FaCrown, FaStar, FaRocket } from 'react-icons/fa';

interface PlanBadgeProps {
  plan: PlanName;
  size?: 'sm' | 'md' | 'lg';
}

export default function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const getPlanConfig = () => {
    switch (plan) {
      case PlanName.FREE:
        return {
          label: 'Gratuit',
          color: 'bg-slate-600',
          icon: FaStar,
        };
      case PlanName.PREMIUM:
        return {
          label: 'Premium',
          color: 'bg-purple-600',
          icon: FaCrown,
        };
      case PlanName.ENTERPRISE:
        return {
          label: 'Enterprise',
          color: 'bg-indigo-600',
          icon: FaRocket,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-600',
          icon: FaStar,
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-3 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  const config = getPlanConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 ${config.color} text-white rounded-full font-semibold ${getSizeClasses()}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
}
