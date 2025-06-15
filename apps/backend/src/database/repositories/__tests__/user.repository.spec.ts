import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { DatabaseService } from '../../config/database.config';
import { testDatabaseService, testUtils } from '../../../../test/test-setup';
import { users } from '../../schemas/users.schema';

describe('UserRepository', () => {
  let repository: UserRepository;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DatabaseService,
          useValue: testDatabaseService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      };

      const user = await repository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).toBe(userData.password);
      expect(user.isActive).toBe(true);
      expect(user.emailVerified).toBe(false);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      };

      await repository.create(userData);

      await expect(repository.create(userData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const createdUser = await testUtils.createTestUser();

      const user = await repository.findById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent user', async () => {
      const user = await repository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const createdUser = await testUtils.createTestUser();

      const user = await repository.findByEmail(createdUser.email);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('findActiveByEmail', () => {
    it('should find active user by email', async () => {
      const userData = {
        email: 'active@example.com',
        name: 'Active User',
        password: 'hashedPassword123',
        role: 'user' as const,
        isActive: true,
      };

      const [createdUser] = await databaseService.db
        .insert(users)
        .values(userData)
        .returning();

      if (!createdUser) {
        throw new Error('Failed to create test user');
      }

      const user = await repository.findActiveByEmail(createdUser.email);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.isActive).toBe(true);
    });

    it('should not find inactive user by email', async () => {
      const userData = {
        email: 'inactive@example.com',
        name: 'Inactive User',
        password: 'hashedPassword123',
        role: 'user' as const,
        isActive: false,
      };

      const [createdUser] = await databaseService.db
        .insert(users)
        .values(userData)
        .returning();

      if (!createdUser) {
        throw new Error('Failed to create test user');
      }

      const user = await repository.findActiveByEmail(createdUser.email);

      expect(user).toBeNull();
    });
  });

  describe('updateById', () => {
    it('should update user by id', async () => {
      const createdUser = await testUtils.createTestUser();
      const updateData = {
        name: 'Updated Name',
        emailVerified: true,
      };

      const updatedUser = await repository.updateById(
        createdUser.id,
        updateData,
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.emailVerified).toBe(updateData.emailVerified);
      expect(updatedUser?.updatedAt).not.toBe(createdUser.updatedAt);
    });

    it('should return null for non-existent user', async () => {
      const updatedUser = await repository.updateById(
        '00000000-0000-0000-0000-000000000000',
        { name: 'Updated Name' },
      );

      expect(updatedUser).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete user by id', async () => {
      const createdUser = await testUtils.createTestUser();

      const isDeleted = await repository.deleteById(createdUser.id);

      expect(isDeleted).toBe(true);

      // Verify user is deleted
      const user = await repository.findById(createdUser.id);
      expect(user).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const isDeleted = await repository.deleteById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(isDeleted).toBe(false);
    });
  });

  describe('softDeleteById', () => {
    it('should soft delete user by id', async () => {
      const createdUser = await testUtils.createTestUser();

      const isSoftDeleted = await repository.softDeleteById(createdUser.id);

      expect(isSoftDeleted).toBe(true);

      // Verify user still exists but is inactive
      const user = await repository.findById(createdUser.id);
      expect(user).toBeDefined();
      expect(user?.isActive).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email', async () => {
      const createdUser = await testUtils.createTestUser();

      const isVerified = await repository.verifyEmail(createdUser.id);

      expect(isVerified).toBe(true);

      // Verify email is verified
      const user = await repository.findById(createdUser.id);
      expect(user?.emailVerified).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination', async () => {
      // Create multiple users
      await Promise.all([
        testUtils.createTestUser(),
        repository.create({
          email: 'user2@example.com',
          name: 'User 2',
          password: 'password123',
          role: 'user' as const,
          emailVerified: false,
          isActive: true,
        }),
        repository.create({
          email: 'user3@example.com',
          name: 'User 3',
          password: 'password123',
          role: 'user' as const,
          emailVerified: false,
          isActive: true,
        }),
      ]);

      const users = await repository.findAll(2, 0);

      expect(users).toHaveLength(2);
      expect(users[0]).toBeDefined();
      expect(users[1]).toBeDefined();
    });

    it('should find all users without pagination', async () => {
      await testUtils.createTestUser();

      const users = await repository.findAll();

      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('count', () => {
    it('should count all users', async () => {
      await testUtils.createTestUser();
      await repository.create({
        email: 'user2@example.com',
        name: 'User 2',
        password: 'password123',
        role: 'user' as const,
        emailVerified: false,
        isActive: true,
      });

      const count = await repository.count();

      expect(count).toBe(2);
    });
  });

  describe('toPublicUser', () => {
    it('should convert user to public user', async () => {
      const createdUser = await testUtils.createTestUser();

      const publicUser = repository.toPublicUser(createdUser);

      expect(publicUser).toBeDefined();
      expect(publicUser.id).toBe(createdUser.id);
      expect(publicUser.email).toBe(createdUser.email);
      expect(publicUser.name).toBe(createdUser.name);
      expect(publicUser.emailVerified).toBe(createdUser.emailVerified);
      expect(publicUser.isActive).toBe(createdUser.isActive);
      expect(publicUser.createdAt).toBe(createdUser.createdAt);
      expect(publicUser.updatedAt).toBe(createdUser.updatedAt);
      expect('password' in publicUser).toBe(false);
    });
  });
});
