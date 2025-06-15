import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '../src/database/config/database.config';
import { TestDatabaseService } from '../src/database/test-database.service';
import { UserService } from '../src/common/services/user.service';
import { UserRepository } from '../src/database/repositories/user.repository';

describe('Simple E2E Tests', () => {
  let app: INestApplication;
  let testDatabaseService: TestDatabaseService;
  let userService: UserService;

  beforeAll(async () => {
    // Setup test database
    testDatabaseService = new TestDatabaseService();
    await testDatabaseService.setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        {
          provide: DatabaseService,
          useValue: testDatabaseService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
    await testDatabaseService.teardownTestDatabase();
  });

  beforeEach(async () => {
    await testDatabaseService.clearDatabase();
  });

  describe('Database Operations', () => {
    it('should connect to test database', async () => {
      const result = await testDatabaseService.db.execute('SELECT 1 as test');
      expect(result).toBeDefined();
    });

    it('should create and retrieve users', async () => {
      const userData = {
        email: 'simple-e2e@example.com',
        name: 'Simple E2E User',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      };

      const createdUser = await userService.create(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.name).toBe(userData.name);

      const foundUser = await userService.findByEmail(userData.email);
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should handle user updates', async () => {
      const userData = {
        email: 'update-e2e@example.com',
        name: 'Update User',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      };

      const user = await userService.create(userData);

      const updatedUser = await userService.updateById(user.id, {
        name: 'Updated Name',
        emailVerified: true,
      });

      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.emailVerified).toBe(true);
    });

    it('should handle user deletion', async () => {
      const userData = {
        email: 'delete-e2e@example.com',
        name: 'Delete User',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      };

      const user = await userService.create(userData);

      // Soft delete
      const softDeleted = await userService.softDeleteById(user.id);
      expect(softDeleted).toBe(true);

      // Verify user is inactive
      const inactiveUser = await userService.findById(user.id);
      expect(inactiveUser?.isActive).toBe(false);

      // Hard delete
      const deleted = await userService.deleteById(user.id);
      expect(deleted).toBe(true);

      // Verify user is gone
      const deletedUser = await userService.findById(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      const users = Array.from({ length: 3 }, (_, i) => ({
        email: `concurrent${i}@example.com`,
        name: `Concurrent User ${i}`,
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      }));

      const createdUsers = await Promise.all(
        users.map((userData) => userService.create(userData)),
      );

      expect(createdUsers).toHaveLength(3);
      createdUsers.forEach((user, index) => {
        expect(user.email).toBe(users[index]?.email);
      });

      const allUsers = await userService.findAll();
      expect(allUsers.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle validation errors', async () => {
      // Test with duplicate email (since email validation might not be enforced at service level)
      const userData = {
        email: 'duplicate@example.com',
        name: 'Duplicate User',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      };

      await userService.create(userData);
      await expect(userService.create(userData)).rejects.toThrow();
    });

    it('should handle edge cases', async () => {
      // Test with invalid UUID - should handle the error gracefully
      try {
        const result = await userService.findById('invalid-uuid');
        // If no error is thrown, result should be null
        expect(result).toBeNull();
      } catch (error) {
        // If error is thrown, it should be a database error
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }

      // Test finding non-existent user with valid UUID format
      const nonExistent = await userService.findById(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(nonExistent).toBeNull();

      // Test finding non-existent email
      const nonExistentEmail = await userService.findByEmail(
        'nonexistent@example.com',
      );
      expect(nonExistentEmail).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();

      const userPromises = Array.from({ length: 5 }, (_, i) =>
        userService.create({
          email: `bulk${i}@example.com`,
          name: `Bulk User ${i}`,
          password: 'password123',
          role: 'user' as const,
          emailVerified: false,
          isActive: true,
        }),
      );

      const users = await Promise.all(userPromises);
      const endTime = Date.now();

      expect(users).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});
