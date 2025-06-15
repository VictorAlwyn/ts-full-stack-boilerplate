import { TRPCError } from '@trpc/server';

/**
 * Type guard to check if an error is a TRPCError
 */
export function isTRPCError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}

/**
 * Type guard to check if an error is a standard Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isTRPCError(error)) {
    return error.message;
  }
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Create a standardized TRPC error
 */
export function createTRPCError(
  code: TRPCError['code'],
  message: string,
  cause?: unknown,
): TRPCError {
  return new TRPCError({
    code,
    message,
    cause,
  });
}
