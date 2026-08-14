import { z } from 'zod';

const transportModes = z.enum([
  'mrt', 'lrt', 'bus', 'jeepney', 'uv_express', 'tricycle', 'walk', 'grab'
]);

const routePriority = z.enum(['fastest', 'cheapest', 'least_transfers', 'most_comfortable']);

export const generateRouteSchema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  preferences: z.object({
    transport_modes: z.array(transportModes).min(1),
    budget_limit: z.number().positive().optional(),
    priority: routePriority,
  }),
});

export type GenerateRouteInput = z.infer<typeof generateRouteSchema>;
