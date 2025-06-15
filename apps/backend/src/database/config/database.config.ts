import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { users } from '../schemas/users.schema';
import { todos, usersRelations, todosRelations } from '../schemas/todos.schema';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionString?: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  isNeon: boolean;
}

// Schema object for Drizzle
const schema = {
  users,
  todos,
  usersRelations,
  todosRelations,
};

@Injectable()
export class DatabaseService {
  private static instance: DatabaseService;
  private _db!: ReturnType<typeof drizzle>;
  private _client!: ReturnType<typeof postgres>;

  constructor() {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }

    const config = this.getConfig();
    this._client = this.createClient(config);
    this._db = drizzle(this._client, { schema });

    DatabaseService.instance = this;
  }

  private getConfig(): DatabaseConfig {
    const isNeon =
      !!process.env.DATABASE_URL || !!process.env.NEON_DATABASE_URL;
    const connectionString =
      process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

    const config: DatabaseConfig = {
      // Traditional PostgreSQL Configuration
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'turbo_fullstack',

      // Connection Settings
      ssl:
        isNeon || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      maxConnections:
        Number(process.env.DB_MAX_CONNECTIONS) || (isNeon ? 10 : 20),
      idleTimeout: Number(process.env.DB_IDLE_TIMEOUT) || 30,
      connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT) || 2,
      isNeon,
    };

    // Add connection string if available
    if (connectionString) {
      config.connectionString = connectionString;
    }

    return config;
  }

  private createClient(config: DatabaseConfig): ReturnType<typeof postgres> {
    let connectionString: string;

    if (config.connectionString) {
      // Use connection string (Neon or other cloud providers)
      connectionString = config.connectionString;
    } else {
      // Build connection string from individual components
      connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientConfig: any = {
      max: config.maxConnections,
      idle_timeout: config.idleTimeout,
      connect_timeout: config.connectionTimeout,
      ssl: config.ssl,
      debug: process.env.NODE_ENV === 'development' && !config.isNeon,
      // Neon-specific optimizations
      ...(config.isNeon && {
        prepare: false, // Neon doesn't support prepared statements
        transform: {
          undefined: null, // Transform undefined to null for Neon
        },
      }),
    };

    // Only add onnotice if in development and not using Neon
    if (process.env.NODE_ENV === 'development' && !config.isNeon) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      clientConfig.onnotice = console.log;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return postgres(connectionString, clientConfig);
  }

  get db() {
    return this._db;
  }

  get client() {
    return this._client;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this._client`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this._client.end();
  }

  // Test database utilities
  async clearDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('clearDatabase can only be called in test environment');
    }

    await this._client`TRUNCATE TABLE todos CASCADE`;
    await this._client`TRUNCATE TABLE users CASCADE`;
  }

  resetSequences(): void {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('resetSequences can only be called in test environment');
    }

    // Reset any sequences if needed (UUIDs don't need this, but keeping for future use)
    // This is a placeholder for future sequence resets if needed
  }
}
