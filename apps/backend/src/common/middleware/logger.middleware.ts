import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { Inject, Injectable, ConsoleLogger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { Request } from 'express';
import { BaseContext } from '../types/trpc.types';

interface ExtendedContext extends BaseContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoggedMiddleware implements TRPCMiddleware {
  constructor(
    @Inject(ConsoleLogger) private readonly consoleLogger: ConsoleLogger,
  ) {}

  use(opts: MiddlewareOptions): Promise<any> {
    const start = Date.now();
    const { next, path, type, ctx, input } = opts;
    const requestId = this.generateRequestId();

    // Extract request information with proper typing
    const context = ctx as ExtendedContext;
    const req = context?.req;
    const userAgent = req?.headers['user-agent'];
    const clientIp = this.getClientIp(req);
    const user = context?.user;

    // Log request start
    const startLogData = {
      requestId,
      path,
      type,
      method: req?.method,
      url: req?.url,
      userAgent,
      clientIp,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      inputSize: this.getObjectSize(input),
      timestamp: new Date().toISOString(),
    };

    this.consoleLogger.log('🚀 Request started', startLogData);

    return next()
      .then((result: unknown) => {
        const durationMs = Date.now() - start;
        const outputSize = this.getObjectSize(result);

        const successLogData = {
          requestId,
          path,
          type,
          method: req?.method,
          url: req?.url,
          status: 'SUCCESS',
          durationMs,
          userId: user?.id,
          userEmail: user?.email,
          userRole: user?.role,
          clientIp,
          userAgent,
          inputSize: this.getObjectSize(input),
          outputSize,
          timestamp: new Date().toISOString(),
          performance: this.getPerformanceCategory(durationMs),
        };

        // Use different log levels based on performance
        if (durationMs > 5000) {
          this.consoleLogger.warn('🐌 Slow request completed', successLogData);
        } else if (durationMs > 2000) {
          this.consoleLogger.log('⚠️ Request completed (slow)', successLogData);
        } else {
          this.consoleLogger.log('✅ Request completed', successLogData);
        }

        return result;
      })
      .catch((error: unknown) => {
        const durationMs = Date.now() - start;
        const isBusinessError = error instanceof TRPCError;

        const errorLogData = {
          requestId,
          path,
          type,
          method: req?.method,
          url: req?.url,
          status: 'ERROR',
          durationMs,
          userId: user?.id,
          userEmail: user?.email,
          userRole: user?.role,
          clientIp,
          userAgent,
          inputSize: this.getObjectSize(input),
          timestamp: new Date().toISOString(),
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            code: error instanceof TRPCError ? error.code : 'UNKNOWN',
            cause: error instanceof TRPCError ? error.cause : undefined,
            stack:
              error instanceof Error
                ? this.sanitizeStackTrace(error.stack)
                : undefined,
            isBusinessError,
          },
          // Sanitized input for error debugging (remove sensitive data)
          sanitizedInput: this.sanitizeInput(input),
        };

        // Use appropriate log level based on error type
        if (isBusinessError && error.code === 'UNAUTHORIZED') {
          this.consoleLogger.warn('🔒 Authentication error', errorLogData);
        } else if (
          isBusinessError &&
          ['BAD_REQUEST', 'NOT_FOUND', 'FORBIDDEN'].includes(error.code)
        ) {
          this.consoleLogger.warn('⚠️ Client error', errorLogData);
        } else {
          this.consoleLogger.error('❌ Request failed', errorLogData);
        }

        throw error;
      });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIp(req?: Request): string {
    if (!req) return 'unknown';

    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  private getObjectSize(obj: unknown): string {
    if (!obj) return '0B';
    try {
      const bytes = Buffer.byteLength(JSON.stringify(obj));
      return this.formatBytes(bytes);
    } catch {
      return 'unknown';
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))}${sizes[i]}`;
  }

  private getPerformanceCategory(durationMs: number): string {
    if (durationMs < 100) return 'fast';
    if (durationMs < 500) return 'normal';
    if (durationMs < 2000) return 'slow';
    if (durationMs < 5000) return 'very_slow';
    return 'critical';
  }

  private sanitizeStackTrace(stack?: string): string {
    if (!stack) return '';
    // Remove sensitive file paths and keep only relevant stack information
    return stack
      .split('\n')
      .slice(0, 10) // Limit stack trace length
      .map((line) => line.replace(/\/.*\/node_modules\//, '/node_modules/'))
      .join('\n');
  }

  private sanitizeInput(input: unknown): unknown {
    if (!input || typeof input !== 'object') return input;

    // Create a deep copy and remove sensitive fields
    const sanitized = JSON.parse(JSON.stringify(input)) as Record<
      string,
      unknown
    >;

    // Recursively remove sensitive data
    this.removeSensitiveFields(sanitized);

    return sanitized;
  }

  private removeSensitiveFields(obj: Record<string, unknown>): void {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'authorization',
      'credential',
      'ssn',
      'creditCard',
      'bankAccount',
    ];

    for (const key in obj) {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.removeSensitiveFields(obj[key] as Record<string, unknown>);
      }
    }
  }
}
