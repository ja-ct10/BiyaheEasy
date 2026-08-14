'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Clock,
  Search,
  Star,
  Trash2,
  RotateCcw,
  MapPin,
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import { tripsService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import type { SavedTrip, TripHistory } from '@/types';

type Tab = 'saved' | 'history';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function TripsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('saved');
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTrips = async () => {
      try {
        const [saved, history] = await Promise.allSettled([
          tripsService.getSavedTrips(),
          tripsService.getTripHistory(),
        ]);

        if (saved.status === 'fulfilled') setSavedTrips(saved.value);
        if (history.status === 'fulfilled') setTripHistory(history.value);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const filteredSaved = savedTrips.filter((t) =>
    t.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = async (id: string) => {
    const trip = savedTrips.find((t) => t.id === id);
    if (!trip) return;

    const newFavorite = !trip.is_favorite;
    setSavedTrips((prev) => prev.map((t) => t.id === id ? { ...t, is_favorite: newFavorite } : t));

    try {
      await tripsService.toggleFavorite(id, newFavorite);
    } catch {
      // Revert on error
      setSavedTrips((prev) => prev.map((t) => t.id === id ? { ...t, is_favorite: !newFavorite } : t));
    }
  };

  const deleteTrip = async (id: string) => {
    const prev = savedTrips;
    setSavedTrips((trips) => trips.filter((t) => t.id !== id));

    try {
      await tripsService.deleteTrip(id);
    } catch {
      setSavedTrips(prev); // Revert on error
    }
  };

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
        className="px-4 md:px-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight">My Trips</h1>
          <p className="text-sm text-muted mt-0.5">Your saved routes and travel history</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex items-center gap-1 bg-surface border border-white/5 rounded-btn p-1 mb-5">
          <button onClick={() => setTab('saved')} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-input text-sm font-medium transition-colors', tab === 'saved' ? 'bg-accent/10 text-accent' : 'text-muted hover:text-white')}>
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />Saved
            <span className="px-1.5 py-0.5 rounded-full bg-surface-2 text-[10px] tabular-nums">{savedTrips.length}</span>
          </button>
          <button onClick={() => setTab('history')} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-input text-sm font-medium transition-colors', tab === 'history' ? 'bg-accent/10 text-accent' : 'text-muted hover:text-white')}>
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />History
            <span className="px-1.5 py-0.5 rounded-full bg-surface-2 text-[10px] tabular-nums">{tripHistory.length}</span>
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
              <div className="mb-4">
                <Input placeholder="Search saved trips..." icon={<Search className="w-4 h-4" strokeWidth={1.5} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="space-y-3">
                {filteredSaved.map((trip, idx) => (
                  <motion.div key={trip.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-sm font-medium text-white truncate">{trip.origin}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-xs text-muted truncate">{trip.destination}</p>
                          </div>
                        </div>
                        <button onClick={() => toggleFavorite(trip.id)} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors" aria-label="Toggle favorite">
                          <Star className={cn('w-4 h-4', trip.is_favorite ? 'fill-accent text-accent' : 'text-muted')} strokeWidth={1.5} />
                        </button>
                      </div>
                      {trip.route_data && (
                        <div className="flex items-center gap-3 mb-3 text-xs text-muted">
                          <span className="flex items-center gap-1"><Wallet className="w-3 h-3" strokeWidth={1.5} />{formatCurrency(trip.route_data.total_fare)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={1.5} />{trip.route_data.total_duration} min</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2">{trip.route_data.transfers} transfer{trip.route_data.transfers !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {trip.tags && trip.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3">
                          {trip.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-accent/5 border border-accent/10 text-[10px] text-accent/70">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />Reuse
                        </Button>
                        <button onClick={() => deleteTrip(trip.id)} className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors" aria-label="Delete">
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                {filteredSaved.length === 0 && (
                  <div className="text-center py-16">
                    <Bookmark className="w-10 h-10 text-muted/20 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-muted">No saved trips found</p>
                    <p className="text-xs text-muted/60 mt-1">Save routes from Plan Trip to see them here</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25 }}>
              {tripHistory.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-10 h-10 text-muted/20 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted">No trip history yet</p>
                  <p className="text-xs text-muted/60 mt-1">Completed trips will appear here</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tripHistory.map((trip, idx) => {
                    const date = new Date(trip.created_at);
                    return (
                      <motion.div key={trip.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-center min-w-[48px] p-2 rounded-lg bg-surface-2">
                              <p className="text-[10px] text-muted uppercase">{date.toLocaleDateString('en-PH', { month: 'short' })}</p>
                              <p className="text-base font-bold text-white tabular-nums">{date.getDate()}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="text-sm text-white truncate">{trip.origin}</p>
                                <span className="text-[10px] text-muted">to</span>
                                <p className="text-sm text-white truncate">{trip.destination}</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted">
                                <span className="md:hidden">{date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                                <span>{formatDuration(trip.duration)}</span>
                                {trip.transport_modes?.map((m) => (
                                  <span key={m} className="px-1.5 py-0.5 rounded bg-surface-2 uppercase font-medium">{m}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-accent tabular-nums">{formatCurrency(trip.fare)}</p>
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                {trip.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-green-400" strokeWidth={1.5} /> : <XCircle className="w-3 h-3 text-red-400" strokeWidth={1.5} />}
                                <span className={cn('text-[10px] capitalize', trip.status === 'completed' ? 'text-green-400' : 'text-red-400')}>{trip.status}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppShell>
  );
}
