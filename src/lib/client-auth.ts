// Client-side authentication helpers
// These functions are safe to use in browser environments

export type UserRole = 'VIEWER' | 'PRUEFER_A' | 'PRUEFER_B' | 'PRUEFER_AB' | 'MANAGEMENT' | 'ADMIN';

/**
 * Check if user can act as Prüfer A
 */
export function canActAsProeferA(userRole: UserRole): boolean {
  return ['PRUEFER_A', 'PRUEFER_AB', 'MANAGEMENT', 'ADMIN'].includes(userRole);
}

/**
 * Check if user can act as Prüfer B
 */
export function canActAsProeferB(userRole: UserRole): boolean {
  return ['PRUEFER_B', 'PRUEFER_AB', 'MANAGEMENT', 'ADMIN'].includes(userRole);
}

/**
 * Check if user can access database management
 */
export function canAccessDatabase(userRole: UserRole): boolean {
  return ['MANAGEMENT', 'ADMIN'].includes(userRole);
}

/**
 * Check if user has required role level
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'VIEWER': 0,
    'PRUEFER_B': 1,
    'PRUEFER_A': 2,
    'PRUEFER_AB': 3,
    'MANAGEMENT': 4,
    'ADMIN': 5
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
