import { TRPCError } from '@trpc/server';
import {
  requireAuth,
  requireAdmin,
  requireUserOrAdmin,
  requireRole,
  isAuthenticated,
  hasRole,
  isAdmin,
  isUserOrAdmin,
  RequireRoles,
  RequireAdmin,
  RequireUserOrAdmin,
  RequireAuth,
} from '../decorators/auth-decorators';
import { AuthenticatedContext } from '../../common/types/trpc.types';
import { UserRole } from '../../database/schemas/users.schema';

// Mock context helper
function createMockContext(role: UserRole): AuthenticatedContext {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role,
    },
  } as AuthenticatedContext;
}

function createEmptyContext(): AuthenticatedContext {
  return {} as AuthenticatedContext;
}

describe('Authentication Decorators and Utilities', () => {
  describe('Utility Functions', () => {
    describe('requireAuth', () => {
      it('should return user when authenticated', () => {
        const ctx = createMockContext('user');
        const user = requireAuth(ctx);
        expect(user).toEqual(ctx.user);
      });

      it('should throw when not authenticated', () => {
        const ctx = createEmptyContext();
        expect(() => requireAuth(ctx)).toThrow(TRPCError);
        expect(() => requireAuth(ctx)).toThrow('Authentication required');
      });
    });

    describe('requireAdmin', () => {
      it('should return user when user is admin', () => {
        const ctx = createMockContext('admin');
        const user = requireAdmin(ctx);
        expect(user).toEqual(ctx.user);
      });

      it('should throw when user is not admin', () => {
        const ctx = createMockContext('user');
        expect(() => requireAdmin(ctx)).toThrow(TRPCError);
        expect(() => requireAdmin(ctx)).toThrow('Access denied');
      });

      it('should throw when not authenticated', () => {
        const ctx = createEmptyContext();
        expect(() => requireAdmin(ctx)).toThrow(TRPCError);
        expect(() => requireAdmin(ctx)).toThrow('Authentication required');
      });
    });

    describe('requireUserOrAdmin', () => {
      it('should return user when user has user role', () => {
        const ctx = createMockContext('user');
        const user = requireUserOrAdmin(ctx);
        expect(user).toEqual(ctx.user);
      });

      it('should return user when user has admin role', () => {
        const ctx = createMockContext('admin');
        const user = requireUserOrAdmin(ctx);
        expect(user).toEqual(ctx.user);
      });

      it('should throw when user has public role', () => {
        const ctx = createMockContext('public');
        expect(() => requireUserOrAdmin(ctx)).toThrow(TRPCError);
        expect(() => requireUserOrAdmin(ctx)).toThrow('Access denied');
      });
    });

    describe('requireRole', () => {
      it('should return user when user has required role', () => {
        const ctx = createMockContext('admin');
        const user = requireRole(ctx, 'admin');
        expect(user).toEqual(ctx.user);
      });

      it('should return user when user has one of multiple required roles', () => {
        const ctx = createMockContext('user');
        const user = requireRole(ctx, 'user', 'admin');
        expect(user).toEqual(ctx.user);
      });

      it('should throw when user does not have required role', () => {
        const ctx = createMockContext('public');
        expect(() => requireRole(ctx, 'admin')).toThrow(TRPCError);
        expect(() => requireRole(ctx, 'user', 'admin')).toThrow(TRPCError);
      });
    });

    describe('Check Functions', () => {
      describe('isAuthenticated', () => {
        it('should return true when user is authenticated', () => {
          const ctx = createMockContext('user');
          expect(isAuthenticated(ctx)).toBe(true);
        });

        it('should return false when user is not authenticated', () => {
          const ctx = createEmptyContext();
          expect(isAuthenticated(ctx)).toBe(false);
        });
      });

      describe('hasRole', () => {
        it('should return true when user has the role', () => {
          const ctx = createMockContext('admin');
          expect(hasRole(ctx, 'admin')).toBe(true);
          expect(hasRole(ctx, 'user', 'admin')).toBe(true);
        });

        it('should return false when user does not have the role', () => {
          const ctx = createMockContext('user');
          expect(hasRole(ctx, 'admin')).toBe(false);
        });

        it('should return false when user is not authenticated', () => {
          const ctx = createEmptyContext();
          expect(hasRole(ctx, 'admin')).toBe(false);
        });
      });

      describe('isAdmin', () => {
        it('should return true for admin users', () => {
          const ctx = createMockContext('admin');
          expect(isAdmin(ctx)).toBe(true);
        });

        it('should return false for non-admin users', () => {
          const ctx = createMockContext('user');
          expect(isAdmin(ctx)).toBe(false);
        });
      });

      describe('isUserOrAdmin', () => {
        it('should return true for user and admin roles', () => {
          expect(isUserOrAdmin(createMockContext('user'))).toBe(true);
          expect(isUserOrAdmin(createMockContext('admin'))).toBe(true);
        });

        it('should return false for public role', () => {
          expect(isUserOrAdmin(createMockContext('public'))).toBe(false);
        });
      });
    });
  });

  describe('Method Decorators', () => {
    class TestClass {
      @RequireAdmin()
      adminOnlyMethod(ctx: AuthenticatedContext) {
        return `Admin method called by ${ctx.user.id}`;
      }

      @RequireUserOrAdmin()
      userOrAdminMethod(ctx: AuthenticatedContext) {
        return `User/Admin method called by ${ctx.user.id}`;
      }

      @RequireAuth()
      authenticatedMethod(ctx: AuthenticatedContext) {
        return `Authenticated method called by ${ctx.user.id}`;
      }

      @RequireRoles('admin', 'user')
      customRolesMethod(ctx: AuthenticatedContext) {
        return `Custom roles method called by ${ctx.user.id}`;
      }
    }

    let testInstance: TestClass;

    beforeEach(() => {
      testInstance = new TestClass();
    });

    describe('RequireAdmin decorator', () => {
      it('should allow admin users', () => {
        const ctx = createMockContext('admin');
        const result = testInstance.adminOnlyMethod(ctx);
        expect(result).toBe('Admin method called by test-user-id');
      });

      it('should reject non-admin users', () => {
        const ctx = createMockContext('user');
        expect(() => testInstance.adminOnlyMethod(ctx)).toThrow(TRPCError);
      });

      it('should reject unauthenticated users', () => {
        const ctx = createEmptyContext();
        expect(() => testInstance.adminOnlyMethod(ctx)).toThrow(TRPCError);
      });
    });

    describe('RequireUserOrAdmin decorator', () => {
      it('should allow user and admin roles', () => {
        const userCtx = createMockContext('user');
        const adminCtx = createMockContext('admin');

        expect(testInstance.userOrAdminMethod(userCtx)).toBe(
          'User/Admin method called by test-user-id',
        );
        expect(testInstance.userOrAdminMethod(adminCtx)).toBe(
          'User/Admin method called by test-user-id',
        );
      });

      it('should reject public users', () => {
        const ctx = createMockContext('public');
        expect(() => testInstance.userOrAdminMethod(ctx)).toThrow(TRPCError);
      });
    });

    describe('RequireAuth decorator', () => {
      it('should allow all authenticated users', () => {
        const publicCtx = createMockContext('public');
        const userCtx = createMockContext('user');
        const adminCtx = createMockContext('admin');

        expect(testInstance.authenticatedMethod(publicCtx)).toBe(
          'Authenticated method called by test-user-id',
        );
        expect(testInstance.authenticatedMethod(userCtx)).toBe(
          'Authenticated method called by test-user-id',
        );
        expect(testInstance.authenticatedMethod(adminCtx)).toBe(
          'Authenticated method called by test-user-id',
        );
      });

      it('should reject unauthenticated users', () => {
        const ctx = createEmptyContext();
        expect(() => testInstance.authenticatedMethod(ctx)).toThrow(TRPCError);
      });
    });

    describe('RequireRoles decorator', () => {
      it('should allow users with specified roles', () => {
        const userCtx = createMockContext('user');
        const adminCtx = createMockContext('admin');

        expect(testInstance.customRolesMethod(userCtx)).toBe(
          'Custom roles method called by test-user-id',
        );
        expect(testInstance.customRolesMethod(adminCtx)).toBe(
          'Custom roles method called by test-user-id',
        );
      });

      it('should reject users without specified roles', () => {
        const ctx = createMockContext('public');
        expect(() => testInstance.customRolesMethod(ctx)).toThrow(TRPCError);
      });
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages for unauthorized access', () => {
      const ctx = createMockContext('user');

      try {
        requireAdmin(ctx);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).message).toContain('Access denied');
        expect((error as TRPCError).message).toContain('admin');
      }
    });

    it('should provide clear error messages for unauthenticated access', () => {
      const ctx = createEmptyContext();

      try {
        requireAuth(ctx);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).message).toBe('Authentication required');
      }
    });
  });
});
