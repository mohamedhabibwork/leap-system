// Master schema export file
// This file exports all database schemas for Drizzle ORM

// Lookups (Foundation)
export * from './lookups.schema';

// Core Modules
export * from './users.schema';
export * from './subscriptions.schema';

// LMS Module
export * from './lms.schema';

// Universal/Polymorphic Modules
export * from './comments.schema';
export * from './notes.schema';
export * from './favorites.schema';
export * from './shares.schema';

// Social Module
export * from './social.schema';

// Communication Modules
export * from './chat.schema';
export * from './notifications.schema';

// Extended Features
export * from './events.schema';
export * from './jobs.schema';
export * from './tickets.schema';

// Infrastructure
export * from './media.schema';
export * from './audit.schema';
export * from './cms.schema';

// Advertising
export * from './ads.schema';
