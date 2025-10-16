import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { getAvailablePlans } from '../services/subscriptionService';
import type { SubscriptionPlan, PlanName } from '../types/subscription';
import { useSubscription } from '../context/SubscriptionContext';

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscription } = useSubscription();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getAvailablePlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanColor = (planName: PlanName) => {
    switch (planName) {
      case PlanName.FREE:
        return 'slate';
      case PlanName.PREMIUM:
        return 'purple';
      case PlanName.ENTERPRISE:
        return 'indigo';
      default:
        return 'slate';
    }
  };

  const isCurrentPlan = (planName: PlanName) => {
    return subscription?.plan === planName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-slate-400">
            Des plans adaptés à tous vos besoins, du débutant au professionnel
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const color = getPlanColor(plan.name);
            const isCurrent = isCurrentPlan(plan.name);
            const isPremium = plan.name === PlanName.PREMIUM;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-slate-800 rounded-2xl p-8 border-2 ${
                  isPremium
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-105'
                    : 'border-slate-700'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Populaire
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 right-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Plan actuel
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 text-${color}-400`}>
                    {plan.displayName}
                  </h3>
                  <p className="text-slate-400 text-sm min-h-[40px]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-slate-400 ml-2">/mois</span>
                  </div>
                </div>

                <button
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 ${
                    isCurrent
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : isPremium
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : `bg-${color}-500 hover:bg-${color}-600 text-white`
                  }`}
                >
                  {isCurrent ? 'Plan actuel' : 'Choisir ce plan'}
                </button>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase text-slate-400 mb-3">
                    Fonctionnalités incluses
                  </h4>

                  <div className="flex items-center gap-3">
                    <FaCheck className="text-green-400 flex-shrink-0" />
                    <span>
                      {plan.features.maxBots === 999999
                        ? 'Bots illimités'
                        : `${plan.features.maxBots} bot${plan.features.maxBots > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaCheck className="text-green-400 flex-shrink-0" />
                    <span>Jusqu'à {plan.features.maxReplicas} replicas par bot</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaCheck className="text-green-400 flex-shrink-0" />
                    <span>CPU: {plan.features.maxCpuPerBot}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaCheck className="text-green-400 flex-shrink-0" />
                    <span>RAM: {plan.features.maxMemoryPerBot}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {plan.features.prioritySupport ? (
                      <FaCheck className="text-green-400 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={!plan.features.prioritySupport ? 'text-slate-600' : ''}
                    >
                      Support prioritaire
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {plan.features.customDomain ? (
                      <FaCheck className="text-green-400 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-slate-600 flex-shrink-0" />
                    )}
                    <span className={!plan.features.customDomain ? 'text-slate-600' : ''}>
                      Domaine personnalisé
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {plan.features.advancedAnalytics ? (
                      <FaCheck className="text-green-400 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={!plan.features.advancedAnalytics ? 'text-slate-600' : ''}
                    >
                      Analytiques avancées
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {plan.features.apiAccess ? (
                      <FaCheck className="text-green-400 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-slate-600 flex-shrink-0" />
                    )}
                    <span className={!plan.features.apiAccess ? 'text-slate-600' : ''}>
                      Accès API
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 text-slate-400"
        >
          <p className="mb-2">Des questions sur nos plans ?</p>
          <a
            href="/contact"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Contactez notre équipe
          </a>
        </motion.div>
      </div>
    </div>
  );
}
