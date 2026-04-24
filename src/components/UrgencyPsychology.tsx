import React, { useEffect, useState } from 'react';
import { Clock, TrendingDown, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Urgency & Scarcity Psychology Components
 * Drives immediate action and conversion
 */

export interface UrgencyNotification {
  type: 'trial_expiry' | 'offer_ending' | 'threat_escalation' | 'behind_peers';
  message: string;
  urgency: 'high' | 'medium' | 'low';
  timeRemaining?: number; // milliseconds
  action: { label: string; href: string };
}

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function UrgencyBanner({
  notification,
}: {
  notification: UrgencyNotification;
}) {
  const [timeLeft, setTimeLeft] = useState(notification.timeRemaining || 0);

  useEffect(() => {
    if (!notification.timeRemaining) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [notification.timeRemaining]);

  const colorMap = {
    high: 'bg-brand-danger/20 border-brand-danger/40',
    medium: 'bg-brand-amber/20 border-brand-amber/40',
    low: 'bg-brand-purple/20 border-brand-purple/40',
  };

  const textColorMap = {
    high: 'text-brand-danger',
    medium: 'text-brand-amber',
    low: 'text-brand-purple',
  };

  const iconColorMap = {
    high: 'text-brand-danger',
    medium: 'text-brand-amber',
    low: 'text-brand-purple',
  };

  const icons = {
    trial_expiry: <Clock className={cn('h-5 w-5', iconColorMap[notification.urgency])} />,
    offer_ending: <Zap className={cn('h-5 w-5', iconColorMap[notification.urgency])} />,
    threat_escalation: <AlertCircle className={cn('h-5 w-5', iconColorMap[notification.urgency])} />,
    behind_peers: <TrendingDown className={cn('h-5 w-5', iconColorMap[notification.urgency])} />,
  };

  return (
    <div className={cn('card border flex items-center justify-between gap-4 px-4 py-3', colorMap[notification.urgency])}>
      <div className="flex items-center gap-3 flex-1">
        {icons[notification.type]}
        <div className="flex-1">
          <p className={cn('text-sm font-semibold', textColorMap[notification.urgency])}>
            {notification.message}
          </p>
          {timeLeft > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              {formatTimeRemaining(timeLeft)} remaining
            </p>
          )}
        </div>
      </div>
      <a
        href={notification.action.href}
        className={cn(
          'btn btn-sm whitespace-nowrap',
          notification.urgency === 'high' ? 'btn-danger' : 'btn-primary'
        )}
      >
        {notification.action.label}
      </a>
    </div>
  );
}

export function TrialCountdown({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, expiresAt.getTime() - Date.now())
  );
  const [expired, setExpired] = useState(timeLeft <= 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeLeft(remaining);
      setExpired(remaining <= 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const daysLeft = Math.floor(timeLeft / 86400000);
  const hoursLeft = Math.floor((timeLeft % 86400000) / 3600000);
  const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);

  if (expired) {
    return (
      <div className="card border border-brand-danger/40 bg-brand-danger/10 p-4 text-center">
        <p className="text-brand-danger font-semibold">Your trial has expired</p>
        <p className="text-sm text-slate-400 mt-1">Upgrade to Pro to continue</p>
      </div>
    );
  }

  return (
    <div className="card border border-brand-amber/40 bg-brand-amber/10 p-4">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">
          Trial expires in
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-amber">{daysLeft}</div>
            <div className="text-xs text-slate-400">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-amber">{hoursLeft}</div>
            <div className="text-xs text-slate-400">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-amber">{minutesLeft}</div>
            <div className="text-xs text-slate-400">Minutes</div>
          </div>
        </div>
        <a href="/pricing" className="btn btn-sm btn-primary mt-4 w-full">
          Upgrade Now
        </a>
      </div>
    </div>
  );
}

export function LimitedTimeOffer({
  originalPrice,
  discountedPrice,
  expiresAt,
  label = 'Limited Time Offer',
}: {
  originalPrice: number;
  discountedPrice: number;
  expiresAt: Date;
  label?: string;
}) {
  const discountPercent = Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100
  );
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, expiresAt.getTime() - Date.now())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, expiresAt.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);

  return (
    <div className="card border border-brand-danger/40 bg-gradient-to-r from-brand-danger/20 to-brand-amber/20 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-danger">
            {label}
          </p>
          <p className="text-xl font-bold text-white">
            Save {discountPercent}%
          </p>
          <p className="text-sm text-slate-300">
            <span className="line-through text-slate-500">₹{originalPrice}</span>
            {' → '}
            <span className="font-semibold text-brand-danger">₹{discountedPrice}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-brand-amber">
              {hoursLeft}:{minutesLeft.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-slate-400">left</div>
          </div>
          <a href="/pricing" className="btn btn-danger whitespace-nowrap">
            Lock In Price
          </a>
        </div>
      </div>
    </div>
  );
}

export function PeerComparisonWidget({
  yourScore,
  averageScore,
  percentile,
}: {
  yourScore: number;
  averageScore: number;
  percentile: number;
}) {
  const better = yourScore < averageScore; // lower ARS score is better
  const improvement = Math.abs(yourScore - averageScore);

  return (
    <div className="card border border-slate-700 p-4">
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
        How you compare
      </p>
      <div className="space-y-3">
        {/* Your Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300">Your ARS Score</span>
            <span className="font-mono font-bold text-white">{yourScore}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-success"
              style={{ width: `${Math.max(10, 100 - (yourScore * 100) / 100)}%` }}
            />
          </div>
        </div>

        {/* Average Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300">Industry Average</span>
            <span className="font-mono font-bold text-slate-400">{averageScore}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-600"
              style={{ width: `${Math.max(10, 100 - (averageScore * 100) / 100)}%` }}
            />
          </div>
        </div>

        {/* Insight */}
        <div className={cn(
          'mt-3 p-3 rounded-lg border',
          better
            ? 'bg-brand-success/10 border-brand-success/30'
            : 'bg-brand-danger/10 border-brand-danger/30'
        )}>
          <p className={cn(
            'text-sm font-semibold',
            better ? 'text-brand-success' : 'text-brand-danger'
          )}>
            {better
              ? `✓ You're ahead! ${improvement}pt better than average`
              : `⚠️ You're behind by ${improvement}pts. Time to act.`}
          </p>
          {!better && (
            <p className="text-xs text-slate-400 mt-2">
              Run a scan to improve your score. Deploy decoys to catch attackers before they cause damage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UrgencyBanner;
