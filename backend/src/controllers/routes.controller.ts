import { Response, NextFunction } from 'express';
import { RoutesService } from '../services/routes.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const routesService = new RoutesService();

export class RoutesController {
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { origin, destination, preferences } = req.body;
      const routes = routesService.generateRoutes(origin, destination, preferences);
      sendSuccess(res, { routes }, 'Routes generated successfully');
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
