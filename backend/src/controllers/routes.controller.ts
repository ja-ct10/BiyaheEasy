import { Response, NextFunction } from 'express';
import { RoutesService } from '../services/routes.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const routesService = new RoutesService();

export class RoutesController {
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { origin, destination, preferences } = req.body;
      const allRoutes = routesService.generateRoutes(origin, destination, preferences);

      // Separate routes into preferred (matching user criteria) and other suggestions
      const budgetLimit = preferences.budget_limit;
      const preferredModes = preferences.transport_modes || [];
      const priority = preferences.priority;

      const preferred: typeof allRoutes = [];
      const otherSuggestions: typeof allRoutes = [];

      allRoutes.forEach((route) => {
        let matchesPreference = true;

        // Check budget match - if user set budget, route must be within it
        if (budgetLimit && route.total_fare > budgetLimit) {
          matchesPreference = false;
        }

        // Check transport mode match - route should primarily use preferred modes
        if (preferredModes.length > 0) {
          const routeModes = route.steps
            .filter((s) => s.mode !== 'walk')
            .map((s) => s.mode);
          const hasPreferredMode = routeModes.some((mode) =>
            preferredModes.includes(mode)
          );
          if (!hasPreferredMode) {
            matchesPreference = false;
          }
        }

        if (matchesPreference) {
          preferred.push(route);
        } else {
          otherSuggestions.push(route);
        }
      });

      // Sort preferred routes by the user's priority
      const sortedPreferred = routesService.sortRoutesByPriority(preferred, priority);
      const sortedOther = routesService.sortRoutesByPriority(otherSuggestions, priority);

      sendSuccess(
        res,
        {
          origin,
          destination,
          preferred: sortedPreferred,
          other_suggestions: sortedOther,
          routes: [...sortedPreferred, ...sortedOther], // backward compat
        },
        'Routes generated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await routesService.getHistory(userId);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}
