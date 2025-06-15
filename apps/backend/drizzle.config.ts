import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine if we're running tests
const isTest =
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event?.includes('test');

// Use test database for testing, Neon for everything else
const getDatabaseConfig = () => {
  if (isTest) {
    // Use local Docker PostgreSQL for tests
    return {
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: 'password',
      database: 'turbo_fullstack_test',
      ssl: false,
    };
  }

  // Use Neon PostgreSQL for development and production
  if (process.env.DATABASE_URL) {
    // If DATABASE_URL is provided, use it directly
    return {
      url: process.env.DATABASE_URL,
    };
  }

  // Fallback to individual environment variables for Neon
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'turbo_fullstack',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
};

export default defineConfig({
  schema: './src/database/schemas/*.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: getDatabaseConfig(),
  verbose: true,
  strict: true,
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
});
