import { TRPCError } from '@trpc/server';
import {
  checkUserRole,
  isAdmin,
  isUserOrAdmin,
  hasPublicAccess,
  requireRole,
  requireAdmin,
  requireUserOrAdmin,
} from '../utils/role.utils';
import { UserRole } from '../../database/schemas/users.schema';

describe('Role-Based Authentication Utils', () => {
  describe('checkUserRole', () => {
    it('should return true when user has required role', () => {
      expect(checkUserRole('admin', ['admin'])).toBe(true);
      expect(checkUserRole('user', ['user', 'admin'])).toBe(true);
      expect(checkUserRole('public', ['public', 'user', 'admin'])).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      expect(checkUserRole('user', ['admin'])).toBe(false);
      expect(checkUserRole('public', ['user', 'admin'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin('admin')).toBe(true);
    });

    it('should return false for non-admin roles', () => {
      expect(isAdmin('user')).toBe(false);
      expect(isAdmin('public')).toBe(false);
    });
  });

  describe('isUserOrAdmin', () => {
    it('should return true for user and admin roles', () => {
      expect(isUserOrAdmin('user')).toBe(true);
      expect(isUserOrAdmin('admin')).toBe(true);
    });

    it('should return false for public role', () => {
      expect(isUserOrAdmin('public')).toBe(false);
    });
  });

  describe('hasPublicAccess', () => {
    it('should return true for all roles', () => {
      expect(hasPublicAccess('public')).toBe(true);
      expect(hasPublicAccess('user')).toBe(true);
      expect(hasPublicAccess('admin')).toBe(true);
    });
  });

  describe('requireRole', () => {
    it('should not throw when user has required role', () => {
      expect(() => requireRole('admin', ['admin'])).not.toThrow();
      expect(() => requireRole('user', ['user', 'admin'])).not.toThrow();
    });

    it('should throw TRPCError when user does not have required role', () => {
      expect(() => requireRole('user', ['admin'])).toThrow(TRPCError);
      expect(() => requireRole('public', ['user', 'admin'])).toThrow(TRPCError);
    });

    it('should throw with custom error message', () => {
      const customMessage = 'Custom access denied message';
      expect(() => requireRole('user', ['admin'], customMessage)).toThrow(
        customMessage,
      );
    });
  });

  describe('requireAdmin', () => {
    it('should not throw for admin role', () => {
      expect(() => requireAdmin('admin')).not.toThrow();
    });

    it('should throw for non-admin roles', () => {
      expect(() => requireAdmin('user')).toThrow(TRPCError);
      expect(() => requireAdmin('public')).toThrow(TRPCError);
    });

    it('should throw with admin-specific message', () => {
      expect(() => requireAdmin('user')).toThrow('Admin access required');
    });
  });

  describe('requireUserOrAdmin', () => {
    it('should not throw for user and admin roles', () => {
      expect(() => requireUserOrAdmin('user')).not.toThrow();
      expect(() => requireUserOrAdmin('admin')).not.toThrow();
    });

    it('should throw for public role', () => {
      expect(() => requireUserOrAdmin('public')).toThrow(TRPCError);
    });

    it('should throw with user-or-admin-specific message', () => {
      expect(() => requireUserOrAdmin('public')).toThrow(
        'User or Admin access required',
      );
    });
  });

  describe('Role hierarchy validation', () => {
    const testCases: Array<{
      role: UserRole;
      canAccessPublic: boolean;
      canAccessUser: boolean;
      canAccessAdmin: boolean;
    }> = [
      {
        role: 'public',
        canAccessPublic: true,
        canAccessUser: false,
        canAccessAdmin: false,
      },
      {
        role: 'user',
        canAccessPublic: true,
        canAccessUser: true,
        canAccessAdmin: false,
      },
      {
        role: 'admin',
        canAccessPublic: true,
        canAccessUser: true,
        canAccessAdmin: true,
      },
    ];

    testCases.forEach(
      ({ role, canAccessPublic, canAccessUser, canAccessAdmin }) => {
        describe(`${role} role`, () => {
          it(`should ${canAccessPublic ? 'have' : 'not have'} public access`, () => {
            if (canAccessPublic) {
              expect(() =>
                requireRole(role, ['public', 'user', 'admin']),
              ).not.toThrow();
            } else {
              expect(() =>
                requireRole(role, ['public', 'user', 'admin']),
              ).toThrow();
            }
          });

          it(`should ${canAccessUser ? 'have' : 'not have'} user access`, () => {
            if (canAccessUser) {
              expect(() => requireUserOrAdmin(role)).not.toThrow();
            } else {
              expect(() => requireUserOrAdmin(role)).toThrow();
            }
          });

          it(`should ${canAccessAdmin ? 'have' : 'not have'} admin access`, () => {
            if (canAccessAdmin) {
              expect(() => requireAdmin(role)).not.toThrow();
            } else {
              expect(() => requireAdmin(role)).toThrow();
            }
          });
        });
      },
    );
  });
});
