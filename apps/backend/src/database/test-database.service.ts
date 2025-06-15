import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { users } from './schemas/users.schema';
import { todos, usersRelations, todosRelations } from './schemas/todos.schema';

// Schema object for Drizzle
const schema = {
  users,
  todos,
  usersRelations,
  todosRelations,
};

@Injectable()
export class TestDatabaseService {
  private container?: StartedPostgreSqlContainer;
  private _db?: ReturnType<typeof drizzle>;
  private _client?: ReturnType<typeof postgres>;

  async setupTestDatabase(): Promise<void> {
    if (process.env.TEST_DATABASE_URL) {
      // Use existing test database
      this._client = postgres(process.env.TEST_DATABASE_URL, {
        max: 5,
        idle_timeout: 20,
        connect_timeout: 2,
      });
    } else {
      // Use testcontainers for isolated testing
      this.container = await new PostgreSqlContainer('postgres:15-alpine')
        .withDatabase('test_db')
        .withUsername('test_user')
        .withPassword('test_password')
        .start();

      const connectionString = this.container.getConnectionUri();
      this._client = postgres(connectionString, {
        max: 5,
        idle_timeout: 20,
        connect_timeout: 2,
      });
    }

    this._db = drizzle(this._client, { schema });
    await this.runMigrations();
  }

  async teardownTestDatabase(): Promise<void> {
    if (this._client) {
      await this._client.end();
    }
    if (this.container) {
      await this.container.stop();
    }
  }

  async clearDatabase(): Promise<void> {
    if (!this._client) {
      throw new Error('Test database not initialized');
    }

    // Clear all data but keep schema
    await this._client`TRUNCATE TABLE todos CASCADE`;
    await this._client`TRUNCATE TABLE users CASCADE`;
  }

  private async runMigrations(): Promise<void> {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }

    // Create the priority enum
    await this._client`
      DO $$ BEGIN
        CREATE TYPE priority AS ENUM('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create the user_role enum
    await this._client`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM('public', 'user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create users table
    await this._client`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        name varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        role user_role DEFAULT 'user' NOT NULL,
        email_verified boolean DEFAULT false NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `;

    // Create todos table
    await this._client`
      CREATE TABLE IF NOT EXISTS todos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        description text,
        completed boolean DEFAULT false NOT NULL,
        priority priority DEFAULT 'medium' NOT NULL,
        due_date timestamp with time zone,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `;

    // Create indexes
    await this
      ._client`CREATE INDEX IF NOT EXISTS users_email_idx ON users(email)`;
    await this
      ._client`CREATE INDEX IF NOT EXISTS users_role_idx ON users(role)`;
    await this
      ._client`CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at)`;
    await this
      ._client`CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id)`;
    await this
      ._client`CREATE INDEX IF NOT EXISTS todos_completed_idx ON todos(completed)`;
    await this
      ._client`CREATE INDEX IF NOT EXISTS todos_priority_idx ON todos(priority)`;
    await this
      ._client`CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at)`;
  }

  get db() {
    if (!this._db) {
      throw new Error('Test database not initialized');
    }
    return this._db;
  }

  get client() {
    if (!this._client) {
      throw new Error('Test database client not initialized');
    }
    return this._client;
  }
}
