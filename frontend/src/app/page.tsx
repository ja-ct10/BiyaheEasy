'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin,
  Navigation2,
  Bookmark,
  Wallet,
  Clock,
  Train,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Route,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { TRANSIT_STATUS } from '@/lib/constants';
import { tripsService, budgetService } from '@/lib/services';
import type { TripHistory } from '@/types';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Commuter';

  const [recentTrips, setRecentTrips] = useState<TripHistory[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [budgetData, setBudgetData] = useState<{ totalSpent: number; budgetGoal?: { monthly_limit: number }; remaining?: number } | null>(null);
  const [weekTripCount, setWeekTripCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [history, saved, budget] = await Promise.allSettled([
          tripsService.getTripHistory(),
          tripsService.getSavedTrips(),
          budgetService.getSummary(),
        ]);

        if (history.status === 'fulfilled') {
          setRecentTrips(history.value.slice(0, 3));
          // Count trips from last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          setWeekTripCount(history.value.filter((t) => new Date(t.created_at) >= weekAgo).length);
        }

        if (saved.status === 'fulfilled') {
          setSavedCount(saved.value.length);
        }

        if (budget.status === 'fulfilled') {
          setBudgetData(budget.value);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalSpent = budgetData?.totalSpent ?? 0;
  const monthlyLimit = budgetData?.budgetGoal?.monthly_limit ?? 3000;
  const remaining = budgetData?.remaining ?? monthlyLimit - totalSpent;
  const percentUsed = monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0;

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <AppShell>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="px-4 md:px-6 space-y-6 max-w-6xl mx-auto"
      >
        <InstallPrompt />

        {/* Greeting + Quick Action */}
        <motion.div variants={fadeUp} className="flex items-end justify-between">
          <div>
            <p className="text-muted text-sm">{(() => {
              const hour = new Date().getHours();
              if (hour < 12) return 'Good morning,';
              if (hour < 18) return 'Good afternoon,';
              return 'Good evening,';
            })()}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{firstName}</h1>
          </div>
          <Link href="/plan">
            <Button size="sm" className="gap-2">
              <Navigation2 className="w-4 h-4" strokeWidth={1.5} />
              Plan Trip
            </Button>
          </Link>
        </motion.div>

        {/* Hero CTA - Asymmetric Layout */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Link href="/plan" className="md:col-span-3">
            <Card glow className="p-6 h-full cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Route className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Where are you headed?</h3>
                <p className="text-sm text-muted">Find the cheapest or fastest route across Metro Manila</p>
              </div>
              <ChevronRight className="absolute top-6 right-5 w-5 h-5 text-muted/40 group-hover:text-accent transition-colors" strokeWidth={1.5} />
            </Card>
          </Link>

          {/* Budget Summary - Compact */}
          <Link href="/budget" className="md:col-span-2">
            <Card className="p-5 h-full cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <Wallet className="w-4 h-4 text-accent" strokeWidth={1.5} />
                {percentUsed < 100 && (
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingDown className="w-3 h-3" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">On track</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-muted mt-0.5">of {formatCurrency(monthlyLimit)} this month</p>
              <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-1000" style={{ width: `${Math.min(percentUsed, 100)}%` }} />
              </div>
              <p className="text-[10px] text-muted mt-1.5">{formatCurrency(remaining)} remaining</p>
            </Card>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <Bookmark className="w-4 h-4 text-accent mb-2" strokeWidth={1.5} />
            <p className="text-xl font-bold text-white tabular-nums">{loading ? '-' : savedCount}</p>
            <p className="text-[10px] text-muted">Saved Trips</p>
          </Card>
          <Card className="p-4">
            <Clock className="w-4 h-4 text-blue-400 mb-2" strokeWidth={1.5} />
            <p className="text-xl font-bold text-white tabular-nums">{loading ? '-' : weekTripCount}</p>
            <p className="text-[10px] text-muted">This Week</p>
          </Card>
          <Card className="p-4">
            <Navigation2 className="w-4 h-4 text-green-400 mb-2" strokeWidth={1.5} />
            <p className="text-xl font-bold text-white tabular-nums">
              {loading ? '-' : recentTrips.length > 0 ? `${Math.round(recentTrips.reduce((s, t) => s + t.duration, 0) / recentTrips.length)}m` : '0m'}
            </p>
            <p className="text-[10px] text-muted">Avg Duration</p>
          </Card>
        </motion.div>

        {/* Transit Status */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Train className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">Live Transit</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 text-[10px] font-medium">Live</span>
            </div>
            <div className="space-y-2.5">
              {TRANSIT_STATUS.map((line) => (
                <div key={line.line} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {line.status === 'operational' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" strokeWidth={1.5} />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" strokeWidth={1.5} />
                    )}
                    <span className="text-sm text-white font-medium">{line.line}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted">{line.note}</span>
                    {line.delay > 0 && (
                      <span className="text-xs text-yellow-400 ml-2">+{line.delay}min</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Trips */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Recent Trips</h3>
            <Link href="/trips" className="text-xs text-accent hover:underline">See all</Link>
          </div>
          {recentTrips.length === 0 && !loading ? (
            <Card hover={false} className="p-8 text-center">
              <Navigation2 className="w-8 h-8 text-muted/30 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted">No trips yet</p>
              <p className="text-xs text-muted/60 mt-1">Plan your first trip to see it here</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentTrips.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05, duration: 0.35 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-sm text-white truncate">{trip.origin}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-xs text-muted truncate">{trip.destination}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted">
                          {trip.transport_modes?.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-surface-2 uppercase">{m}</span>
                          ))}
                          <span>{formatDuration(trip.duration)}</span>
                          <span>{getTimeAgo(trip.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-accent tabular-nums">{formatCurrency(trip.fare)}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
