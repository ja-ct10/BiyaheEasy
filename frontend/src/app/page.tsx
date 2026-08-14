'use client';

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
  Download,
  TrendingDown,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { TRANSIT_STATUS } from '@/lib/constants';

const recentTrips = [
  { id: '1', origin: 'SM North EDSA', destination: 'Ayala Center, Makati', fare: 28, duration: 38, mode: 'MRT', time: '2 hours ago' },
  { id: '2', origin: 'Cubao', destination: 'BGC, Taguig', fare: 35, duration: 40, mode: 'MRT + Bus', time: 'Yesterday' },
  { id: '3', origin: 'Monumento', destination: 'Taft Avenue', fare: 35, duration: 19, mode: 'LRT', time: '2 days ago' },
];

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Commuter';

  return (
    <AppShell>
      <div className="px-4 md:px-6 space-y-5 max-w-6xl mx-auto">
        <InstallPrompt />

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-muted text-sm">Good morning,</p>
          <h1 className="text-xl md:text-h3 font-bold text-white">{firstName}</h1>
        </motion.div>

        {/* Quick Plan Trip Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link href="/plan">
            <Card glow className="p-5 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-card bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Navigation2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Plan a Trip</h3>
                    <p className="text-xs text-muted">Find the fastest route across Metro Manila</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="p-4 text-center">
            <Bookmark className="w-4 h-4 text-accent mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white">3</p>
            <p className="text-[10px] text-muted">Saved Trips</p>
          </Card>
          <Card className="p-4 text-center">
            <Wallet className="w-4 h-4 text-green-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white">{formatCurrency(1890)}</p>
            <p className="text-[10px] text-muted">This Month</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white">7</p>
            <p className="text-[10px] text-muted">Trips This Week</p>
          </Card>
        </motion.div>

        {/* Monthly Budget Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card hover={false} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Monthly Budget</h3>
              <Link href="/budget" className="text-xs text-accent hover:underline">View details</Link>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-white">{formatCurrency(1890)}</p>
                <p className="text-xs text-muted">of {formatCurrency(3000)} limit</p>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">8% less</span>
              </div>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '63%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-accent"
              />
            </div>
            <p className="text-[10px] text-muted mt-1.5">{formatCurrency(1110)} remaining</p>
          </Card>
        </motion.div>

        {/* Live Transit Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Train className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-white">Live Transit Status</h3>
            </div>
            <div className="space-y-2.5">
              {TRANSIT_STATUS.map((line) => (
                <div key={line.line} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {line.status === 'operational' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Recent Trips</h3>
            <Link href="/trips" className="text-xs text-accent hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {recentTrips.map((trip) => (
              <Card key={trip.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <p className="text-sm text-white truncate">{trip.origin}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-muted truncate">{trip.destination}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted">
                      <span>{trip.mode}</span>
                      <span>{formatDuration(trip.duration)}</span>
                      <span>{trip.time}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-accent">{formatCurrency(trip.fare)}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
