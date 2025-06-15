import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DatabaseService } from '../config/database.config';
import {
  users,
  User,
  InsertUser,
  UpdateUser,
  PublicUser,
} from '../schemas/users.schema';

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async findActiveByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);

    return result[0] ?? null;
  }

  async create(userData: InsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create user');
    }

    return result[0];
  }

  async updateById(id: string, userData: UpdateUser): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] ?? null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await this.db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  async verifyEmail(id: string): Promise<boolean> {
    const result = await this.db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.isActive, true));

    return result.length;
  }

  // Helper method to get public user data (without password)
  toPublicUser(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
