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
exports.AdsTargetingService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let AdsTargetingService = class AdsTargetingService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getTargetedAds(placementCode, userProfile, limit = 3) {
        const now = new Date();
        const [placement] = await this.db
            .select()
            .from(database_1.adPlacements)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.adPlacements.code, placementCode), (0, drizzle_orm_1.eq)(database_1.adPlacements.isActive, true), (0, drizzle_orm_1.eq)(database_1.adPlacements.isDeleted, false)))
            .limit(1);
        if (!placement) {
            return [];
        }
        const activeAds = await this.db
            .select({
            ad: database_1.ads,
        })
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.ads.statusId, 3), (0, drizzle_orm_1.lte)(database_1.ads.startDate, now), (0, drizzle_orm_1.sql) `(${database_1.ads.endDate} IS NULL OR ${database_1.ads.endDate} >= ${now})`))
            .orderBy((0, drizzle_orm_1.desc)(database_1.ads.priority), (0, drizzle_orm_1.desc)(database_1.ads.createdAt));
        if (activeAds.length === 0) {
            return [];
        }
        const adIds = activeAds.map(a => a.ad.id);
        const targetingRules = await this.db
            .select()
            .from(database_1.adTargetingRules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${database_1.adTargetingRules.adId} = ANY(${adIds})`, (0, drizzle_orm_1.eq)(database_1.adTargetingRules.isDeleted, false)));
        const rulesMap = new Map();
        targetingRules.forEach(rule => {
            rulesMap.set(rule.adId, rule);
        });
        const filteredAds = activeAds.filter(({ ad }) => {
            const rules = rulesMap.get(ad.id);
            if (!rules) {
                return true;
            }
            if (!userProfile) {
                return this.hasNoTargeting(rules);
            }
            return this.evaluateTargeting(rules, userProfile);
        });
        const maxAds = Math.min(limit, placement.maxAds);
        return filteredAds.slice(0, maxAds).map(({ ad }) => ad);
    }
    hasNoTargeting(rules) {
        return (!rules.targetUserRoles &&
            !rules.targetSubscriptionPlans &&
            !rules.targetAgeRange &&
            !rules.targetLocations &&
            !rules.targetInterests &&
            !rules.targetBehavior);
    }
    evaluateTargeting(rules, userProfile) {
        if (rules.targetUserRoles && rules.targetUserRoles.length > 0) {
            if (!userProfile.role || !rules.targetUserRoles.includes(userProfile.role)) {
                return false;
            }
        }
        if (rules.targetSubscriptionPlans && rules.targetSubscriptionPlans.length > 0) {
            if (!userProfile.subscriptionPlanId || !rules.targetSubscriptionPlans.includes(userProfile.subscriptionPlanId)) {
                return false;
            }
        }
        if (rules.targetAgeRange) {
            if (!userProfile.age) {
                return false;
            }
            const { min, max } = rules.targetAgeRange;
            if ((min && userProfile.age < min) || (max && userProfile.age > max)) {
                return false;
            }
        }
        if (rules.targetLocations && rules.targetLocations.length > 0) {
            if (!userProfile.location || !rules.targetLocations.includes(userProfile.location)) {
                return false;
            }
        }
        if (rules.targetInterests && rules.targetInterests.length > 0) {
            if (!userProfile.interests || userProfile.interests.length === 0) {
                return false;
            }
            const hasMatchingInterest = rules.targetInterests.some((interest) => userProfile.interests.includes(interest));
            if (!hasMatchingInterest) {
                return false;
            }
        }
        if (rules.targetBehavior) {
            if (!this.evaluateBehavior(rules.targetBehavior, userProfile)) {
                return false;
            }
        }
        return true;
    }
    evaluateBehavior(behaviorRules, userProfile) {
        if (behaviorRules.enrolledCourses !== undefined) {
            if (behaviorRules.enrolledCourses === true && (!userProfile.enrolledCourses || userProfile.enrolledCourses.length === 0)) {
                return false;
            }
            if (behaviorRules.enrolledCourses === false && userProfile.enrolledCourses && userProfile.enrolledCourses.length > 0) {
                return false;
            }
        }
        if (behaviorRules.activeInDays !== undefined && userProfile.lastActiveAt) {
            const daysSinceActive = Math.floor((Date.now() - userProfile.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActive > behaviorRules.activeInDays) {
                return false;
            }
        }
        if (behaviorRules.minCourseEnrollments !== undefined) {
            const enrollmentCount = userProfile.enrolledCourses?.length || 0;
            if (enrollmentCount < behaviorRules.minCourseEnrollments) {
                return false;
            }
        }
        if (behaviorRules.newUser !== undefined) {
        }
        return true;
    }
    async validateTargetingRules(rules) {
        const errors = [];
        if (rules.targetUserRoles) {
            if (!Array.isArray(rules.targetUserRoles)) {
                errors.push('targetUserRoles must be an array');
            }
            else {
                const validRoles = ['admin', 'instructor', 'user', 'recruiter'];
                const invalidRoles = rules.targetUserRoles.filter((role) => !validRoles.includes(role));
                if (invalidRoles.length > 0) {
                    errors.push(`Invalid roles: ${invalidRoles.join(', ')}`);
                }
            }
        }
        if (rules.targetSubscriptionPlans) {
            if (!Array.isArray(rules.targetSubscriptionPlans)) {
                errors.push('targetSubscriptionPlans must be an array');
            }
            else {
                const allNumbers = rules.targetSubscriptionPlans.every((id) => typeof id === 'number');
                if (!allNumbers) {
                    errors.push('targetSubscriptionPlans must contain only numbers');
                }
            }
        }
        if (rules.targetAgeRange) {
            if (typeof rules.targetAgeRange !== 'object') {
                errors.push('targetAgeRange must be an object');
            }
            else {
                if (rules.targetAgeRange.min !== undefined && (typeof rules.targetAgeRange.min !== 'number' || rules.targetAgeRange.min < 0)) {
                    errors.push('targetAgeRange.min must be a positive number');
                }
                if (rules.targetAgeRange.max !== undefined && (typeof rules.targetAgeRange.max !== 'number' || rules.targetAgeRange.max < 0)) {
                    errors.push('targetAgeRange.max must be a positive number');
                }
                if (rules.targetAgeRange.min && rules.targetAgeRange.max && rules.targetAgeRange.min > rules.targetAgeRange.max) {
                    errors.push('targetAgeRange.min cannot be greater than targetAgeRange.max');
                }
            }
        }
        if (rules.targetLocations) {
            if (!Array.isArray(rules.targetLocations)) {
                errors.push('targetLocations must be an array');
            }
            else {
                const allStrings = rules.targetLocations.every((loc) => typeof loc === 'string');
                if (!allStrings) {
                    errors.push('targetLocations must contain only strings');
                }
            }
        }
        if (rules.targetInterests) {
            if (!Array.isArray(rules.targetInterests)) {
                errors.push('targetInterests must be an array');
            }
            else {
                const allStrings = rules.targetInterests.every((interest) => typeof interest === 'string');
                if (!allStrings) {
                    errors.push('targetInterests must contain only strings');
                }
            }
        }
        if (rules.targetBehavior) {
            if (typeof rules.targetBehavior !== 'object') {
                errors.push('targetBehavior must be an object');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    async getRecommendedAds(userProfile, limit = 5) {
        const now = new Date();
        const activeAds = await this.db
            .select({
            ad: database_1.ads,
        })
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.ads.statusId, 3), (0, drizzle_orm_1.lte)(database_1.ads.startDate, now), (0, drizzle_orm_1.sql) `(${database_1.ads.endDate} IS NULL OR ${database_1.ads.endDate} >= ${now})`))
            .orderBy((0, drizzle_orm_1.desc)(database_1.ads.priority), (0, drizzle_orm_1.desc)(database_1.ads.createdAt));
        if (activeAds.length === 0) {
            return [];
        }
        const adIds = activeAds.map(a => a.ad.id);
        const targetingRules = await this.db
            .select()
            .from(database_1.adTargetingRules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${database_1.adTargetingRules.adId} = ANY(${adIds})`, (0, drizzle_orm_1.eq)(database_1.adTargetingRules.isDeleted, false)));
        const rulesMap = new Map();
        targetingRules.forEach(rule => {
            rulesMap.set(rule.adId, rule);
        });
        const scoredAds = activeAds.map(({ ad }) => {
            const rules = rulesMap.get(ad.id);
            let score = 0;
            if (rules) {
                if (rules.targetUserRoles && userProfile.role && rules.targetUserRoles.includes(userProfile.role)) {
                    score += 10;
                }
                if (rules.targetSubscriptionPlans && userProfile.subscriptionPlanId && rules.targetSubscriptionPlans.includes(userProfile.subscriptionPlanId)) {
                    score += 10;
                }
                if (rules.targetInterests && userProfile.interests) {
                    const matchingInterests = rules.targetInterests.filter((interest) => userProfile.interests.includes(interest));
                    score += matchingInterests.length * 5;
                }
                if (rules.targetBehavior && this.evaluateBehavior(rules.targetBehavior, userProfile)) {
                    score += 15;
                }
            }
            return { ad, score };
        });
        return scoredAds
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ ad }) => ad);
    }
};
exports.AdsTargetingService = AdsTargetingService;
exports.AdsTargetingService = AdsTargetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], AdsTargetingService);
//# sourceMappingURL=ads-targeting.service.js.map