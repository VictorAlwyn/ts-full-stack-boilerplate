import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { UserRole, PublicUser } from '../../database/schemas/users.schema';
import { AuthenticatedContext } from '../../common/types/trpc.types';

// Interface for HTTP request with user
interface RequestWithUser {
  user?: PublicUser;
}

// Metadata keys
export const REQUIRE_ROLES_KEY = 'require_roles';
export const REQUIRE_AUTH_KEY = 'require_auth';

// Role requirement decorators
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(REQUIRE_ROLES_KEY, roles);
export const RequireAdmin = () => RequireRoles('admin');
export const RequireUserOrAdmin = () => RequireRoles('user', 'admin');
export const RequireAuth = () => SetMetadata(REQUIRE_AUTH_KEY, true);

// Parameter decorator to get authenticated user with role validation
export const AuthUser = createParamDecorator(
  (
    requiredRoles: UserRole[] | undefined,
    ctx: ExecutionContext,
  ): PublicUser => {
    // For HTTP requests (REST endpoints)
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (request && request.user) {
      const user = request.user;

      if (requiredRoles && requiredRoles.length > 0) {
        if (!user.role || !requiredRoles.includes(user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
          });
        }
      }

      return user;
    }

    // For tRPC context (if available in args)
    const args = ctx.getArgs();
    if (args && args.length > 0) {
      // Look for context in tRPC args
      for (const arg of args) {
        if (arg && typeof arg === 'object' && 'user' in arg) {
          const authCtx = arg as AuthenticatedContext;
          const user = authCtx.user;

          if (requiredRoles && requiredRoles.length > 0) {
            if (!user.role || !requiredRoles.includes(user.role)) {
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
              });
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: false, // Default values for PublicUser interface
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      }
    }

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  },
);

// Specific user decorators with built-in role validation
export const AdminUser = () => AuthUser(['admin']);
export const UserOrAdminUser = () => AuthUser(['user', 'admin']);
export const AnyAuthenticatedUser = () => AuthUser();

// Method decorator that validates roles automatically
export function ValidateRoles(...roles: UserRole[]) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      // Find the context argument (usually the last one in tRPC)
      let ctx: AuthenticatedContext | undefined;

      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg && typeof arg === 'object' && arg !== null && 'user' in arg) {
          ctx = arg as AuthenticatedContext;
          break;
        }
      }

      if (!ctx || !ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      if (roles.length > 0 && !roles.includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${roles.join(', ')}`,
        });
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}

// Specific validation decorators
export const AdminOnly = () => ValidateRoles('admin');
export const UserOrAdminOnly = () => ValidateRoles('user', 'admin');
export const AuthenticatedOnly = () => ValidateRoles('public', 'user', 'admin');
