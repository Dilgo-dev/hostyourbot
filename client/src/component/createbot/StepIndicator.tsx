import { FaCheck } from 'react-icons/fa';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? 'bg-purple-600 text-white'
                      : isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <FaCheck className="text-sm" /> : stepNumber}
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    isActive ? 'text-white' : isCompleted ? 'text-purple-400' : 'text-slate-500'
                  }`}
                >
                  {step}
                </p>
              </div>

              {stepNumber < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all duration-200 ${
                    isCompleted ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
