import { Response, NextFunction } from 'express';
import { TripsService } from '../services/trips.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const tripsService = new TripsService();

export class TripsController {
  async plan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tripsService.planTrip(req.body);
      sendSuccess(res, result, 'Trip planned successfully');
    } catch (error) {
      next(error);
    }
  }

  async save(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await tripsService.saveTrip(userId, req.body);
      sendCreated(res, result, 'Trip saved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSaved(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await tripsService.getSavedTrips(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const tripId = req.params.id;
      await tripsService.deleteTrip(userId, tripId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}
