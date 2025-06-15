import {
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc';
import { z } from 'zod';
import { UserService } from '../common/services/user.service';
import { TrpcAuthMiddleware } from '../auth/middleware/trpc-auth.middleware';
import { LoggedMiddleware } from '../common/middleware/logger.middleware';
import { AuthenticatedContext } from '../common/types/trpc.types';
import {
  requireAdmin,
  requireUserOrAdmin,
  RequireAdmin,
} from '../auth/decorators/auth-decorators';
import { publicUserSchema, roleSchema } from '../database/schemas/users.schema';

@Router({ alias: 'user' })
@UseMiddlewares(LoggedMiddleware)
export class UserRouter {
  constructor(private readonly userService: UserService) {}

  // Get current user profile (user or admin) - using utility function
  @Query({
    output: publicUserSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getProfile(@Ctx() ctx: AuthenticatedContext) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    const userRecord = await this.userService.findById(user.id);
    if (!userRecord) {
      throw new Error('User not found');
    }

    return this.userService.toPublicUser(userRecord);
  }

  // Update current user profile (user or admin) - using utility function
  @Mutation({
    input: z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    }),
    output: publicUserSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async updateProfile(
    @Input() input: { name?: string; email?: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    const updatedUser = await this.userService.updateById(user.id, input);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return this.userService.toPublicUser(updatedUser);
  }

  // Admin-only: Get all users - using decorator
  @Query({
    input: z
      .object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
      .optional(),
    output: z.array(publicUserSchema),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  @RequireAdmin() // Using decorator approach
  async getAllUsers(
    @Input() input: { limit?: number; offset?: number } = {},
    @Ctx() ctx: AuthenticatedContext,
  ) {
    console.log(
      'Admin getting all users:',
      ctx.user.id,
      'Role:',
      ctx.user.role,
    );
    const users = await this.userService.findAll(
      input.limit || 50,
      input.offset || 0,
    );

    return users.map((user) => this.userService.toPublicUser(user));
  }

  // Admin-only: Get user by ID - using utility function
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: publicUserSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getUserById(@Input('id') id: string, @Ctx() ctx: AuthenticatedContext) {
    // Use utility function for role validation
    const adminUser = requireAdmin(ctx);

    console.log('Admin', adminUser.id, 'getting user:', id);

    const user = await this.userService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userService.toPublicUser(user);
  }

  // Admin-only: Update user role - mixing decorator and utility function
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      role: roleSchema,
    }),
    output: publicUserSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  @RequireAdmin() // Decorator for basic validation
  async updateUserRole(
    @Input() input: { id: string; role: 'public' | 'user' | 'admin' },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Additional validation using utility function
    const adminUser = requireAdmin(ctx);

    console.log(
      'Admin updating user role:',
      input.id,
      'to',
      input.role,
      'by',
      adminUser.id,
    );

    const updatedUser = await this.userService.updateById(input.id, {
      role: input.role,
    });

    if (!updatedUser) {
      throw new Error('Failed to update user role');
    }

    return this.userService.toPublicUser(updatedUser);
  }

  // Admin-only: Deactivate user - using decorator
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: z.boolean(),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  @RequireAdmin() // Using decorator approach
  async deactivateUser(
    @Input('id') id: string,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    console.log('Admin deactivating user:', id, 'by', ctx.user.id);

    const result = await this.userService.softDeleteById(id);
    return result;
  }

  // Admin-only: Get user statistics - using utility function
  @Query({
    output: z.object({
      total: z.number(),
      active: z.number(),
      inactive: z.number(),
      byRole: z.object({
        public: z.number(),
        user: z.number(),
        admin: z.number(),
      }),
    }),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getUserStats(@Ctx() ctx: AuthenticatedContext) {
    // Use utility function for role validation
    const adminUser = requireAdmin(ctx);

    console.log('Admin', adminUser.id, 'getting user statistics');

    const total = await this.userService.count();
    // For now, return basic stats - in a real app you'd implement proper counting
    return {
      total,
      active: total, // Simplified - would need proper active count
      inactive: 0, // Simplified - would need proper inactive count
      byRole: {
        public: 0, // Would need role-based counting
        user: total, // Simplified
        admin: 0, // Would need role-based counting
      },
    };
  }
}
