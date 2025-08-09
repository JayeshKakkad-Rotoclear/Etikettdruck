import type { UserRole } from '@prisma/client';

/**
 * Role hierarchy and utility functions for authorization
 */

export const ROLE_HIERARCHY = {
  'VIEWER': 0,
  'PRUEFER_B': 1,
  'PRUEFER_A': 2,
  'PRUEFER_AB': 3,
  'MANAGEMENT': 4,
  'ADMIN': 5
} as const;

/**
 * Check if user has the required role level or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can perform Prüfer A actions
 */
export function canActAsProeferA(userRole: UserRole): boolean {
  return userRole === 'PRUEFER_A' || 
         userRole === 'PRUEFER_AB' || 
         hasRole(userRole, 'MANAGEMENT');
}

/**
 * Check if user can perform Prüfer B actions
 */
export function canActAsProeferB(userRole: UserRole): boolean {
  return userRole === 'PRUEFER_B' || 
         userRole === 'PRUEFER_AB' || 
         hasRole(userRole, 'MANAGEMENT');
}

/**
 * Check if user can access database management
 */
export function canAccessDatabase(userRole: UserRole): boolean {
  return hasRole(userRole, 'MANAGEMENT');
}

/**
 * Check if user can manage other users (admin functions)
 */
export function canManageUsers(userRole: UserRole): boolean {
  return userRole === 'ADMIN';
}

/**
 * Get German label for role
 */
export function getRoleLabel(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    'ADMIN': 'Administrator',
    'MANAGEMENT': 'Management',
    'PRUEFER_AB': 'Prüfer A & B',
    'PRUEFER_A': 'Prüfer A',
    'PRUEFER_B': 'Prüfer B',
    'VIEWER': 'Betrachter'
  };
  return roleLabels[role] || role;
}

/**
 * Get all available roles for dropdown/selection
 */
export function getAllRoles(): { value: UserRole; label: string }[] {
  return [
    { value: 'VIEWER', label: 'Betrachter' },
    { value: 'PRUEFER_B', label: 'Prüfer B' },
    { value: 'PRUEFER_A', label: 'Prüfer A' },
    { value: 'PRUEFER_AB', label: 'Prüfer A & B' },
    { value: 'MANAGEMENT', label: 'Management' },
    { value: 'ADMIN', label: 'Administrator' }
  ];
}

/**
 * Check if user can access a specific product type
 * This is flexible and can be extended based on business rules
 */
export function canAccessProduct(userRole: UserRole, productType: string): boolean {
  // For now, all authenticated users can access all products
  // But this can be customized per business requirements
  return true;
}

/**
 * Get CSS class for role badge
 */
export function getRoleBadgeClass(role: UserRole): string {
  const classMap: Record<UserRole, string> = {
    'ADMIN': 'role-admin',
    'MANAGEMENT': 'role-management',
    'PRUEFER_AB': 'role-pruefer-ab',
    'PRUEFER_A': 'role-pruefer-a',
    'PRUEFER_B': 'role-pruefer-b',
    'VIEWER': 'role-viewer'
  };
  return classMap[role] || 'role-viewer';
}
