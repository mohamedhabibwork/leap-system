import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { OidcService } from './oidc.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * OIDC Interaction Controller
 * Handles user interactions (login, consent) for OIDC flows
 * This is a simple default implementation - customize as needed
 */
@Controller('oidc/interaction')
@Public()
export class OidcInteractionController {
  constructor(private readonly oidcService: OidcService) {}

  /**
   * Handle OIDC interaction (login/consent)
   * This endpoint is called when user interaction is required
   */
  @Get(':uid')
  async handleInteraction(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const provider = this.oidcService.getProvider();
    
    try {
      // Get interaction details from provider
      const interaction = await provider.interactionDetails(req, res);
      
      // For now, redirect to frontend login page
      // In production, you should implement a proper interaction UI
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/oidc/interaction/${uid}?details=${encodeURIComponent(JSON.stringify(interaction))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      // If interaction not found or error, redirect to login
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/login?error=interaction_required`);
    }
  }

  /**
   * Handle interaction result (callback from frontend)
   */
  @Get(':uid/confirm')
  async confirmInteraction(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const provider = this.oidcService.getProvider();
    
    try {
      // Get interaction details
      const interaction = await provider.interactionDetails(req, res);
      
      // For now, this is a placeholder
      // In production, implement proper interaction result handling
      // This would typically involve:
      // 1. User authentication
      // 2. User consent
      // 3. Returning the result to the provider
      
      res.json({
        message: 'Interaction confirmation endpoint - implement as needed',
        uid,
        interaction,
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid interaction' });
    }
  }
}
