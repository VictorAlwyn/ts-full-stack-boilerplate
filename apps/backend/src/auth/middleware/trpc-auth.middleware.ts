import { Injectable } from '@nestjs/common';
import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../common/services/user.service';
import { JwtPayload } from '../strategies/jwt.strategy';
import { TypedMiddlewareOptions } from '../../common/types/trpc.types';

@Injectable()
export class TrpcAuthMiddleware implements TRPCMiddleware {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async use(opts: TypedMiddlewareOptions): Promise<any> {
    try {
      const { ctx, next } = opts;
      const { req } = ctx;

      if (!req) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Request not found in context',
        });
      }

      const authHeader = req.headers.authorization;
      if (
        !authHeader ||
        typeof authHeader !== 'string' ||
        !authHeader.startsWith('Bearer ')
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.substring(7);

      let payload: JwtPayload;
      try {
        payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      } catch {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found or inactive',
        });
      }

      const publicUser = this.userService.toPublicUser(user);

      return next({
        ctx: {
          ...ctx,
          user: {
            id: publicUser.id,
            email: publicUser.email,
            name: publicUser.name,
            role: publicUser.role,
          },
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication failed',
      });
    }
  }
}
