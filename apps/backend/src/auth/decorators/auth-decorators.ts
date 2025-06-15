import { TRPCError } from '@trpc/server';
import { UserRole } from '../../database/schemas/users.schema';
import { AuthenticatedContext } from '../../common/types/trpc.types';

// Type for authenticated user from context
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Helper function to extract user from context
function extractUserFromContext(ctx: AuthenticatedContext): AuthenticatedUser {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return ctx.user;
}

// Helper function to validate user role
function validateUserRole(
  user: AuthenticatedUser,
  requiredRoles: UserRole[],
): void {
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
    });
  }
}

// Utility functions that can be used directly in methods (recommended approach)
export function requireAuth(ctx: AuthenticatedContext): AuthenticatedUser {
  return extractUserFromContext(ctx);
}

export function requireAdmin(ctx: AuthenticatedContext): AuthenticatedUser {
  const user = extractUserFromContext(ctx);
  validateUserRole(user, ['admin']);
  return user;
}

export function requireUserOrAdmin(
  ctx: AuthenticatedContext,
): AuthenticatedUser {
  const user = extractUserFromContext(ctx);
  validateUserRole(user, ['user', 'admin']);
  return user;
}

export function requireRole(
  ctx: AuthenticatedContext,
  ...roles: UserRole[]
): AuthenticatedUser {
  const user = extractUserFromContext(ctx);
  validateUserRole(user, roles);
  return user;
}

// Check functions (return boolean instead of throwing)
export function isAuthenticated(ctx: AuthenticatedContext): boolean {
  return !!ctx.user;
}

export function hasRole(
  ctx: AuthenticatedContext,
  ...roles: UserRole[]
): boolean {
  if (!ctx.user) return false;
  return roles.includes(ctx.user.role);
}

export function isAdmin(ctx: AuthenticatedContext): boolean {
  return hasRole(ctx, 'admin');
}

export function isUserOrAdmin(ctx: AuthenticatedContext): boolean {
  return hasRole(ctx, 'user', 'admin');
}

// Method decorator factory for role validation (experimental - use utility functions above for better type safety)
export function RequireRoles(...roles: UserRole[]) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalMethod = descriptor.value;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      // Find the context parameter (usually the last parameter in tRPC methods)
      let ctx: AuthenticatedContext | undefined;

      // Look for context in the arguments
      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg && typeof arg === 'object' && arg !== null && 'user' in arg) {
          ctx = arg as AuthenticatedContext;
          break;
        }
      }

      if (!ctx) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Context not found in method arguments',
        });
      }

      const user = extractUserFromContext(ctx);
      validateUserRole(user, roles);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Specific role decorators (experimental - use utility functions above for better type safety)
export const RequireAdmin = () => RequireRoles('admin');
export const RequireUserOrAdmin = () => RequireRoles('user', 'admin');
export const RequireAuth = () => RequireRoles('public', 'user', 'admin');
