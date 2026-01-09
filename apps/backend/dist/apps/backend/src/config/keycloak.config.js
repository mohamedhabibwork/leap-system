"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('keycloak', () => ({
    authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'leap-lms',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'leap-lms-backend',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
}));
//# sourceMappingURL=keycloak.config.js.map