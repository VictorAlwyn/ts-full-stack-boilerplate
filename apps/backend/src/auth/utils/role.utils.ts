import { TRPCError } from '@trpc/server';
import { UserRole } from '../../database/schemas/users.schema';

// Check if user has required role
export const checkUserRole = (
  userRole: UserRole,
  requiredRoles: UserRole[],
): boolean => {
  return requiredRoles.includes(userRole);
};

// Check if user is admin
export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

// Check if user is user or admin
export const isUserOrAdmin = (userRole: UserRole): boolean => {
  return ['user', 'admin'].includes(userRole);
};

// Check if user has public access or higher
export const hasPublicAccess = (userRole: UserRole): boolean => {
  return ['public', 'user', 'admin'].includes(userRole);
};

// Throw error if user doesn't have required role
export const requireRole = (
  userRole: UserRole,
  requiredRoles: UserRole[],
  errorMessage?: string,
): void => {
  if (!checkUserRole(userRole, requiredRoles)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        errorMessage ||
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
    });
  }
};

// Throw error if user is not admin
export const requireAdmin = (userRole: UserRole): void => {
  requireRole(userRole, ['admin'], 'Admin access required');
};

// Throw error if user is not user or admin
export const requireUserOrAdmin = (userRole: UserRole): void => {
  requireRole(userRole, ['user', 'admin'], 'User or Admin access required');
};
