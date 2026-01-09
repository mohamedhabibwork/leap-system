"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
}));
//# sourceMappingURL=jwt.config.js.map