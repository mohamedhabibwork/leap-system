import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql, lte, gte, desc } from 'drizzle-orm';
import { ads, adTargetingRules, adPlacements } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

interface UserProfile {
  id?: number;
  role?: string;
  subscriptionPlanId?: number;
  age?: number;
  location?: string;
  interests?: string[];
  enrolledCourses?: number[];
  lastActiveAt?: Date;
}

@Injectable()
export class AdsTargetingService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async getTargetedAds(placementCode: string, userProfile?: UserProfile, limit: number = 3) {
    const now = new Date();

    // Get placement details
    const [placement] = await this.db
      .select()
      .from(adPlacements)
      .where(and(
        eq(adPlacements.code, placementCode),
        eq(adPlacements.isActive, true),
        eq(adPlacements.isDeleted, false)
      ))
      .limit(1);

    if (!placement) {
      return [];
    }

    // Get all active ads for this placement
    const activeAds = await this.db
      .select({
        ad: ads,
      })
      .from(ads)
      .where(and(
        eq(ads.isDeleted, false),
        eq(ads.statusId, 3), // 3 = active status
        lte(ads.startDate, now),
        sql`(${ads.endDate} IS NULL OR ${ads.endDate} >= ${now})`
      ))
      .orderBy(desc(ads.priority), desc(ads.createdAt));

    if (activeAds.length === 0) {
      return [];
    }

    // Get targeting rules for all ads
    const adIds = activeAds.map(a => a.ad.id);
    const targetingRules = await this.db
      .select()
      .from(adTargetingRules)
      .where(and(
        sql`${adTargetingRules.adId} = ANY(${adIds})`,
        eq(adTargetingRules.isDeleted, false)
      ));

    // Create a map of ad ID to targeting rules
    const rulesMap = new Map();
    targetingRules.forEach(rule => {
      rulesMap.set(rule.adId, rule);
    });

    // Filter ads based on targeting rules
    const filteredAds = activeAds.filter(({ ad }) => {
      const rules = rulesMap.get(ad.id);
      
      // If no targeting rules, show to everyone
      if (!rules) {
        return true;
      }

      // If no user profile, only show ads with no targeting
      if (!userProfile) {
        return this.hasNoTargeting(rules);
      }

      // Evaluate targeting rules
      return this.evaluateTargeting(rules, userProfile);
    });

    // Respect placement max ads limit
    const maxAds = Math.min(limit, placement.maxAds);
    return filteredAds.slice(0, maxAds).map(({ ad }) => ad);
  }

  private hasNoTargeting(rules: any): boolean {
    return (
      !rules.targetUserRoles &&
      !rules.targetSubscriptionPlans &&
      !rules.targetAgeRange &&
      !rules.targetLocations &&
      !rules.targetInterests &&
      !rules.targetBehavior
    );
  }

  private evaluateTargeting(rules: any, userProfile: UserProfile): boolean {
    // Check user role targeting
    if (rules.targetUserRoles && rules.targetUserRoles.length > 0) {
      if (!userProfile.role || !rules.targetUserRoles.includes(userProfile.role)) {
        return false;
      }
    }

    // Check subscription plan targeting
    if (rules.targetSubscriptionPlans && rules.targetSubscriptionPlans.length > 0) {
      if (!userProfile.subscriptionPlanId || !rules.targetSubscriptionPlans.includes(userProfile.subscriptionPlanId)) {
        return false;
      }
    }

    // Check age range targeting
    if (rules.targetAgeRange) {
      if (!userProfile.age) {
        return false;
      }
      const { min, max } = rules.targetAgeRange;
      if ((min && userProfile.age < min) || (max && userProfile.age > max)) {
        return false;
      }
    }

    // Check location targeting
    if (rules.targetLocations && rules.targetLocations.length > 0) {
      if (!userProfile.location || !rules.targetLocations.includes(userProfile.location)) {
        return false;
      }
    }

    // Check interest targeting
    if (rules.targetInterests && rules.targetInterests.length > 0) {
      if (!userProfile.interests || userProfile.interests.length === 0) {
        return false;
      }
      // Check if user has at least one matching interest
      const hasMatchingInterest = rules.targetInterests.some((interest: string) =>
        userProfile.interests!.includes(interest)
      );
      if (!hasMatchingInterest) {
        return false;
      }
    }

    // Check behavior targeting
    if (rules.targetBehavior) {
      if (!this.evaluateBehavior(rules.targetBehavior, userProfile)) {
        return false;
      }
    }

    return true;
  }

  private evaluateBehavior(behaviorRules: any, userProfile: UserProfile): boolean {
    // Check if user has enrolled courses (behavior-based)
    if (behaviorRules.enrolledCourses !== undefined) {
      if (behaviorRules.enrolledCourses === true && (!userProfile.enrolledCourses || userProfile.enrolledCourses.length === 0)) {
        return false;
      }
      if (behaviorRules.enrolledCourses === false && userProfile.enrolledCourses && userProfile.enrolledCourses.length > 0) {
        return false;
      }
    }

    // Check user activity recency
    if (behaviorRules.activeInDays !== undefined && userProfile.lastActiveAt) {
      const daysSinceActive = Math.floor((Date.now() - userProfile.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActive > behaviorRules.activeInDays) {
        return false;
      }
    }

    // Check minimum course enrollments
    if (behaviorRules.minCourseEnrollments !== undefined) {
      const enrollmentCount = userProfile.enrolledCourses?.length || 0;
      if (enrollmentCount < behaviorRules.minCourseEnrollments) {
        return false;
      }
    }

    // Check if user is a new user (registered recently)
    if (behaviorRules.newUser !== undefined) {
      // This would require user registration date in the profile
      // For now, we'll skip this check
    }

    return true;
  }

  async validateTargetingRules(rules: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate target user roles
    if (rules.targetUserRoles) {
      if (!Array.isArray(rules.targetUserRoles)) {
        errors.push('targetUserRoles must be an array');
      } else {
        const validRoles = ['admin', 'instructor', 'user', 'recruiter'];
        const invalidRoles = rules.targetUserRoles.filter((role: string) => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
          errors.push(`Invalid roles: ${invalidRoles.join(', ')}`);
        }
      }
    }

    // Validate subscription plans
    if (rules.targetSubscriptionPlans) {
      if (!Array.isArray(rules.targetSubscriptionPlans)) {
        errors.push('targetSubscriptionPlans must be an array');
      } else {
        const allNumbers = rules.targetSubscriptionPlans.every((id: any) => typeof id === 'number');
        if (!allNumbers) {
          errors.push('targetSubscriptionPlans must contain only numbers');
        }
      }
    }

    // Validate age range
    if (rules.targetAgeRange) {
      if (typeof rules.targetAgeRange !== 'object') {
        errors.push('targetAgeRange must be an object');
      } else {
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

    // Validate locations
    if (rules.targetLocations) {
      if (!Array.isArray(rules.targetLocations)) {
        errors.push('targetLocations must be an array');
      } else {
        const allStrings = rules.targetLocations.every((loc: any) => typeof loc === 'string');
        if (!allStrings) {
          errors.push('targetLocations must contain only strings');
        }
      }
    }

    // Validate interests
    if (rules.targetInterests) {
      if (!Array.isArray(rules.targetInterests)) {
        errors.push('targetInterests must be an array');
      } else {
        const allStrings = rules.targetInterests.every((interest: any) => typeof interest === 'string');
        if (!allStrings) {
          errors.push('targetInterests must contain only strings');
        }
      }
    }

    // Validate behavior rules
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

  // Get recommended ads for a user based on their profile
  async getRecommendedAds(userProfile: UserProfile, limit: number = 5) {
    const now = new Date();

    // Get all active ads
    const activeAds = await this.db
      .select({
        ad: ads,
      })
      .from(ads)
      .where(and(
        eq(ads.isDeleted, false),
        eq(ads.statusId, 3),
        lte(ads.startDate, now),
        sql`(${ads.endDate} IS NULL OR ${ads.endDate} >= ${now})`
      ))
      .orderBy(desc(ads.priority), desc(ads.createdAt));

    if (activeAds.length === 0) {
      return [];
    }

    // Get targeting rules
    const adIds = activeAds.map(a => a.ad.id);
    const targetingRules = await this.db
      .select()
      .from(adTargetingRules)
      .where(and(
        sql`${adTargetingRules.adId} = ANY(${adIds})`,
        eq(adTargetingRules.isDeleted, false)
      ));

    const rulesMap = new Map();
    targetingRules.forEach(rule => {
      rulesMap.set(rule.adId, rule);
    });

    // Score ads based on targeting match
    const scoredAds = activeAds.map(({ ad }) => {
      const rules = rulesMap.get(ad.id);
      let score = 0;

      if (rules) {
        // Calculate relevance score
        if (rules.targetUserRoles && userProfile.role && rules.targetUserRoles.includes(userProfile.role)) {
          score += 10;
        }
        if (rules.targetSubscriptionPlans && userProfile.subscriptionPlanId && rules.targetSubscriptionPlans.includes(userProfile.subscriptionPlanId)) {
          score += 10;
        }
        if (rules.targetInterests && userProfile.interests) {
          const matchingInterests = rules.targetInterests.filter((interest: string) =>
            userProfile.interests!.includes(interest)
          );
          score += matchingInterests.length * 5;
        }
        if (rules.targetBehavior && this.evaluateBehavior(rules.targetBehavior, userProfile)) {
          score += 15;
        }
      }

      return { ad, score };
    });

    // Sort by score (highest first) and return top results
    return scoredAds
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ ad }) => ad);
  }
}
