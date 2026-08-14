import { z } from 'zod';

const transportModes = z.enum([
  'mrt', 'lrt', 'bus', 'jeepney', 'uv_express', 'tricycle', 'walk', 'grab'
]);

const routePriority = z.enum(['fastest', 'cheapest', 'least_transfers', 'most_comfortable']);

const tripPreferences = z.object({
  transport_modes: z.array(transportModes).min(1, 'At least one transport mode required'),
  budget_limit: z.number().positive().optional(),
  priority: routePriority,
});

export const planTripSchema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  preferences: tripPreferences,
});

export const saveTripSchema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  preferences: tripPreferences,
  selected_route: z.object({
    id: z.string(),
    steps: z.array(z.object({
      mode: transportModes,
      from: z.string(),
      to: z.string(),
      fare: z.number(),
      duration: z.number(),
      distance: z.number().optional(),
      instructions: z.string().optional(),
    })),
    total_fare: z.number(),
    total_duration: z.number(),
    transfers: z.number(),
    walking_distance: z.number(),
    co2_estimate: z.number(),
    comfort_score: z.number(),
  }).optional(),
});

export const deleteTripSchema = z.object({
  id: z.string().uuid('Invalid trip ID'),
});

export type PlanTripInput = z.infer<typeof planTripSchema>;
export type SaveTripInput = z.infer<typeof saveTripSchema>;
