import React from 'react';

interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const StepIndicator: React.FC<WizardStepProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? "border-primary bg-primary text-white amber-glow" 
                      : isCompleted 
                        ? "border-primary bg-primary/20 text-primary" 
                        : "border-border bg-transparent text-secondary/40"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-bold">{stepNumber}</span>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-wider mt-2 font-bold ${
                  isActive ? "text-primary" : "text-secondary/40"
                }`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-[2px] flex-1 -mt-6 transition-colors duration-300 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
