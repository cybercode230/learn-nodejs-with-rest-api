import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const ONBOARDING_KEY = 'hostify_onboarding_complete';
const STEP_KEY = 'hostify_onboarding_step';

export type OnboardingStep = 'welcome' | 'profile' | 'payment' | 'listing' | 'done';

const STEPS: OnboardingStep[] = ['welcome', 'profile', 'payment', 'listing', 'done'];

export const useOnboarding = () => {
  const { user } = useAuth();

  // Per-user key so each account has its own onboarding state
  const userKey = user?.id ? `${ONBOARDING_KEY}_${user.id}` : ONBOARDING_KEY;
  const stepKey = user?.id ? `${STEP_KEY}_${user.id}` : STEP_KEY;

  const isComplete = localStorage.getItem(userKey) === 'true';
  const savedStep = (localStorage.getItem(stepKey) as OnboardingStep) ?? 'welcome';

  const [step, setStep] = useState<OnboardingStep>(isComplete ? 'done' : savedStep);

  const goNext = useCallback(() => {
    setStep(prev => {
      const idx = STEPS.indexOf(prev);
      const next = STEPS[idx + 1] ?? 'done';
      localStorage.setItem(stepKey, next);
      if (next === 'done') {
        localStorage.setItem(userKey, 'true');
      }
      return next;
    });
  }, [userKey, stepKey]);

  const skip = useCallback(() => {
    localStorage.setItem(userKey, 'true');
    localStorage.setItem(stepKey, 'done');
    setStep('done');
  }, [userKey, stepKey]);

  return { step, isComplete: step === 'done', goNext, skip };
};
