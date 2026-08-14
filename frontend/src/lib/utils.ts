import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getTransportIcon(mode: string): string {
  const icons: Record<string, string> = {
    jeepney: 'bus',
    bus: 'bus',
    mrt: 'train',
    lrt: 'train',
    lrt1: 'train',
    lrt2: 'train',
    'uv-express': 'car',
    tricycle: 'bike',
    walk: 'footprints',
  };
  return icons[mode.toLowerCase()] || 'map-pin';
}

export function getTransportColor(mode: string): string {
  const colors: Record<string, string> = {
    jeepney: '#F59E0B',
    bus: '#3B82F6',
    mrt: '#10B981',
    lrt: '#8B5CF6',
    lrt1: '#8B5CF6',
    lrt2: '#6366F1',
    'uv-express': '#EC4899',
    tricycle: '#F97316',
    walk: '#94A3B8',
  };
  return colors[mode.toLowerCase()] || '#94A3B8';
}
