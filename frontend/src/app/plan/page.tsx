'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation2,
  Clock,
  ArrowUpDown,
  Locate,
  Bus,
  Train,
  Car,
  Bike,
  Footprints,
  ChevronDown,
  ChevronUp,
  Leaf,
  Accessibility,
  Wind,
  Users,
  Sparkles,
  ListFilter,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { TRANSPORT_MODES, PRIORITY_OPTIONS, POPULAR_LOCATIONS } from '@/lib/constants';
import { cn, formatCurrency, formatDuration, formatDistance } from '@/lib/utils';
import { routesService, tripsService } from '@/lib/services';
import type { Route } from '@/types';

const planSchema = z.object({
  origin: z.string().min(3, 'Enter a valid origin'),
  destination: z.string().min(3, 'Enter a valid destination'),
  departure_time: z.string().optional(),
  arrival_by: z.string().optional(),
  budget_limit: z.number().min(0).optional(),
  max_walking: z.number().min(0).max(3000).optional(),
  priority: z.enum(['cheapest', 'fastest', 'fewest-transfers', 'comfortable']),
  transport_modes: z.array(z.string()).min(1, 'Select at least one mode'),
});

type PlanFormData = z.infer<typeof planSchema>;

const modeIcons: Record<string, typeof Train> = {
  mrt: Train, lrt: Train, bus: Bus, jeepney: Bus, 'uv-express': Car, uv_express: Car, tricycle: Bike, walk: Footprints, grab: Car,
};

type TabId = 'plan' | 'customize' | 'results';

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState<TabId>('plan');
  const [loading, setLoading] = useState(false);
  const [preferredRoutes, setPreferredRoutes] = useState<Route[]>([]);
  const [otherRoutes, setOtherRoutes] = useState<Route[]>([]);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [planOrigin, setPlanOrigin] = useState('');
  const [planDestination, setPlanDestination] = useState('');
  const [error, setError] = useState('');

  // Customize state
  const [walkingDistance, setWalkingDistance] = useState(1000);
  const [budgetMax, setBudgetMax] = useState(200);
  const [transferTolerance, setTransferTolerance] = useState(3);
  const [accessibilityFriendly, setAccessibilityFriendly] = useState(false);
  const [airConditionedOnly, setAirConditionedOnly] = useState(false);
  const [avoidCrowded, setAvoidCrowded] = useState(false);

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      priority: 'fastest',
      transport_modes: ['jeepney', 'bus', 'mrt', 'walk'],
      max_walking: 1000,
    },
  });

  const origin = watch('origin');
  const destination = watch('destination');
  const selectedModes = watch('transport_modes');
  const selectedPriority = watch('priority');
  const departureTime = watch('departure_time');
  const arrivalBy = watch('arrival_by');

  const swapLocations = () => {
    const o = origin; const d = destination;
    setValue('origin', d || ''); setValue('destination', o || '');
  };

  const totalRoutes = preferredRoutes.length + otherRoutes.length;

  const onSubmit = async (_data: PlanFormData) => {
    setLoading(true);
    setError('');
    try {
      const result = await routesService.generateRoutes(
        _data.origin,
        _data.destination,
        {
          transport_modes: _data.transport_modes,
          priority: _data.priority === 'fewest-transfers' ? 'fewest-transfers' : _data.priority,
          budget_limit: budgetMax > 0 ? budgetMax : undefined,
          departure_time: _data.departure_time,
          arrival_by: _data.arrival_by,
        }
      );
      setPreferredRoutes(result.preferred || []);
      setOtherRoutes(result.other_suggestions || []);
      setPlanOrigin(_data.origin);
      setPlanDestination(_data.destination);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async (route: Route) => {
    try {
      await tripsService.saveTrip({
        origin: planOrigin,
        destination: planDestination,
        route_data: route,
        preferences: { priority: selectedPriority, transport_modes: selectedModes },
      });
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  const filteredLocations = (query: string) =>
    POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes((query || '').toLowerCase())).slice(0, 5);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'plan', label: 'Plan' },
    { id: 'customize', label: 'Customize' },
    { id: 'results', label: 'Results' },
  ];

  const renderRouteCard = (route: Route, idx: number, isPreferred: boolean) => (
    <motion.div key={route.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
      <div className={cn('bg-surface border rounded-card overflow-hidden', isPreferred ? 'border-accent/20' : 'border-white/5')}>
        <div className="p-4 cursor-pointer" onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id!)}>
          <div className="flex items-center gap-2 mb-3">
            {isPreferred && idx === 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />Best Match
              </span>
            )}
            {!isPreferred && (
              <span className="px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 text-[10px] font-medium">Alternative</span>
            )}
            {route.steps.filter(s => s.mode !== 'walk').map((step, i) => {
              const Icon = modeIcons[step.mode] || Footprints;
              return <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-muted">
                <Icon className="w-3 h-3" />{step.mode.toUpperCase()}
              </span>;
            })}
            <div className="ml-auto">
              {expandedRoute === route.id ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><p className="text-xs text-muted">Fare</p><p className="text-sm font-bold text-accent">{formatCurrency(route.total_fare)}</p></div>
            <div><p className="text-xs text-muted">Time</p><p className="text-sm font-bold text-white">{formatDuration(route.total_duration)}</p></div>
            <div><p className="text-xs text-muted">Transfers</p><p className="text-sm font-bold text-white">{route.transfers}</p></div>
            <div><p className="text-xs text-muted">Comfort</p><p className="text-sm font-bold text-white">{route.comfort_score}/10</p></div>
          </div>
        </div>
        <AnimatePresence>
          {expandedRoute === route.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2">
                {route.steps.map((step, si) => {
                  const Icon = modeIcons[step.mode] || Footprints;
                  return (
                    <div key={si} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-accent" /></div>
                      <div className="flex-1"><p className="text-xs text-white capitalize">{step.mode}</p><p className="text-[10px] text-muted">{step.from} → {step.to}</p></div>
                      <div className="text-right"><p className="text-xs text-white">{step.fare > 0 ? formatCurrency(step.fare) : 'Free'}</p><p className="text-[10px] text-muted">{step.duration}m</p></div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-muted"><Leaf className="w-3 h-3" />{route.co2_estimate}kg CO2</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted"><Footprints className="w-3 h-3" />{formatDistance(route.walking_distance)}</div>
                  <Button size="sm" className="ml-auto" onClick={() => handleSaveTrip(route)}>Save Trip</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <AppShell>
      <div className="px-4 md:px-6 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight">Plan Trip</h1>
          <p className="text-sm text-muted mt-0.5">Find your best route across Metro Manila</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface border border-white/5 rounded-btn p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2 rounded-input text-sm font-medium transition-colors',
                activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-muted hover:text-white'
              )}
            >
              {tab.label}
              {tab.id === 'results' && totalRoutes > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent/20 text-[10px]">{totalRoutes}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-btn bg-red-400/10 border border-red-400/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                {/* Origin & Destination */}
                <Card hover={false} className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-3">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="w-0.5 h-14 bg-white/10 my-1" />
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                    </div>
                    <div className="flex-1 space-y-2.5">
                      <div className="relative">
                        <Input
                          {...register('origin')}
                          placeholder="Where from?"
                          error={errors.origin?.message}
                          icon={<MapPin className="w-4 h-4" />}
                          onFocus={() => setShowOriginSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                        />
                        <AnimatePresence>
                          {showOriginSuggestions && filteredLocations(origin).length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                              className="absolute z-20 top-full mt-1 w-full bg-surface-2 border border-white/10 rounded-input overflow-hidden shadow-lg"
                            >
                              {filteredLocations(origin).map((loc) => (
                                <button key={loc} type="button" onMouseDown={() => setValue('origin', loc)}
                                  className="w-full px-3 py-2 text-left text-sm text-muted hover:text-white hover:bg-white/5">{loc}</button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="relative">
                        <Input
                          {...register('destination')}
                          placeholder="Where to?"
                          error={errors.destination?.message}
                          icon={<Navigation2 className="w-4 h-4" />}
                          onFocus={() => setShowDestSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                        />
                        <AnimatePresence>
                          {showDestSuggestions && filteredLocations(destination).length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                              className="absolute z-20 top-full mt-1 w-full bg-surface-2 border border-white/10 rounded-input overflow-hidden shadow-lg"
                            >
                              {filteredLocations(destination).map((loc) => (
                                <button key={loc} type="button" onMouseDown={() => setValue('destination', loc)}
                                  className="w-full px-3 py-2 text-left text-sm text-muted hover:text-white hover:bg-white/5">{loc}</button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-3">
                      <button type="button" onClick={swapLocations} className="p-2 rounded-btn bg-surface-2 text-muted hover:text-white" aria-label="Swap">
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setValue('origin', 'Current Location')} className="p-2 rounded-btn bg-surface-2 text-muted hover:text-accent" aria-label="Current location">
                        <Locate className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Time - Using DateTimePicker */}
                <Card hover={false} className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <DateTimePicker
                      label="Depart at"
                      value={departureTime}
                      onChange={(val) => setValue('departure_time', val)}
                      placeholder="Select departure"
                    />
                    <DateTimePicker
                      label="Arrive by"
                      value={arrivalBy}
                      onChange={(val) => setValue('arrival_by', val)}
                      placeholder="Select arrival"
                    />
                  </div>
                </Card>

                {/* Transport Modes */}
                <Card hover={false} className="p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Transport</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {TRANSPORT_MODES.map((mode) => (
                      <label key={mode.id} className={cn(
                        'flex items-center gap-2 p-2.5 rounded-btn border cursor-pointer text-xs font-medium transition-colors',
                        selectedModes?.includes(mode.id) ? 'bg-accent/10 border-accent/30 text-white' : 'bg-surface-2 border-white/5 text-muted'
                      )}>
                        <input type="checkbox" value={mode.id} {...register('transport_modes')} className="sr-only" />
                        {mode.label}
                      </label>
                    ))}
                  </div>
                </Card>

                {/* Priority */}
                <Card hover={false} className="p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Priority</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <label key={opt.id} className={cn(
                        'p-2.5 rounded-btn border text-center cursor-pointer transition-colors',
                        selectedPriority === opt.id ? 'bg-accent/10 border-accent/30' : 'bg-surface-2 border-white/5'
                      )}>
                        <input type="radio" value={opt.id} {...register('priority')} className="sr-only" />
                        <p className={cn('text-xs font-medium', selectedPriority === opt.id ? 'text-accent' : 'text-white')}>{opt.label}</p>
                      </label>
                    ))}
                  </div>
                </Card>

                <Button type="submit" loading={loading} size="lg" className="w-full">
                  <Navigation2 className="w-4 h-4" />
                  Generate Routes
                </Button>
              </form>
            </motion.div>
          )}

          {activeTab === 'customize' && (
            <motion.div key="customize" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              {/* Budget */}
              <Card hover={false} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Max Fare Per Trip</h3>
                  <span className="text-sm text-accent font-medium">{formatCurrency(budgetMax)}</span>
                </div>
                <input type="range" min={0} max={500} step={10} value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-accent" />
                <div className="flex justify-between text-[10px] text-muted mt-1"><span>₱0</span><span>₱500</span></div>
                <p className="text-[10px] text-muted/60 mt-2">Routes within this budget will be prioritized first. Others will show as suggestions.</p>
              </Card>

              {/* Walking */}
              <Card hover={false} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Max Walking Distance</h3>
                  <span className="text-sm text-accent font-medium">{walkingDistance}m</span>
                </div>
                <input type="range" min={100} max={3000} step={100} value={walkingDistance} onChange={(e) => setWalkingDistance(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-accent" />
                <div className="flex justify-between text-[10px] text-muted mt-1"><span>100m</span><span>3km</span></div>
              </Card>

              {/* Transfers */}
              <Card hover={false} className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Transfer Tolerance</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setTransferTolerance(n)}
                      className={cn('w-10 h-10 rounded-btn border text-sm font-medium transition-all',
                        transferTolerance >= n ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-surface-2 border-white/5 text-muted'
                      )}>{n}</button>
                  ))}
                </div>
              </Card>

              {/* Toggles */}
              <Card hover={false} className="p-5 space-y-3">
                {[
                  { state: accessibilityFriendly, setter: setAccessibilityFriendly, label: 'Accessibility Friendly', icon: Accessibility },
                  { state: airConditionedOnly, setter: setAirConditionedOnly, label: 'Air-Conditioned Only', icon: Wind },
                  { state: avoidCrowded, setter: setAvoidCrowded, label: 'Avoid Crowded Routes', icon: Users },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between p-3 rounded-btn bg-surface-2 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-white">{item.label}</span>
                    </div>
                    <div className="relative">
                      <input type="checkbox" checked={item.state} onChange={(e) => item.setter(e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-5 bg-surface rounded-full peer peer-checked:bg-accent/30 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-muted rounded-full peer-checked:translate-x-5 peer-checked:bg-accent transition-all" />
                    </div>
                  </label>
                ))}
              </Card>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {totalRoutes === 0 ? (
                <div className="text-center py-16">
                  <Navigation2 className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                  <p className="text-sm text-muted">No routes generated yet.</p>
                  <p className="text-xs text-muted/60 mt-1">Fill in your trip details and tap Generate Routes.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Preferred Routes Section */}
                  {preferredRoutes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <h3 className="text-sm font-semibold text-white">Best for You</h3>
                        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                          {preferredRoutes.length} {preferredRoutes.length === 1 ? 'route' : 'routes'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-3">
                        Matches your preferences: {selectedPriority} priority
                        {budgetMax > 0 && `, within ₱${budgetMax}`}
                      </p>
                      <div className="space-y-3">
                        {preferredRoutes.map((route, idx) => renderRouteCard(route, idx, true))}
                      </div>
                    </div>
                  )}

                  {/* Other Suggestions Section */}
                  {otherRoutes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ListFilter className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                        <h3 className="text-sm font-semibold text-white">Other Suggestions</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 text-[10px] font-medium">
                          {otherRoutes.length} {otherRoutes.length === 1 ? 'route' : 'routes'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-3">
                        These routes don&apos;t match all your criteria but might still work
                      </p>
                      <div className="space-y-3">
                        {otherRoutes.map((route, idx) => renderRouteCard(route, idx, false))}
                      </div>
                    </div>
                  )}

                  {/* Show message if only preferred and no others */}
                  {preferredRoutes.length > 0 && otherRoutes.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted">All routes match your preferences perfectly.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
