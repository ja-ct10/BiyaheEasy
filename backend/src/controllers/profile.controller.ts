import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await profileService.updateProfile(userId, req.body);
      sendSuccess(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
