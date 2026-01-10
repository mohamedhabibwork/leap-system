-- Migration: Create Sessions Table for Keycloak OIDC Integration
-- Description: Adds sessions table to store user session data including Keycloak tokens for SSO support
-- Date: 2026-01-10

-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  
  -- User reference
  "user_id" BIGINT NOT NULL,
  
  -- Session token (used in cookie)
  "session_token" VARCHAR(255) NOT NULL UNIQUE,
  
  -- Keycloak tokens
  "access_token" TEXT NOT NULL,
  "refresh_token" TEXT NOT NULL,
  "keycloak_session_id" VARCHAR(255),
  
  -- Token expiration
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "access_token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Session metadata
  "user_agent" TEXT,
  "ip_address" VARCHAR(45),
  "device_info" TEXT,
  
  -- Session state
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_activity_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Remember me
  "remember_me" BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "sessions_uuid_idx" ON "sessions"("uuid");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_session_token_idx" ON "sessions"("session_token");
CREATE INDEX IF NOT EXISTS "sessions_keycloak_session_id_idx" ON "sessions"("keycloak_session_id");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions"("expires_at");
CREATE INDEX IF NOT EXISTS "sessions_is_active_idx" ON "sessions"("is_active");
CREATE INDEX IF NOT EXISTS "sessions_last_activity_at_idx" ON "sessions"("last_activity_at");
CREATE INDEX IF NOT EXISTS "sessions_user_active_idx" ON "sessions"("user_id", "is_active");

-- Add comment to table
COMMENT ON TABLE "sessions" IS 'User sessions with Keycloak OIDC token storage for SSO support';

-- Add comments to columns
COMMENT ON COLUMN "sessions"."session_token" IS 'Unique session token stored in HTTP-only cookie';
COMMENT ON COLUMN "sessions"."access_token" IS 'Keycloak JWT access token';
COMMENT ON COLUMN "sessions"."refresh_token" IS 'Keycloak refresh token for token renewal';
COMMENT ON COLUMN "sessions"."keycloak_session_id" IS 'Keycloak session identifier for logout propagation';
COMMENT ON COLUMN "sessions"."expires_at" IS 'Session expiration timestamp';
COMMENT ON COLUMN "sessions"."user_agent" IS 'Client user agent string for security tracking';
COMMENT ON COLUMN "sessions"."ip_address" IS 'Client IP address for security tracking';
COMMENT ON COLUMN "sessions"."remember_me" IS 'Whether this is an extended (remember me) session';
