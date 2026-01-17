import { Injectable, Inject, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { oidcClients, oidcGrants, oidcSessions } from '@leap-lms/database';
import { eq, and, lt } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import type { Adapter, AdapterPayload } from 'oidc-provider';

/**
 * Database adapter for oidc-provider
 * Implements the Adapter interface to store OIDC data in PostgreSQL
 */
@Injectable()
export class DatabaseAdapter implements Adapter {
  private readonly logger = new Logger(DatabaseAdapter.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly name: string, // Model name (e.g., 'Client', 'AccessToken', 'AuthorizationCode')
  ) {}

  /**
   * Find an entity by ID
   */
  async find(id: string): Promise<AdapterPayload | undefined> {
    try {
      let result;

      switch (this.name) {
        case 'Client':
          [result] = await this.db
            .select()
            .from(oidcClients)
            .where(eq(oidcClients.id, id))
            .limit(1);
          if (result) {
            // Transform database record to oidc-provider format
            return this.transformClient(result);
          }
          break;

        case 'Session':
          [result] = await this.db
            .select()
            .from(oidcSessions)
            .where(eq(oidcSessions.id, id))
            .limit(1);
          if (result) {
            return {
              ...result.data,
              id: result.id,
              accountId: result.accountId,
            };
          }
          break;

        default:
          // For grants (AccessToken, AuthorizationCode, RefreshToken, etc.)
          [result] = await this.db
            .select()
            .from(oidcGrants)
            .where(and(
              eq(oidcGrants.id, id),
              eq(oidcGrants.kind, this.name),
            ))
            .limit(1);
          if (result) {
            return {
              ...result.data,
              id: result.id,
              grantId: result.grantId,
              userCode: result.userCode,
              deviceInfo: result.deviceInfo,
              clientId: result.clientId,
              accountId: result.accountId,
              jti: result.jti,
              iat: result.iat?.getTime(),
              exp: result.exp?.getTime(),
              consumed: result.consumed,
              consumedAt: result.consumedAt?.getTime(),
            };
          }
      }

      return undefined;
    } catch (error) {
      this.logger.error(`Error finding ${this.name} with id ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Find an entity by user code (for device flow)
   */
  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(oidcGrants)
        .where(and(
          eq(oidcGrants.userCode, userCode),
          eq(oidcGrants.kind, this.name),
        ))
        .limit(1);

      if (result) {
        return {
          ...result.data,
          id: result.id,
          grantId: result.grantId,
          userCode: result.userCode,
          deviceInfo: result.deviceInfo,
          clientId: result.clientId,
          accountId: result.accountId,
          jti: result.jti,
          iat: result.iat?.getTime(),
          exp: result.exp?.getTime(),
          consumed: result.consumed,
          consumedAt: result.consumedAt?.getTime(),
        };
      }

      return undefined;
    } catch (error) {
      this.logger.error(`Error finding ${this.name} by userCode ${userCode}:`, error);
      return undefined;
    }
  }

  /**
   * Find an entity by UID (grant ID)
   */
  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(oidcGrants)
        .where(and(
          eq(oidcGrants.grantId, uid),
          eq(oidcGrants.kind, this.name),
        ))
        .limit(1);

      if (result) {
        return {
          ...result.data,
          id: result.id,
          grantId: result.grantId,
          userCode: result.userCode,
          deviceInfo: result.deviceInfo,
          clientId: result.clientId,
          accountId: result.accountId,
          jti: result.jti,
          iat: result.iat?.getTime(),
          exp: result.exp?.getTime(),
          consumed: result.consumed,
          consumedAt: result.consumedAt?.getTime(),
        };
      }

      return undefined;
    } catch (error) {
      this.logger.error(`Error finding ${this.name} by uid ${uid}:`, error);
      return undefined;
    }
  }

  /**
   * Upsert (insert or update) an entity
   */
  async upsert(id: string, payload: AdapterPayload, expiresIn?: number): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      switch (this.name) {
        case 'Client':
          await this.db
            .insert(oidcClients)
            .values({
              id,
              clientId: payload.client_id || id,
              clientSecret: payload.client_secret,
              redirectUris: payload.redirect_uris || [],
              grantTypes: payload.grant_types || ['authorization_code'],
              responseTypes: payload.response_types || ['code'],
              scopes: payload.scopes || ['openid', 'profile', 'email'],
              clientName: payload.client_name,
              clientUri: payload.client_uri,
              logoUri: payload.logo_uri,
              tokenEndpointAuthMethod: payload.token_endpoint_auth_method || 'client_secret_basic',
              applicationType: payload.application_type || 'web',
              subjectType: payload.subject_type || 'public',
              sectorIdentifierUri: payload.sector_identifier_uri,
              jwksUri: payload.jwks_uri,
              jwks: payload.jwks,
              contacts: payload.contacts || [],
              requestUris: payload.request_uris || [],
              defaultMaxAge: payload.default_max_age,
              requireAuthTime: payload.require_auth_time || false,
              defaultAcrValues: payload.default_acr_values || [],
              initiateLoginUri: payload.initiate_login_uri,
              postLogoutRedirectUris: payload.post_logout_redirect_uris || [],
              backchannelLogoutUri: payload.backchannel_logout_uri,
              backchannelLogoutSessionRequired: payload.backchannel_logout_session_required || false,
              userinfoSignedResponseAlg: payload.userinfo_signed_response_alg,
              userinfoEncryptedResponseAlg: payload.userinfo_encrypted_response_alg,
              userinfoEncryptedResponseEnc: payload.userinfo_encrypted_response_enc,
              idTokenSignedResponseAlg: payload.id_token_signed_response_alg || 'RS256',
              idTokenEncryptedResponseAlg: payload.id_token_encrypted_response_alg,
              idTokenEncryptedResponseEnc: payload.id_token_encrypted_response_enc,
              requestObjectSigningAlg: payload.request_object_signing_alg,
              requestObjectEncryptionAlg: payload.request_object_encryption_alg,
              requestObjectEncryptionEnc: payload.request_object_encryption_enc,
              tlsClientCertificateBoundAccessTokens: payload.tls_client_certificate_bound_access_tokens || false,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: oidcClients.id,
              set: {
                clientSecret: payload.client_secret,
                redirectUris: payload.redirect_uris || [],
                grantTypes: payload.grant_types || ['authorization_code'],
                responseTypes: payload.response_types || ['code'],
                scopes: payload.scopes || ['openid', 'profile', 'email'],
                clientName: payload.client_name,
                clientUri: payload.client_uri,
                logoUri: payload.logo_uri,
                tokenEndpointAuthMethod: payload.token_endpoint_auth_method || 'client_secret_basic',
                applicationType: payload.application_type || 'web',
                subjectType: payload.subject_type || 'public',
                sectorIdentifierUri: payload.sector_identifier_uri,
                jwksUri: payload.jwks_uri,
                jwks: payload.jwks,
                contacts: payload.contacts || [],
                requestUris: payload.request_uris || [],
                defaultMaxAge: payload.default_max_age,
                requireAuthTime: payload.require_auth_time || false,
                defaultAcrValues: payload.default_acr_values || [],
                initiateLoginUri: payload.initiate_login_uri,
                postLogoutRedirectUris: payload.post_logout_redirect_uris || [],
                backchannelLogoutUri: payload.backchannel_logout_uri,
                backchannelLogoutSessionRequired: payload.backchannel_logout_session_required || false,
                userinfoSignedResponseAlg: payload.userinfo_signed_response_alg,
                userinfoEncryptedResponseAlg: payload.userinfo_encrypted_response_alg,
                userinfoEncryptedResponseEnc: payload.userinfo_encrypted_response_enc,
                idTokenSignedResponseAlg: payload.id_token_signed_response_alg || 'RS256',
                idTokenEncryptedResponseAlg: payload.id_token_encrypted_response_alg,
                idTokenEncryptedResponseEnc: payload.id_token_encrypted_response_enc,
                requestObjectSigningAlg: payload.request_object_signing_alg,
                requestObjectEncryptionAlg: payload.request_object_encryption_alg,
                requestObjectEncryptionEnc: payload.request_object_encryption_enc,
                tlsClientCertificateBoundAccessTokens: payload.tls_client_certificate_bound_access_tokens || false,
                updatedAt: now,
              },
            });
          break;

        case 'Session':
          await this.db
            .insert(oidcSessions)
            .values({
              id,
              accountId: payload.accountId,
              data: payload,
              expiresAt: expiresAt,
              updatedAt: now,
            } as InferInsertModel<typeof oidcSessions>)
            .onConflictDoUpdate({
              target: oidcSessions.id,
              set: {
                accountId: payload.accountId,
                data: payload,
                expiresAt: expiresAt,
                updatedAt: now,
              },
            });
          break;

        default:
          // For grants
          const { id: _, grantId, userCode, deviceInfo, clientId, accountId, jti, iat, exp, consumed, consumedAt, ...data } = payload;
          
          await this.db
            .insert(oidcGrants)
            .values({
              id,
              grantId: grantId || id,
              userCode,
              deviceInfo,
              clientId: clientId || payload.client_id,
              accountId: accountId || payload.accountId,
              kind: this.name,
              jti,
              iat: iat ? new Date(iat) : now,
              exp: exp ? new Date(exp) : expiresAt,
              data,
              consumed: consumed || false,
              consumedAt: consumedAt ? new Date(consumedAt) : null,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: oidcGrants.id,
              set: {
                grantId: grantId || id,
                userCode,
                deviceInfo,
                clientId: clientId || payload.client_id,
                accountId: accountId || payload.accountId,
                jti,
                iat: iat ? new Date(iat) : now,
                exp: exp ? new Date(exp) : expiresAt,
                data,
                consumed: consumed || false,
                consumedAt: consumedAt ? new Date(consumedAt) : null,
                updatedAt: now,
              },
            });
      }
    } catch (error) {
      this.logger.error(`Error upserting ${this.name} with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Consume an entity (mark as consumed)
   */
  async consume(id: string): Promise<void> {
    try {
      if (this.name === 'Client' || this.name === 'Session') {
        // Clients and Sessions are not consumable
        return;
      }

      await this.db
        .update(oidcGrants)
        .set({
          consumed: true,
          consumedAt: new Date(),
          updatedAt: new Date(),
        } as Partial<InferInsertModel<typeof oidcGrants>>)
        .where(and(
          eq(oidcGrants.id, id),
          eq(oidcGrants.kind, this.name),
        ));
    } catch (error) {
      this.logger.error(`Error consuming ${this.name} with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Destroy (delete) an entity
   */
  async destroy(id: string): Promise<void> {
    try {
      switch (this.name) {
        case 'Client':
          await this.db
            .delete(oidcClients)
            .where(eq(oidcClients.id, id));
          break;

        case 'Session':
          await this.db
            .delete(oidcSessions)
            .where(eq(oidcSessions.id, id));
          break;

        default:
          await this.db
            .delete(oidcGrants)
            .where(and(
              eq(oidcGrants.id, id),
              eq(oidcGrants.kind, this.name),
            ));
      }
    } catch (error) {
      this.logger.error(`Error destroying ${this.name} with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Revoke a grant by grant ID
   */
  async revokeByGrantId(grantId: string): Promise<void> {
    try {
      await this.db
        .delete(oidcGrants)
        .where(eq(oidcGrants.grantId, grantId));
    } catch (error) {
      this.logger.error(`Error revoking grant ${grantId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up expired entities
   */
  async cleanupExpired(): Promise<void> {
    try {
      const now = new Date();

      // Clean up expired grants
      await this.db
        .delete(oidcGrants)
        .where(and(
          lt(oidcGrants.exp, now),
          eq(oidcGrants.kind, this.name),
        ));

      // Clean up expired sessions
      if (this.name === 'Session') {
        await this.db
          .delete(oidcSessions)
          .where(lt(oidcSessions.expiresAt, now));
      }
    } catch (error) {
      this.logger.error(`Error cleaning up expired ${this.name}:`, error);
    }
  }

  /**
   * Transform database client record to oidc-provider format
   */
  private transformClient(record: any): AdapterPayload {
    return {
      id: record.id,
      client_id: record.clientId,
      client_secret: record.clientSecret,
      redirect_uris: record.redirectUris || [],
      grant_types: record.grantTypes || ['authorization_code'],
      response_types: record.responseTypes || ['code'],
      scopes: record.scopes || ['openid', 'profile', 'email'],
      client_name: record.clientName,
      client_uri: record.clientUri,
      logo_uri: record.logoUri,
      token_endpoint_auth_method: record.tokenEndpointAuthMethod || 'client_secret_basic',
      application_type: record.applicationType || 'web',
      subject_type: record.subjectType || 'public',
      sector_identifier_uri: record.sectorIdentifierUri,
      jwks_uri: record.jwksUri,
      jwks: record.jwks,
      contacts: record.contacts || [],
      request_uris: record.requestUris || [],
      default_max_age: record.defaultMaxAge,
      require_auth_time: record.requireAuthTime || false,
      default_acr_values: record.defaultAcrValues || [],
      initiate_login_uri: record.initiateLoginUri,
      post_logout_redirect_uris: record.postLogoutRedirectUris || [],
      backchannel_logout_uri: record.backchannelLogoutUri,
      backchannel_logout_session_required: record.backchannelLogoutSessionRequired || false,
      userinfo_signed_response_alg: record.userinfoSignedResponseAlg,
      userinfo_encrypted_response_alg: record.userinfoEncryptedResponseAlg,
      userinfo_encrypted_response_enc: record.userinfoEncryptedResponseEnc,
      id_token_signed_response_alg: record.idTokenSignedResponseAlg || 'RS256',
      id_token_encrypted_response_alg: record.idTokenEncryptedResponseAlg,
      id_token_encrypted_response_enc: record.idTokenEncryptedResponseEnc,
      request_object_signing_alg: record.requestObjectSigningAlg,
      request_object_encryption_alg: record.requestObjectEncryptionAlg,
      request_object_encryption_enc: record.requestObjectEncryptionEnc,
      tls_client_certificate_bound_access_tokens: record.tlsClientCertificateBoundAccessTokens || false,
    };
  }
}
