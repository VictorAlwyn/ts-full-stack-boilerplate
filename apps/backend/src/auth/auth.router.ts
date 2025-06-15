import {
  Mutation,
  Query,
  Router,
  Input,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc';
import { AuthService } from './auth.service';
import {
  registerDto,
  loginDto,
  authResponseDto,
  RegisterDto,
  LoginDto,
} from './dto/auth.dto';
import {
  getErrorMessage,
  isTRPCError,
  createTRPCError,
} from '../common/utils/error.utils';
import { TrpcAuthMiddleware } from './middleware/trpc-auth.middleware';
import { AuthenticatedContext } from '../common/types/trpc.types';
import { publicUserSchema } from '../database/schemas/users.schema';
import { requireUserOrAdmin } from './decorators/auth-decorators';

@Router({ alias: 'auth' })
export class AuthRouter {
  constructor(private readonly authService: AuthService) {}

  @Mutation({
    input: registerDto,
    output: authResponseDto,
  })
  async register(@Input() input: RegisterDto) {
    try {
      return await this.authService.register(input);
    } catch (error) {
      if (isTRPCError(error)) {
        throw error;
      }
      throw createTRPCError('BAD_REQUEST', getErrorMessage(error));
    }
  }

  @Mutation({
    input: loginDto,
    output: authResponseDto,
  })
  async login(@Input() input: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        input.email,
        input.password,
      );
      if (!user) {
        throw createTRPCError('UNAUTHORIZED', 'Invalid credentials');
      }
      return await this.authService.login(user);
    } catch (error) {
      if (isTRPCError(error)) {
        throw error;
      }
      throw createTRPCError('INTERNAL_SERVER_ERROR', 'Login failed');
    }
  }

  @Query({
    output: publicUserSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  me(@Ctx() ctx: AuthenticatedContext) {
    try {
      // Use utility function for role validation
      const user = requireUserOrAdmin(ctx);

      // Return the user from context (already validated by middleware)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: false, // Default value
        isActive: true, // Default value
        createdAt: new Date(), // Default value
        updatedAt: new Date(), // Default value
      };
    } catch (error) {
      if (isTRPCError(error)) {
        throw error;
      }
      throw createTRPCError('UNAUTHORIZED', 'Authentication required');
    }
  }
}
