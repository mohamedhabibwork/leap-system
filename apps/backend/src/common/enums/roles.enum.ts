/**
 * User roles in the system with hierarchical levels
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  RECRUITER = 'recruiter',
  STUDENT = 'student',
}

/**
 * Role hierarchy levels - higher number = more privileges
 * Used for comparing role levels in authorization checks
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.INSTRUCTOR]: 2,
  [Role.RECRUITER]: 2,
  [Role.STUDENT]: 1,
};

/**
 * Check if a role has sufficient privileges compared to required role
 * @param userRole - The role of the current user
 * @param requiredRole - The minimum required role
 * @returns true if user role meets or exceeds required role level
 */
export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is super admin
 * @param role - User's role
 * @returns true if user is super admin
 */
export function isSuperAdmin(role: string | Role): boolean {
  return role === Role.SUPER_ADMIN;
}

/**
 * Check if user is admin or higher
 * @param role - User's role
 * @returns true if user is admin or super admin
 */
export function isAdmin(role: string | Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

/**
 * Check if user is instructor
 * @param role - User's role
 * @returns true if user is instructor
 */
export function isInstructor(role: string | Role): boolean {
  return role === Role.INSTRUCTOR;
}

/**
 * Check if user is student
 * @param role - User's role
 * @returns true if user is student
 */
export function isStudent(role: string | Role): boolean {
  return role === Role.STUDENT;
}

/**
 * Get all roles that have at least the specified level
 * @param minLevel - Minimum hierarchy level
 * @returns Array of roles meeting the criteria
 */
export function getRolesAtLevel(minLevel: number): Role[] {
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level >= minLevel)
    .map(([role, _]) => role as Role);
}
