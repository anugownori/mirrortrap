import React, { useEffect, useState } from 'react';
import { Check, Star, Heart, Zap, Award, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Achievement System Component
 * Implements gamification psychology to drive engagement
 */

export type AchievementType =
  | 'first_scan'
  | 'scan_master'
  | 'decoy_deployer'
  | 'attack_defender'
  | 'pro_subscriber'
  | 'team_builder'
  | 'streak_warrior'
  | 'threat_analyst';

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  points: number;
}

const ACHIEVEMENTS: Record<AchievementType, Omit<Achievement, 'unlockedAt'>> = {
  first_scan: {
    id: 'first_scan',
    title: 'Scout',
    description: 'Completed your first OSINT scan',
    icon: <Radar className="h-5 w-5" />,
    rarity: 'common',
    requirement: 'Run 1 scan',
    points: 10,
  },
  scan_master: {
    id: 'scan_master',
    title: 'Threat Hunter',
    description: 'Completed 10 scans and identified threats',
    icon: <TrendingUp className="h-5 w-5" />,
    rarity: 'rare',
    requirement: 'Run 10 scans',
    points: 50,
  },
  decoy_deployer: {
    id: 'decoy_deployer',
    title: 'Phantom Master',
    description: 'Deployed all 4 PhantomShield decoys',
    icon: <Zap className="h-5 w-5" />,
    rarity: 'epic',
    requirement: 'Deploy all 4 decoys',
    points: 100,
  },
  attack_defender: {
    id: 'attack_defender',
    title: 'Zero-Day Defender',
    description: 'Caught 5 real attacks in your honeypots',
    icon: <Award className="h-5 w-5" />,
    rarity: 'legendary',
    requirement: 'Catch 5 attacks',
    points: 250,
  },
  pro_subscriber: {
    id: 'pro_subscriber',
    title: 'Pro Guardian',
    description: 'Upgraded to Pro and unlocked unlimited scans',
    icon: <Star className="h-5 w-5" />,
    rarity: 'rare',
    requirement: 'Subscribe to Pro',
    points: 75,
  },
  team_builder: {
    id: 'team_builder',
    title: 'Team Lead',
    description: 'Invited 5+ team members to MirrorTrap',
    icon: <Users className="h-5 w-5" />,
    rarity: 'epic',
    requirement: 'Invite 5 team members',
    points: 150,
  },
  streak_warrior: {
    id: 'streak_warrior',
    title: 'Daily Vigilant',
    description: 'Logged in for 30 consecutive days',
    icon: <Heart className="h-5 w-5" />,
    rarity: 'epic',
    requirement: '30-day streak',
    points: 200,
  },
  threat_analyst: {
    id: 'threat_analyst',
    title: 'Elite Analyst',
    description: 'Pro subscriber for 90+ days with 50+ insights generated',
    icon: <Check className="h-5 w-5" />,
    rarity: 'legendary',
    requirement: '90 days active + 50 insights',
    points: 300,
  },
};

const rarityColors = {
  common: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/40',
    text: 'text-slate-300',
    icon: 'text-slate-400',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    icon: 'text-blue-400',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    icon: 'text-purple-400',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    icon: 'text-amber-400',
  },
} as const;

export function AchievementBadge({
  achievement,
  unlocked = false,
  size = 'md',
}: {
  achievement: Achievement;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const colors = rarityColors[achievement.rarity];
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border backdrop-blur-sm transition-all',
        colors.bg,
        colors.border,
        unlocked ? 'scale-100 opacity-100' : 'scale-95 opacity-50 grayscale',
        sizeClasses[size]
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={cn('rounded-full p-2', colors.bg, colors.border, 'border')}>
          <div className={cn(colors.icon)}>{achievement.icon}</div>
        </div>
        <div>
          <div className={cn('font-semibold', colors.text)}>{achievement.title}</div>
          <div className="text-xs text-slate-400">{achievement.description}</div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-current text-amber-500" />
          <span className="text-xs font-mono text-slate-300">+{achievement.points} pts</span>
        </div>
      </div>
    </div>
  );
}

export function AchievementShowcase({
  unlockedIds = [],
}: {
  unlockedIds?: AchievementType[];
}) {
  const [hoveredId, setHoveredId] = useState<AchievementType | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Your Achievements</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
          {Object.values(ACHIEVEMENTS).map((achievement) => (
            <div
              key={achievement.id}
              className="relative"
              onMouseEnter={() => setHoveredId(achievement.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <AchievementBadge
                achievement={{
                  ...achievement,
                  unlockedAt: unlockedIds.includes(achievement.id) ? new Date() : undefined,
                }}
                unlocked={unlockedIds.includes(achievement.id)}
                size="md"
              />
              {hoveredId === achievement.id && (
                <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 transform rounded-lg bg-slate-900 p-3 text-xs text-slate-300 shadow-lg z-10">
                  {achievement.requirement}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rarity Legend */}
      <div className="grid grid-cols-2 gap-3 pt-4 md:grid-cols-4">
        {Object.entries(rarityColors).map(([rarity, colors]) => (
          <div key={rarity} className="flex items-center gap-2">
            <div className={cn('h-3 w-3 rounded-full', colors.bg, colors.border, 'border')} />
            <span className="text-xs capitalize text-slate-400">{rarity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Import Radar from lucide
import { Radar } from 'lucide-react';

export default ACHIEVEMENTS;
