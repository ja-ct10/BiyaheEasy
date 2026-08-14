export const TRANSPORT_MODES = [
  { id: 'jeepney', label: 'Jeepney', description: 'Public utility vehicle' },
  { id: 'bus', label: 'Bus', description: 'City and provincial buses' },
  { id: 'mrt', label: 'MRT/LRT', description: 'Metro rail transit' },
  { id: 'uv-express', label: 'UV Express', description: 'Modern PUV' },
  { id: 'tricycle', label: 'Tricycle', description: 'Short-distance transport' },
  { id: 'walk', label: 'Walking', description: 'Pedestrian routes' },
] as const;

export const PRIORITY_OPTIONS = [
  { id: 'cheapest', label: 'Cheapest', description: 'Lowest fare routes' },
  { id: 'fastest', label: 'Fastest', description: 'Shortest travel time' },
  { id: 'fewest-transfers', label: 'Fewest Transfers', description: 'Minimal connections' },
  { id: 'comfortable', label: 'Most Comfortable', description: 'Air-conditioned, less crowded' },
] as const;

export const POPULAR_LOCATIONS = [
  'SM North EDSA, Quezon City',
  'Ayala Center, Makati',
  'BGC, Taguig',
  'Cubao, Quezon City',
  'Ortigas Center, Pasig',
  'Monumento, Caloocan',
  'Taft Avenue, Manila',
  'MOA Complex, Pasay',
  'Eastwood City, Quezon City',
  'Alabang Town Center, Muntinlupa',
  'UP Diliman, Quezon City',
  'Intramuros, Manila',
  'Quezon Avenue, Quezon City',
  'Shaw Boulevard, Mandaluyong',
  'Greenhills, San Juan',
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/plan', label: 'Plan Trip' },
  { href: '/trips', label: 'My Trips' },
  { href: '/budget', label: 'Budget' },
] as const;

export const TRANSIT_STATUS = [
  { line: 'MRT-3', status: 'operational', delay: 0, note: 'Normal operations' },
  { line: 'LRT-1', status: 'delayed', delay: 8, note: 'Minor delay at Baclaran' },
  { line: 'LRT-2', status: 'operational', delay: 0, note: 'Normal operations' },
] as const;
