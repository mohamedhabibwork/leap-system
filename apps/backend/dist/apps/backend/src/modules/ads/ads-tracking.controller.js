"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsTrackingController = void 0;
const common_1 = require("@nestjs/common");
const ads_tracking_service_1 = require("./ads-tracking.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let AdsTrackingController = class AdsTrackingController {
    trackingService;
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    trackImpression(dto, req) {
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.trackingService.trackImpression(dto, ipAddress, userAgent);
    }
    trackBulkImpressions(dto, req) {
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.trackingService.trackBulkImpressions(dto, ipAddress, userAgent);
    }
    trackClick(dto, req) {
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.trackingService.trackClick(dto, ipAddress, userAgent);
    }
    getAnalytics(adId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.trackingService.getAdAnalytics(adId, start, end);
    }
};
exports.AdsTrackingController = AdsTrackingController;
__decorate([
    (0, common_1.Post)('impression'),
    (0, swagger_1.ApiOperation)({ summary: 'Track a single ad impression' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TrackImpressionDto, Object]),
    __metadata("design:returntype", void 0)
], AdsTrackingController.prototype, "trackImpression", null);
__decorate([
    (0, common_1.Post)('impressions/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Track multiple ad impressions at once' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BulkTrackImpressionDto, Object]),
    __metadata("design:returntype", void 0)
], AdsTrackingController.prototype, "trackBulkImpressions", null);
__decorate([
    (0, common_1.Post)('click'),
    (0, swagger_1.ApiOperation)({ summary: 'Track an ad click' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TrackClickDto, Object]),
    __metadata("design:returntype", void 0)
], AdsTrackingController.prototype, "trackClick", null);
__decorate([
    (0, common_1.Get)('analytics/:adId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics for a specific ad' }),
    __param(0, (0, common_1.Param)('adId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], AdsTrackingController.prototype, "getAnalytics", null);
exports.AdsTrackingController = AdsTrackingController = __decorate([
    (0, swagger_1.ApiTags)('ads/tracking'),
    (0, common_1.Controller)('ads/tracking'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [ads_tracking_service_1.AdsTrackingService])
], AdsTrackingController);
//# sourceMappingURL=ads-tracking.controller.js.map