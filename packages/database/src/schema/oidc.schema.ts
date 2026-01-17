import { pgTable, text, timestamp, jsonb, boolean, varchar, index } from 'drizzle-orm/pg-core';

/**
 * OIDC Clients table
 * Stores registered OAuth 2.0 / OIDC clients
 */
export const oidcClients = pgTable('oidc_clients', {
  id: varchar('id', { length: 255 }).primaryKey(),
  clientId: varchar('client_id', { length: 255 }).notNull().unique(),
  clientSecret: text('client_secret'),
  redirectUris: jsonb('redirect_uris').$type<string[]>().notNull().default([]),
  grantTypes: jsonb('grant_types').$type<string[]>().notNull().default(['authorization_code']),
  responseTypes: jsonb('response_types').$type<string[]>().notNull().default(['code']),
  scopes: jsonb('scopes').$type<string[]>().notNull().default(['openid', 'profile', 'email']),
  clientName: varchar('client_name', { length: 255 }),
  clientUri: text('client_uri'),
  logoUri: text('logo_uri'),
  tokenEndpointAuthMethod: varchar('token_endpoint_auth_method', { length: 50 }).default('client_secret_basic'),
  applicationType: varchar('application_type', { length: 50 }).default('web'),
  subjectType: varchar('subject_type', { length: 50 }).default('public'),
  sectorIdentifierUri: text('sector_identifier_uri'),
  jwksUri: text('jwks_uri'),
  jwks: jsonb('jwks'),
  contacts: jsonb('contacts').$type<string[]>().default([]),
  requestUris: jsonb('request_uris').$type<string[]>().default([]),
  defaultMaxAge: text('default_max_age'),
  requireAuthTime: boolean('require_auth_time').default(false),
  defaultAcrValues: jsonb('default_acr_values').$type<string[]>().default([]),
  initiateLoginUri: text('initiate_login_uri'),
  postLogoutRedirectUris: jsonb('post_logout_redirect_uris').$type<string[]>().default([]),
  backchannelLogoutUri: text('backchannel_logout_uri'),
  backchannelLogoutSessionRequired: boolean('backchannel_logout_session_required').default(false),
  userinfoSignedResponseAlg: varchar('userinfo_signed_response_alg', { length: 50 }),
  userinfoEncryptedResponseAlg: varchar('userinfo_encrypted_response_alg', { length: 50 }),
  userinfoEncryptedResponseEnc: varchar('userinfo_encrypted_response_enc', { length: 50 }),
  idTokenSignedResponseAlg: varchar('id_token_signed_response_alg', { length: 50 }).default('RS256'),
  idTokenEncryptedResponseAlg: varchar('id_token_encrypted_response_alg', { length: 50 }),
  idTokenEncryptedResponseEnc: varchar('id_token_encrypted_response_enc', { length: 50 }),
  requestObjectSigningAlg: varchar('request_object_signing_alg', { length: 50 }),
  requestObjectEncryptionAlg: varchar('request_object_encryption_alg', { length: 50 }),
  requestObjectEncryptionEnc: varchar('request_object_encryption_enc', { length: 50 }),
  tlsClientCertificateBoundAccessTokens: boolean('tls_client_certificate_bound_access_tokens').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ([
  index('oidc_clients_client_id_idx').on(table.clientId),
  index('oidc_clients_created_at_idx').on(table.createdAt),
  index('oidc_clients_updated_at_idx').on(table.updatedAt),
]));

/**
 * OIDC Grants table
 * Stores authorization grants, access tokens, refresh tokens, etc.
 */
export const oidcGrants = pgTable('oidc_grants', {
  id: varchar('id', { length: 255 }).primaryKey(),
  grantId: varchar('grant_id', { length: 255 }),
  userCode: varchar('user_code', { length: 255 }),
  deviceInfo: jsonb('device_info'),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  accountId: varchar('account_id', { length: 255 }),
  kind: varchar('kind', { length: 50 }).notNull(), // 'AccessToken', 'AuthorizationCode', 'RefreshToken', 'DeviceCode', etc.
  jti: varchar('jti', { length: 255 }),
  iat: timestamp('iat'),
  exp: timestamp('exp'),
  data: jsonb('data').notNull(),
  consumed: boolean('consumed').default(false),
  consumedAt: timestamp('consumed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ([
  index('oidc_grants_grant_id_idx').on(table.grantId),
  index('oidc_grants_user_code_idx').on(table.userCode),
  index('oidc_grants_device_info_idx').on(table.deviceInfo),
  index('oidc_grants_client_id_idx').on(table.clientId),
  index('oidc_grants_account_id_idx').on(table.accountId),
  index('oidc_grants_kind_idx').on(table.kind),
  index('oidc_grants_jti_idx').on(table.jti),
  index('oidc_grants_exp_idx').on(table.exp),
]));

/**
 * OIDC Sessions table
 * Stores OIDC provider sessions
 */
export const oidcSessions = pgTable('oidc_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ([
  index('oidc_sessions_account_id_idx').on(table.accountId),
  index('oidc_sessions_expires_at_idx').on(table.expiresAt),
  index('oidc_sessions_created_at_idx').on(table.createdAt),
  index('oidc_sessions_updated_at_idx').on(table.updatedAt),
]));
