import { Controller, All, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { OidcService } from './oidc.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * OIDC Controller
 * Handles all OIDC provider endpoints
 * All routes are public as they handle their own authentication
 */
@Controller('oidc')
@Public()
export class OidcController {
  constructor(private readonly oidcService: OidcService) {}

  /**
   * Mount OIDC provider routes
   * This catches all routes under /oidc/* and forwards them to the provider
   */
  @All('/*')
  async handleOidcRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Get the provider callback
    const callback = this.oidcService.getCallback();

    // Adjust the URL to remove the API prefix and version for the provider
    // The provider expects routes like /authorization, /token, etc.
    const originalUrl = req.originalUrl;
    let adjustedUrl = originalUrl;
    
    // Remove /api/v1/oidc or /api/oidc prefix
    adjustedUrl = adjustedUrl.replace(/^\/api\/v\d+\/oidc/, '');
    adjustedUrl = adjustedUrl.replace(/^\/api\/oidc/, '');
    adjustedUrl = adjustedUrl.replace(/^\/oidc/, '');
    
    // If empty, set to /
    if (!adjustedUrl || adjustedUrl === '') {
      adjustedUrl = '/';
    }

    // Store original URL for potential redirects
    req.url = adjustedUrl;
    req.originalUrl = adjustedUrl;

    // Forward to oidc-provider
    return callback(req, res);
  }

  /**
   * Get OpenID Connect Discovery document
   * This is also handled by the provider, but we expose it explicitly
   */
  @Get('/.well-known/openid-configuration')
  async getDiscovery(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.handleOidcRequest(req, res);
  }

  /**
   * Get JWKS (JSON Web Key Set)
   * This is also handled by the provider, but we expose it explicitly
   */
  @Get('/.well-known/jwks.json')
  async getJwks(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.handleOidcRequest(req, res);
  }
}
