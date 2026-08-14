'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronUp, ChevronDown, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  mode?: 'time' | 'datetime';
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  mode = 'time',
  placeholder = 'Select time',
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(7);
  const [minutes, setMinutes] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (h >= 12) {
          setAmpm('PM');
          if (h > 12) h -= 12;
        } else {
          setAmpm('AM');
          if (h === 0) h = 12;
        }
        setHours(h);
        setMinutes(m);
      }
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateValue = (h: number, m: number, period: 'AM' | 'PM') => {
    let hour24 = h;
    if (period === 'PM' && h !== 12) hour24 = h + 12;
    if (period === 'AM' && h === 12) hour24 = 0;
    const timeStr = `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    onChange(timeStr);
  };

  const incrementHour = () => {
    const newHours = hours >= 12 ? 1 : hours + 1;
    setHours(newHours);
    updateValue(newHours, minutes, ampm);
  };

  const decrementHour = () => {
    const newHours = hours <= 1 ? 12 : hours - 1;
    setHours(newHours);
    updateValue(newHours, minutes, ampm);
  };

  const incrementMinute = () => {
    const newMinutes = minutes >= 55 ? 0 : minutes + 5;
    setMinutes(newMinutes);
    updateValue(hours, newMinutes, ampm);
  };

  const decrementMinute = () => {
    const newMinutes = minutes <= 0 ? 55 : minutes - 5;
    setMinutes(newMinutes);
    updateValue(hours, newMinutes, ampm);
  };

  const toggleAmPm = () => {
    const newPeriod = ampm === 'AM' ? 'PM' : 'AM';
    setAmpm(newPeriod);
    updateValue(hours, minutes, newPeriod);
  };

  const quickTimes = [
    { label: '6:00 AM', h: 6, m: 0, p: 'AM' as const },
    { label: '7:00 AM', h: 7, m: 0, p: 'AM' as const },
    { label: '8:00 AM', h: 8, m: 0, p: 'AM' as const },
    { label: '9:00 AM', h: 9, m: 0, p: 'AM' as const },
    { label: '12:00 PM', h: 12, m: 0, p: 'PM' as const },
    { label: '5:00 PM', h: 5, m: 0, p: 'PM' as const },
    { label: '6:00 PM', h: 6, m: 0, p: 'PM' as const },
    { label: '7:00 PM', h: 7, m: 0, p: 'PM' as const },
  ];

  const displayValue = value
    ? `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
    : '';

  // Generate calendar dates for current month
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-xs text-muted font-medium mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-input',
          'bg-surface-2 border border-white/5 text-left',
          'hover:border-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20',
          'transition-colors outline-none',
          isOpen && 'border-accent/50 ring-1 ring-accent/20'
        )}
      >
        <Clock className="w-4 h-4 text-muted flex-shrink-0" strokeWidth={1.5} />
        <span className={cn('text-sm flex-1', displayValue ? 'text-white' : 'text-muted')}>
          {displayValue || placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setIsOpen(false);
            }}
            className="p-0.5 rounded hover:bg-white/10"
          >
            <X className="w-3 h-3 text-muted" />
          </button>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-2 w-full min-w-[280px] bg-surface border border-white/10 rounded-card shadow-xl shadow-black/30 overflow-hidden"
          >
            {/* Time Spinner */}
            <div className="p-4">
              <div className="flex items-center justify-center gap-3">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={incrementHour}
                    className="p-1.5 rounded-btn hover:bg-white/5 text-muted hover:text-white transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 rounded-btn bg-surface-2 border border-white/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-white tabular-nums">{hours.toString().padStart(2, '0')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={decrementHour}
                    className="p-1.5 rounded-btn hover:bg-white/5 text-muted hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xl font-bold text-muted">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={incrementMinute}
                    className="p-1.5 rounded-btn hover:bg-white/5 text-muted hover:text-white transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 rounded-btn bg-surface-2 border border-white/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-white tabular-nums">{minutes.toString().padStart(2, '0')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={decrementMinute}
                    className="p-1.5 rounded-btn hover:bg-white/5 text-muted hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* AM/PM Toggle */}
                <button
                  type="button"
                  onClick={toggleAmPm}
                  className={cn(
                    'ml-2 px-3 py-2 rounded-btn border text-sm font-semibold transition-all',
                    'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
                  )}
                >
                  {ampm}
                </button>
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="border-t border-white/5 px-3 py-3">
              <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-2 px-1">Quick Select</p>
              <div className="grid grid-cols-4 gap-1.5">
                {quickTimes.map((qt) => (
                  <button
                    key={qt.label}
                    type="button"
                    onClick={() => {
                      setHours(qt.h);
                      setMinutes(qt.m);
                      setAmpm(qt.p);
                      updateValue(qt.h, qt.m, qt.p);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'px-2 py-1.5 rounded-input text-[11px] font-medium transition-colors',
                      hours === qt.h && minutes === qt.m && ampm === qt.p
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'bg-surface-2 text-muted hover:text-white hover:bg-white/5 border border-transparent'
                    )}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar for datetime mode */}
            {mode === 'datetime' && (
              <div className="border-t border-white/5 px-3 py-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                        setCalendarYear(calendarYear - 1);
                      } else {
                        setCalendarMonth(calendarMonth - 1);
                      }
                    }}
                    className="p-1 rounded hover:bg-white/5 text-muted"
                  >
                    <ChevronUp className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                  <span className="text-xs font-medium text-white">
                    {monthNames[calendarMonth]} {calendarYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                        setCalendarYear(calendarYear + 1);
                      } else {
                        setCalendarMonth(calendarMonth + 1);
                      }
                    }}
                    className="p-1 rounded hover:bg-white/5 text-muted"
                  >
                    <ChevronUp className="w-3 h-3 rotate-90" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[9px] text-muted py-1">{d}</span>
                  ))}
                  {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                    <span key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === now.getDate() && calendarMonth === now.getMonth() && calendarYear === now.getFullYear();
                    const isSelected = selectedDate && day === selectedDate.getDate() && calendarMonth === selectedDate.getMonth();
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDate(new Date(calendarYear, calendarMonth, day))}
                        className={cn(
                          'w-7 h-7 rounded-full text-[11px] font-medium transition-colors',
                          isSelected ? 'bg-accent text-background' : isToday ? 'bg-accent/10 text-accent' : 'text-muted hover:text-white hover:bg-white/5'
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Done Button */}
            <div className="border-t border-white/5 p-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-btn bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
