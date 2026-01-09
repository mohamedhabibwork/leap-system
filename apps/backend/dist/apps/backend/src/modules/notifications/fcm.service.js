"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCMService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
let FCMService = class FCMService {
    configService;
    isInitialized = false;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        try {
            const projectId = this.configService.get('FIREBASE_PROJECT_ID');
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
            const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
            if (!projectId || !clientEmail || !privateKey) {
                console.warn('Firebase credentials not configured. FCM service will be disabled.');
                return;
            }
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: privateKey.replace(/\\n/g, '\n'),
                    }),
                });
                this.isInitialized = true;
                console.log('Firebase Admin initialized successfully');
            }
        }
        catch (error) {
            console.error('Error initializing Firebase Admin:', error);
        }
    }
    async sendNotification(token, title, body, data) {
        if (!this.isInitialized) {
            console.warn('FCM service not initialized');
            return null;
        }
        const message = {
            notification: { title, body },
            data: data || {},
            token,
        };
        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent FCM message:', response);
            return response;
        }
        catch (error) {
            console.error('Error sending FCM notification:', error);
            throw error;
        }
    }
    async sendToMultiple(tokens, title, body, data) {
        if (!this.isInitialized) {
            console.warn('FCM service not initialized');
            return null;
        }
        const message = {
            notification: { title, body },
            data: data || {},
            tokens,
        };
        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            console.log(`Successfully sent ${response.successCount} messages`);
            return response;
        }
        catch (error) {
            console.error('Error sending FCM notifications:', error);
            throw error;
        }
    }
    async sendToTopic(topic, title, body, data) {
        if (!this.isInitialized) {
            console.warn('FCM service not initialized');
            return null;
        }
        const message = {
            notification: { title, body },
            data: data || {},
            topic,
        };
        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent message to topic:', response);
            return response;
        }
        catch (error) {
            console.error('Error sending topic notification:', error);
            throw error;
        }
    }
};
exports.FCMService = FCMService;
exports.FCMService = FCMService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FCMService);
//# sourceMappingURL=fcm.service.js.map