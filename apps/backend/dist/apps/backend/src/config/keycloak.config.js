"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('keycloak', () => ({
    authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'leap-lms',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'leap-lms-backend',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
    admin: {
        url: process.env.KEYCLOAK_ADMIN_URL || process.env.KEYCLOAK_URL || 'http://localhost:8080',
        clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
        clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || '',
        username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
        password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
    },
    sync: {
        enabled: process.env.KEYCLOAK_SYNC_ENABLED === 'true',
        onCreate: process.env.KEYCLOAK_SYNC_ON_CREATE !== 'false',
        onUpdate: process.env.KEYCLOAK_SYNC_ON_UPDATE !== 'false',
    },
}));
//# sourceMappingURL=keycloak.config.js.map