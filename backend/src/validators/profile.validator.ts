import { z } from 'zod';

const transportModes = z.enum([
  'mrt', 'lrt', 'bus', 'jeepney', 'uv_express', 'tricycle', 'walk', 'grab'
]);

const routePriority = z.enum(['fastest', 'cheapest', 'least_transfers', 'most_comfortable']);

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional().nullable(),
  home_location: z.string().max(200).optional().nullable(),
  work_location: z.string().max(200).optional().nullable(),
  preferences: z.object({
    preferred_modes: z.array(transportModes).optional(),
    budget_limit: z.number().positive().optional(),
    priority: routePriority.optional(),
    avoid_walking_over: z.number().positive().optional(),
  }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
