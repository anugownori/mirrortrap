import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, Sparkles, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Onboarding Psychology Component
 * Guided first-time user experience with psychological hooks
 */

export type OnboardingStep = 'scan' | 'results' | 'decoy' | 'celebrate' | 'invite';

export interface OnboardingContext {
  currentStep: OnboardingStep;
  scanCompleted: boolean;
  threatsFound: number;
  arsScore: number;
  decoysDeployed: number;
}

const STEP_FLOW = {
  scan: {
    title: 'See Yourself Through Hackers\' Eyes',
    subtitle: 'Your first OSINT scan takes 2 minutes',
    description:
      'We\'ll scan 5 sources (HaveIBeenPwned, Shodan, crt.sh, GitHub, DNS) to reveal what attackers already know about you.',
    cta: 'Start Scan',
    psychology: 'Achievement unlock (Scout badge)',
    icon: <Target className="h-12 w-12" />,
  },
  results: {
    title: 'Your Threat Landscape',
    subtitle: 'Here\'s what we found',
    description:
      'This is your ARS Score — a single number representing your attack surface risk. Lower is better.',
    cta: 'See Your Score',
    psychology: 'Loss aversion (threat visualization)',
    icon: <AlertCircle className="h-12 w-12" />,
  },
  decoy: {
    title: 'Deploy Your First Decoy',
    subtitle: 'Catch them before they escape',
    description:
      'Set a PhantomShield trap. When attackers touch it, you\'ll know. Instantly. Real alerts, not noise.',
    cta: 'Deploy Decoy',
    psychology: 'Sense of control + agency',
    icon: <Sparkles className="h-12 w-12" />,
  },
  celebrate: {
    title: '✓ You\'re Protected Now',
    subtitle: 'One decoy deployed',
    description:
      'You\'ve taken your first real step toward threat detection. 3 more decoys available. Deploy all 4 to unlock Phantom Master badge.',
    cta: 'Deploy More Decoys',
    psychology: 'Achievement loop + gamification',
    icon: <CheckCircle2 className="h-12 w-12 text-brand-success" />,
  },
  invite: {
    title: 'Bring Your Team On Board',
    subtitle: 'Strength in numbers',
    description:
      'Team members see the same threats. Together, you respond faster. One person invites 4 teammates and unlocks Team Lead badge.',
    cta: 'Invite Team',
    psychology: 'Social proof + team efficacy',
    icon: <Users className="h-12 w-12" />,
  },
};

export function OnboardingCard({ step, context }: { step: OnboardingStep; context: OnboardingContext }) {
  const config = STEP_FLOW[step];

  const getProgressPercentage = (): number => {
    const steps: OnboardingStep[] = ['scan', 'results', 'decoy', 'celebrate', 'invite'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="card p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Progress
          </span>
          <span className="text-xs text-slate-400">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-purple to-brand-success transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Icon & Heading */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4 text-brand-purple">
          {config.icon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
        <p className="text-sm text-slate-400">{config.subtitle}</p>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-center mb-6 leading-relaxed">{config.description}</p>

      {/* Context-Specific Stats */}
      {step === 'results' && context.scanCompleted && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
            <div className="text-2xl font-bold text-brand-danger">{context.threatsFound}</div>
            <div className="text-xs text-slate-400 mt-1">Threats Found</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
            <div className="text-2xl font-bold text-brand-amber">{context.arsScore}</div>
            <div className="text-xs text-slate-400 mt-1">ARS Score</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
            <div className="text-2xl font-bold text-brand-amber">2.4h</div>
            <div className="text-xs text-slate-400 mt-1">Time-to-Exploit</div>
          </div>
        </div>
      )}

      {step === 'celebrate' && (
        <div className="bg-brand-success/10 border border-brand-success/30 rounded-lg p-4 mb-6 text-center">
          <div className="text-lg font-semibold text-brand-success mb-2">
            🎉 Achievement Unlocked: Scout
          </div>
          <p className="text-sm text-slate-300">
            You\'ve completed your first scan. +10 points earned.
          </p>
        </div>
      )}

      {step === 'decoy' && (
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-brand-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Fake AWS Key:</span> Attackers' favorite. Instant alert when used.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-brand-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Admin Portal:</span> Honey trap. See who tries to log in.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-brand-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Tracking URL:</span> See who clicks. Get their IP, browser, location.
            </p>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button className={cn(
        'w-full btn btn-lg flex items-center justify-center gap-2',
        step === 'results' || step === 'decoy' || step === 'invite'
          ? 'btn-primary'
          : 'btn-success'
      )}>
        {config.cta}
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Psychology Label */}
      <p className="text-xs text-slate-500 text-center mt-4">
        💭 {config.psychology}
      </p>
    </div>
  );
}

export function OnboardingChecklist({
  completed = [],
}: {
  completed?: OnboardingStep[];
}) {
  const steps: OnboardingStep[] = ['scan', 'results', 'decoy', 'celebrate', 'invite'];

  return (
    <div className="card p-6 max-w-md">
      <h3 className="text-lg font-semibold text-white mb-4">Your Onboarding Progress</h3>
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center gap-3">
            {completed.includes(step) ? (
              <div className="h-6 w-6 rounded-full bg-brand-success/20 border border-brand-success flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-brand-success" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
              </div>
            )}
            <span className={cn(
              'text-sm font-medium',
              completed.includes(step) ? 'text-slate-300' : 'text-slate-400'
            )}>
              {STEP_FLOW[step as OnboardingStep].title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OnboardingGradient() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-success/20 to-brand-purple/20 blur-3xl" />
      <div className="relative p-12 text-center">
        <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">
          Welcome to MirrorTrap
        </p>
        <h1 className="text-3xl font-bold text-white mb-4">
          You're 5 minutes from perfect visibility
        </h1>
        <p className="text-slate-300 max-w-lg mx-auto mb-6">
          See what attackers see. Catch them before they act. It starts with one scan.
        </p>
      </div>
    </div>
  );
}

export default STEP_FLOW;
