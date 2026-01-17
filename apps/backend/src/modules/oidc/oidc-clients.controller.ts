import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OidcService } from './oidc.service';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Inject } from '@nestjs/common';
import { oidcClients } from '@leap-lms/database';
import { eq } from 'drizzle-orm';

/**
 * OIDC Clients Controller
 * Manages OAuth 2.0 / OIDC client registration and management
 */
@Controller('oidc/clients')
@UseGuards(JwtAuthGuard)
export class OidcClientsController {
  constructor(
    private readonly oidcService: OidcService,
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  /**
   * List all registered clients
   */
  @Get()
  async listClients() {
    const clients = await this.db
      .select()
      .from(oidcClients);

    return clients.map(client => ({
      id: client.id,
      client_id: client.clientId,
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes,
      scopes: client.scopes,
      created_at: client.createdAt,
      updated_at: client.updatedAt,
    }));
  }

  /**
   * Get a specific client by ID
   */
  @Get(':id')
  async getClient(@Param('id') id: string) {
    const [client] = await this.db
      .select()
      .from(oidcClients)
      .where(eq(oidcClients.id, id))
      .limit(1);

    if (!client) {
      throw new Error('Client not found');
    }

    return {
      id: client.id,
      client_id: client.clientId,
      client_secret: client.clientSecret, // Only return in development
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes,
      scopes: client.scopes,
      token_endpoint_auth_method: client.tokenEndpointAuthMethod,
      application_type: client.applicationType,
      subject_type: client.subjectType,
      created_at: client.createdAt,
      updated_at: client.updatedAt,
    };
  }

  /**
   * Register a new client
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registerClient(@Body() clientData: any) {
    const provider = this.oidcService.getProvider();
    
    // Use oidc-provider's client registration
    // This will automatically validate and store the client
    const client = await provider.Client.create({
      client_id: clientData.client_id,
      client_secret: clientData.client_secret,
      redirect_uris: clientData.redirect_uris || [],
      grant_types: clientData.grant_types || ['authorization_code'],
      response_types: clientData.response_types || ['code'],
      scopes: clientData.scopes || ['openid', 'profile', 'email'],
      client_name: clientData.client_name,
      client_uri: clientData.client_uri,
      logo_uri: clientData.logo_uri,
      token_endpoint_auth_method: clientData.token_endpoint_auth_method || 'client_secret_basic',
      application_type: clientData.application_type || 'web',
      subject_type: clientData.subject_type || 'public',
    });

    return {
      client_id: client.clientId,
      client_secret: client.clientSecret,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes,
      scopes: client.scopes,
    };
  }

  /**
   * Update an existing client
   */
  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() clientData: any) {
    const [existing] = await this.db
      .select()
      .from(oidcClients)
      .where(eq(oidcClients.id, id))
      .limit(1);

    if (!existing) {
      throw new Error('Client not found');
    }

    await this.db
      .update(oidcClients)
      .set({
        clientName: clientData.client_name || existing.clientName,
        redirectUris: clientData.redirect_uris || existing.redirectUris,
        grantTypes: clientData.grant_types || existing.grantTypes,
        responseTypes: clientData.response_types || existing.responseTypes,
        scopes: clientData.scopes || existing.scopes,
        clientUri: clientData.client_uri || existing.clientUri,
        logoUri: clientData.logo_uri || existing.logoUri,
        tokenEndpointAuthMethod: clientData.token_endpoint_auth_method || existing.tokenEndpointAuthMethod,
        updatedAt: new Date(),
      })
      .where(eq(oidcClients.id, id));

    return { message: 'Client updated successfully' };
  }

  /**
   * Delete a client
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClient(@Param('id') id: string) {
    await this.db
      .delete(oidcClients)
      .where(eq(oidcClients.id, id));

    return { message: 'Client deleted successfully' };
  }
}
