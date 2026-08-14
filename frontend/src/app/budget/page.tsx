'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Target, PiggyBank, Bus, Train, Car, AlertCircle, Loader2, TrendingUp, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';
import { budgetService, type BudgetPeriod } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';

const modeIcons: Record<string, typeof Train> = {
  mrt: Train, lrt: Train, bus: Bus, jeepney: Bus, uv_express: Car, tricycle: Car, grab: Car,
};

const modeColors: Record<string, string> = {
  mrt: '#10B981', lrt: '#10B981', bus: '#3B82F6', jeepney: '#F59E0B', uv_express: '#EC4899', tricycle: '#8B5CF6', grab: '#EF4444',
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function BudgetPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(3000);
  const [tripCount, setTripCount] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [breakdown, setBreakdown] = useState<{ mode: string; amount: number; trips: number }[]>([]);
  const [chartData, setChartData] = useState<{ label: string; amount: number }[]>([]);

  const fetchBudgetData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [summary, chartBreakdown, transport] = await Promise.allSettled([
        budgetService.getSummary(period),
        period === 'daily'
          ? budgetService.getDailyBreakdown()
          : budgetService.getWeeklyBreakdown(),
        budgetService.getTransportBreakdown(),
      ]);

      if (summary.status === 'fulfilled') {
        setTotalSpent(summary.value.totalSpent);
        setTripCount(summary.value.tripCount);
        setDailyAverage(summary.value.dailyAverage);

        // Set budget limit based on period
        if (summary.value.budgetGoal) {
          switch (period) {
            case 'daily':
              setBudgetLimit(summary.value.budgetGoal.daily_limit || summary.value.budgetGoal.monthly_limit / 30);
              break;
            case 'weekly':
              setBudgetLimit(summary.value.budgetGoal.monthly_limit / 4);
              break;
            case 'monthly':
            default:
              setBudgetLimit(summary.value.budgetGoal.monthly_limit);
              break;
          }
        }
      }

      if (chartBreakdown.status === 'fulfilled') {
        setChartData(chartBreakdown.value);
      }

      if (transport.status === 'fulfilled') {
        setBreakdown(transport.value);
      }
    } catch (err) {
      console.error('Failed to fetch budget:', err);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const remaining = budgetLimit - totalSpent;
  const percentUsed = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

  const periodLabel = period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month';
  const periodBudgetLabel = period === 'daily' ? 'Daily Budget' : period === 'weekly' ? 'Weekly Budget' : 'Monthly Budget';

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="px-4 md:px-6 max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Budget</h1>
            <p className="text-sm text-muted mt-0.5">Track your commute spending</p>
          </div>
          <div className="flex items-center gap-1 bg-surface border border-white/5 rounded-btn p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn('px-3 py-1.5 rounded-input text-xs font-medium transition-colors capitalize', period === p ? 'bg-accent/10 text-accent' : 'text-muted hover:text-white')}>{p}</button>
            ))}
          </div>
        </motion.div>

        {/* Hero Budget Card */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Card glow className="p-6 md:col-span-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{periodLabel} Spend</span>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <p className="text-4xl font-bold text-white tabular-nums">{formatCurrency(totalSpent)}</p>
                <p className="text-sm text-muted mb-1">/ {formatCurrency(budgetLimit)}</p>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', percentUsed > 80 ? 'bg-red-400' : 'bg-accent')}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">{Math.round(percentUsed)}% of {periodBudgetLabel.toLowerCase()} used</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted" />
                  <span className="text-[10px] text-muted">{tripCount} trips</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-3">
            <Card className="p-4">
              <PiggyBank className="w-4 h-4 text-green-400 mb-2" strokeWidth={1.5} />
              <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(Math.max(remaining, 0))}</p>
              <p className="text-[10px] text-muted">Remaining</p>
              {remaining < 0 && (
                <p className="text-[10px] text-red-400 mt-0.5">Over budget by {formatCurrency(Math.abs(remaining))}</p>
              )}
            </Card>
            <Card className="p-4">
              <TrendingUp className="w-4 h-4 text-blue-400 mb-2" strokeWidth={1.5} />
              <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(dailyAverage)}</p>
              <p className="text-[10px] text-muted">Daily Average</p>
            </Card>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        {breakdown.length > 0 && (
          <motion.div variants={fadeUp}>
            <Card hover={false} className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Transport Breakdown</h3>
              <div className="space-y-4">
                {breakdown.map((cat) => {
                  const Icon = modeIcons[cat.mode] || Bus;
                  const color = modeColors[cat.mode] || '#94A3B8';
                  const pct = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0;
                  return (
                    <div key={cat.mode}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.5} />
                          </div>
                          <div>
                            <span className="text-sm text-white font-medium capitalize">{cat.mode.replace('_', ' ')}</span>
                            <p className="text-[10px] text-muted">{cat.trips} trips</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(cat.amount)}</span>
                          <p className="text-[10px] text-muted">{Math.round(pct)}%</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden ml-10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div variants={fadeUp}>
            <Card hover={false} className="p-5">
              <h3 className="text-sm font-semibold text-white mb-5">
                {period === 'daily' ? 'Last 7 Days' : 'Weekly Comparison'}
              </h3>
              <div className="flex items-end gap-3 h-32">
                {chartData.map((w, i) => {
                  const max = Math.max(...chartData.map((d) => d.amount));
                  const h = max > 0 ? (w.amount / max) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-accent font-medium tabular-nums">
                        {w.amount > 0 ? formatCurrency(w.amount) : '—'}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(h, 2)}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                        className="w-full bg-gradient-to-t from-accent/30 to-accent/10 rounded-lg relative min-h-[2px]"
                      >
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-accent rounded-full" />
                      </motion.div>
                      <span className="text-[10px] text-muted font-medium">{w.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty state */}
        {totalSpent === 0 && (
          <motion.div variants={fadeUp}>
            <Card hover={false} className="p-8 text-center">
              <Wallet className="w-10 h-10 text-muted/20 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted">No spending data for {periodLabel.toLowerCase()}</p>
              <p className="text-xs text-muted/60 mt-1">Complete trips to see your budget breakdown</p>
            </Card>
          </motion.div>
        )}

        {/* Insight */}
        {totalSpent > 0 && (
          <motion.div variants={fadeUp}>
            <Card hover={false} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {percentUsed > 80 ? `Getting close to your ${periodBudgetLabel.toLowerCase()} limit` : `You're on track ${periodLabel.toLowerCase()}`}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {percentUsed > 80
                      ? `Only ${formatCurrency(Math.max(remaining, 0))} left for the rest of the ${period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}`
                      : `${formatCurrency(remaining)} remaining${period === 'monthly' ? ` with ${30 - new Date().getDate()} days left` : ''}`
                    }
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}
