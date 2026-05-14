import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './sparkline';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string;
  delta: number;
  trend: number[];
  icon: ReactNode;
  accent?: 'red' | 'orange' | 'amber' | 'neutral';
  index?: number;
};

const accents = {
  red: { stroke: '#ea384c', glow: 'rgba(234,56,76,0.18)' },
  orange: { stroke: '#f97316', glow: 'rgba(249,115,22,0.18)' },
  amber: { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.18)' },
  neutral: { stroke: '#9a9a9e', glow: 'rgba(154,154,158,0.12)' },
};

export function StatCard({ label, value, delta, trend, icon, accent = 'orange' }: Props) {
  const a = accents[accent];
  const positive = delta >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d10] p-5 transition hover:border-white/10">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition group-hover:opacity-100"
        style={{ background: a.glow }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/8 bg-white/[0.03] text-foreground/70 [&_svg]:h-4 [&_svg]:w-4">
            {icon}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
            positive
              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
              : 'border-rose-400/20 bg-rose-400/10 text-rose-300',
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? '+' : ''}
          {delta.toFixed(1)}%
        </span>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        <Sparkline data={trend} color={a.stroke} width={110} height={36} />
      </div>
    </div>
  );
}
