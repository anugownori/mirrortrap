import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

interface AttackVectorRadarProps {
  data?: Record<string, number>;
  className?: string;
}

const DEFAULT_DATA = {
  Network: 72,
  Social: 58,
  Physical: 24,
  Application: 85,
  'Supply Chain': 41,
};

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: { subject: string }; value: number }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 shadow-xl">
      <div className="text-xs text-text-muted">{payload[0].payload.subject}</div>
      <div className="font-mono text-lg font-bold text-indigo-400">{payload[0].value}</div>
      <div className="text-xs text-text-muted">risk score</div>
    </div>
  );
};

export function AttackVectorRadar({ data, className }: AttackVectorRadarProps) {
  const source = data ?? DEFAULT_DATA;
  const chartData = Object.entries(source).map(([key, value]) => ({
    subject: key,
    value,
  }));

  return (
    <div className={cn(className)}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Attack surface
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(99,102,241,0.15)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Attack Surface"
              dataKey="value"
              stroke="#6366F1"
              strokeWidth={2}
              fill="#6366F1"
              fillOpacity={0.15}
              dot={{ fill: '#6366F1', r: 3 }}
              isAnimationActive
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
