'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, Target, PiggyBank, Bus, Train, Car, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';

const monthlyBudget = 3000;
const totalSpent = 1890;
const remaining = monthlyBudget - totalSpent;
const percentUsed = (totalSpent / monthlyBudget) * 100;

const breakdown = [
  { mode: 'MRT/LRT', icon: Train, amount: 840, trips: 30, color: '#10B981' },
  { mode: 'Jeepney', icon: Bus, amount: 520, trips: 40, color: '#F59E0B' },
  { mode: 'Bus', icon: Bus, amount: 380, trips: 12, color: '#3B82F6' },
  { mode: 'UV Express', icon: Car, amount: 150, trips: 3, color: '#EC4899' },
];

const weeklyData = [
  { label: 'W1', amount: 520 },
  { label: 'W2', amount: 480 },
  { label: 'W3', amount: 450 },
  { label: 'W4', amount: 440 },
];

export default function BudgetPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const dailyAvg = Math.round(totalSpent / 20);

  return (
    <AppShell>
      <div className="px-4 md:px-6 max-w-4xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-xl font-bold text-white">Budget</h1>
        </motion.div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 bg-surface border border-white/5 rounded-btn p-1 w-fit">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3.5 py-1.5 rounded-input text-xs font-medium transition-colors capitalize', period === p ? 'bg-accent/10 text-accent' : 'text-muted')}>{p}</button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card glow className="p-4 col-span-2 md:col-span-1">
            <Wallet className="w-4 h-4 text-accent mb-2" />
            <p className="text-xl font-bold text-white">{formatCurrency(totalSpent)}</p>
            <p className="text-[10px] text-muted">of {formatCurrency(monthlyBudget)}</p>
            <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${percentUsed}%` }} transition={{ duration: 1 }}
                className={cn('h-full rounded-full', percentUsed > 80 ? 'bg-red-400' : 'bg-accent')} />
            </div>
          </Card>
          <Card className="p-4">
            <PiggyBank className="w-4 h-4 text-green-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatCurrency(remaining)}</p>
            <p className="text-[10px] text-muted">Remaining</p>
          </Card>
          <Card className="p-4">
            <Target className="w-4 h-4 text-purple-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatCurrency(dailyAvg)}</p>
            <p className="text-[10px] text-muted">Daily Avg</p>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card hover={false} className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Transport Breakdown</h3>
          <div className="space-y-3.5">
            {breakdown.map((cat) => {
              const Icon = cat.icon;
              const pct = (cat.amount / totalSpent) * 100;
              return (
                <div key={cat.mode}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      <span className="text-sm text-white">{cat.mode}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Weekly Chart */}
        <Card hover={false} className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Comparison</h3>
          <div className="flex items-end gap-3 h-28">
            {weeklyData.map((w, i) => {
              const max = Math.max(...weeklyData.map((d) => d.amount));
              const h = (w.amount / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-accent font-medium">{formatCurrency(w.amount)}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full bg-accent/20 rounded-t-lg relative">
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-accent rounded-t" />
                  </motion.div>
                  <span className="text-[10px] text-muted">{w.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Insight */}
        <Card hover={false} className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Your spending decreased 8% this month</p>
              <p className="text-xs text-muted">You saved P165 by switching to MRT for your Cubao-Makati route.</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
