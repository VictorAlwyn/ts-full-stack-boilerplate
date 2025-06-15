import { Request, Response } from 'express';
import { MiddlewareOptions } from 'nestjs-trpc';
import { UserRole } from '../../database/schemas/users.schema';

// Base context type that includes Express request/response
export interface BaseContext {
  req: Request;
  res: Response;
}

// Authenticated context type with user information including role
export interface AuthenticatedContext extends BaseContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

// tRPC middleware options with proper typing
export interface TypedMiddlewareOptions extends MiddlewareOptions {
  ctx: BaseContext;
}

// Auth middleware options with authenticated context
export interface AuthMiddlewareOptions extends MiddlewareOptions {
  ctx: AuthenticatedContext;
}

// Middleware result type
export interface MiddlewareResult<T = unknown> {
  data?: T;
  error?: Error;
}

// Logger middleware context
export interface LoggerMiddlewareContext {
  path: string;
  type: string;
  durationMs: number;
  error?: string;
}
