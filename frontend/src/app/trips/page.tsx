'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import type { SavedTrip, TripHistory } from '@/types';

const savedTrips: SavedTrip[] = [
  { id: '1', user_id: 'demo', origin: 'SM North EDSA, Quezon City', destination: 'Ayala Center, Makati', route_data: { steps: [], total_fare: 28, total_duration: 38, transfers: 0, walking_distance: 800, co2_estimate: 0.5, comfort_score: 7 }, preferences: { priority: 'fastest' }, tags: ['work', 'daily'], is_favorite: true, created_at: '2024-01-15T08:00:00Z' },
  { id: '2', user_id: 'demo', origin: 'Cubao, Quezon City', destination: 'BGC, Taguig', route_data: { steps: [], total_fare: 35, total_duration: 40, transfers: 1, walking_distance: 400, co2_estimate: 0.8, comfort_score: 6 }, preferences: { priority: 'cheapest' }, tags: ['meeting'], is_favorite: false, created_at: '2024-01-10T09:30:00Z' },
  { id: '3', user_id: 'demo', origin: 'Monumento, Caloocan', destination: 'Taft Avenue, Manila', route_data: { steps: [], total_fare: 35, total_duration: 19, transfers: 1, walking_distance: 300, co2_estimate: 0.4, comfort_score: 5 }, preferences: { priority: 'fastest' }, tags: ['school'], is_favorite: true, created_at: '2024-01-08T07:00:00Z' },
];

const tripHistory: TripHistory[] = [
  { id: '1', user_id: 'demo', origin: 'SM North EDSA', destination: 'Makati CBD', route_data: { steps: [], total_fare: 28, total_duration: 38, transfers: 0, walking_distance: 800, co2_estimate: 0.5, comfort_score: 7 }, fare: 28, duration: 38, status: 'completed', transport_modes: ['mrt', 'walk'], created_at: '2024-01-15T08:30:00Z' },
  { id: '2', user_id: 'demo', origin: 'Makati CBD', destination: 'SM North EDSA', route_data: { steps: [], total_fare: 28, total_duration: 40, transfers: 0, walking_distance: 800, co2_estimate: 0.5, comfort_score: 7 }, fare: 28, duration: 40, status: 'completed', transport_modes: ['mrt', 'walk'], created_at: '2024-01-15T17:45:00Z' },
  { id: '3', user_id: 'demo', origin: 'Cubao', destination: 'Ortigas Center', route_data: { steps: [], total_fare: 15, total_duration: 12, transfers: 0, walking_distance: 200, co2_estimate: 0.3, comfort_score: 6 }, fare: 15, duration: 12, status: 'completed', transport_modes: ['mrt'], created_at: '2024-01-14T09:00:00Z' },
  { id: '4', user_id: 'demo', origin: 'Quezon City', destination: 'Manila', route_data: { steps: [], total_fare: 13, total_duration: 50, transfers: 0, walking_distance: 100, co2_estimate: 0.9, comfort_score: 4 }, fare: 13, duration: 50, status: 'completed', transport_modes: ['jeepney'], created_at: '2024-01-13T07:30:00Z' },
  { id: '5', user_id: 'demo', origin: 'Monumento', destination: 'Taft Avenue', route_data: { steps: [], total_fare: 35, total_duration: 19, transfers: 1, walking_distance: 300, co2_estimate: 0.4, comfort_score: 5 }, fare: 35, duration: 19, status: 'completed', transport_modes: ['lrt', 'mrt'], created_at: '2024-01-11T06:30:00Z' },
  { id: '6', user_id: 'demo', origin: 'SM North EDSA', destination: 'Ayala Center', route_data: { steps: [], total_fare: 28, total_duration: 38, transfers: 0, walking_distance: 800, co2_estimate: 0.5, comfort_score: 7 }, fare: 28, duration: 38, status: 'cancelled', transport_modes: ['mrt', 'walk'], created_at: '2024-01-09T08:00:00Z' },
];

type Tab = 'saved' | 'history';

export default function TripsPage() {
  const [tab, setTab] = useState<Tab>('saved');
  const [trips, setTrips] = useState(savedTrips);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSaved = trips.filter((t) =>
    t.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = (id: string) => {
    setTrips((prev) => prev.map((t) => t.id === id ? { ...t, is_favorite: !t.is_favorite } : t));
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppShell>
      <div className="px-4 md:px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <h1 className="text-xl font-bold text-white">My Trips</h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface border border-white/5 rounded-btn p-1 mb-5">
          <button onClick={() => setTab('saved')} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-input text-sm font-medium transition-colors', tab === 'saved' ? 'bg-accent/10 text-accent' : 'text-muted')}>
            <Bookmark className="w-3.5 h-3.5" />Saved
          </button>
          <button onClick={() => setTab('history')} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-input text-sm font-medium transition-colors', tab === 'history' ? 'bg-accent/10 text-accent' : 'text-muted')}>
            <Clock className="w-3.5 h-3.5" />History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="mb-4">
                <Input placeholder="Search saved trips..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="space-y-3">
                {filteredSaved.map((trip) => (
                  <Card key={trip.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <p className="text-sm font-medium text-white truncate">{trip.origin}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                          <p className="text-xs text-muted truncate">{trip.destination}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleFavorite(trip.id)} aria-label="Toggle favorite">
                        <Star className={cn('w-4 h-4', trip.is_favorite ? 'fill-accent text-accent' : 'text-muted')} />
                      </button>
                    </div>
                    {trip.route_data && (
                      <div className="flex items-center gap-3 mb-2.5 text-xs text-muted">
                        <span className="flex items-center gap-1"><Wallet className="w-3 h-3" />{formatCurrency(trip.route_data.total_fare)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{trip.route_data.total_duration} min</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mb-3">
                      {trip.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-surface-2 text-[10px] text-muted">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
                      <Button variant="ghost" size="sm" className="flex-1"><RotateCcw className="w-3.5 h-3.5" />Reuse</Button>
                      <button onClick={() => deleteTrip(trip.id)} className="p-2 text-muted hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Card>
                ))}
                {filteredSaved.length === 0 && (
                  <div className="text-center py-12">
                    <Bookmark className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                    <p className="text-sm text-muted">No saved trips found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div className="space-y-2.5">
                {tripHistory.map((trip, idx) => {
                  const date = new Date(trip.created_at);
                  return (
                    <motion.div key={trip.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="hidden md:flex flex-col items-center min-w-[50px]">
                            <p className="text-[10px] text-muted">{date.toLocaleDateString('en-PH', { month: 'short' })}</p>
                            <p className="text-base font-bold text-white">{date.getDate()}</p>
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
                              {trip.transport_modes.map((m) => (
                                <span key={m} className="px-1.5 py-0.5 rounded bg-surface-2 uppercase">{m}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-accent">{formatCurrency(trip.fare)}</p>
                            <div className="flex items-center gap-1 justify-end">
                              {trip.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                              <span className={cn('text-[10px] capitalize', trip.status === 'completed' ? 'text-green-400' : 'text-red-400')}>{trip.status}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
