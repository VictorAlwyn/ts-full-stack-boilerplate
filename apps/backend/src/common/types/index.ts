// Export all type definitions from a central location
export * from './trpc.types';

// Re-export commonly used types from other modules
export type { User, PublicUser } from '../../database/schemas/users.schema';
export type { Todo } from '../../database/schemas/todos.schema';
export type { JwtPayload } from '../../auth/strategies/jwt.strategy';
export type {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
} from '../../auth/dto/auth.dto';
export type { SafeUser } from '../../auth/auth.service';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Database entity base type
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
