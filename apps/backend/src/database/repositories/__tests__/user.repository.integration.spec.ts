import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { DatabaseService } from '../../config/database.config';
import { testDatabaseService } from '../../../../test/test-setup';
import { UserService } from '../../../common/services/user.service';

describe('UserRepository Integration', () => {
  let userRepository: UserRepository;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        UserService,
        {
          provide: DatabaseService,
          useValue: testDatabaseService,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userService = module.get<UserService>(UserService);
  });

  describe('Database Integration', () => {
    it('should perform complete user lifecycle', async () => {
      // Create user through service
      const userData = {
        email: 'integration@example.com',
        name: 'Integration User',
        password: 'password123',
        emailVerified: false,
        isActive: true,
      };

      const createdUser = await userService.create(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(userData.email);

      // Find user through repository
      const foundUser = await userRepository.findById(createdUser.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);

      // Update user
      const updatedUser = await userRepository.updateById(createdUser.id, {
        name: 'Updated Integration User',
        emailVerified: true,
      });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Integration User');
      expect(updatedUser?.emailVerified).toBe(true);

      // Verify email
      const emailVerified = await userRepository.verifyEmail(createdUser.id);
      expect(emailVerified).toBe(true);

      // Soft delete
      const softDeleted = await userRepository.softDeleteById(createdUser.id);
      expect(softDeleted).toBe(true);

      // Verify user is inactive
      const inactiveUser = await userRepository.findById(createdUser.id);
      expect(inactiveUser?.isActive).toBe(false);

      // Hard delete
      const deleted = await userRepository.deleteById(createdUser.id);
      expect(deleted).toBe(true);

      // Verify user is gone
      const deletedUser = await userRepository.findById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should handle concurrent user operations', async () => {
      const users = [
        {
          email: 'concurrent1@example.com',
          name: 'Concurrent User 1',
          password: 'password123',
          emailVerified: false,
          isActive: true,
        },
        {
          email: 'concurrent2@example.com',
          name: 'Concurrent User 2',
          password: 'password123',
          emailVerified: false,
          isActive: true,
        },
        {
          email: 'concurrent3@example.com',
          name: 'Concurrent User 3',
          password: 'password123',
          emailVerified: false,
          isActive: true,
        },
      ];

      // Create users concurrently
      const createdUsers = await Promise.all(
        users.map((userData) => userService.create(userData)),
      );

      expect(createdUsers).toHaveLength(3);
      createdUsers.forEach((user, index) => {
        expect(user.email).toBe(users[index]?.email);
      });

      // Find all users
      const allUsers = await userRepository.findAll();
      expect(allUsers.length).toBeGreaterThanOrEqual(3);

      // Count users
      const userCount = await userRepository.count();
      expect(userCount).toBeGreaterThanOrEqual(3);

      // Update users concurrently
      const updatePromises = createdUsers.map((user) =>
        userRepository.updateById(user.id, { emailVerified: true }),
      );

      const updatedUsers = await Promise.all(updatePromises);
      updatedUsers.forEach((user) => {
        expect(user?.emailVerified).toBe(true);
      });
    });

    it('should maintain data integrity with constraints', async () => {
      const userData = {
        email: 'unique@example.com',
        name: 'Unique User',
        password: 'password123',
        emailVerified: false,
        isActive: true,
      };

      // Create first user
      const user1 = await userService.create(userData);
      expect(user1).toBeDefined();

      // Try to create user with same email (should fail)
      await expect(userService.create(userData)).rejects.toThrow();

      // Verify only one user exists with this email
      const foundUsers = await userRepository.findAll();
      const usersWithEmail = foundUsers.filter(
        (u) => u.email === userData.email,
      );
      expect(usersWithEmail).toHaveLength(1);
    });

    it('should handle database transactions properly', async () => {
      const userData = {
        email: 'transaction@example.com',
        name: 'Transaction User',
        password: 'password123',
        emailVerified: false,
        isActive: true,
      };

      // Create user
      const user = await userService.create(userData);
      expect(user).toBeDefined();

      // Perform multiple operations
      const [updatedUser, emailVerified] = await Promise.all([
        userRepository.updateById(user.id, { name: 'Updated Name' }),
        userRepository.verifyEmail(user.id),
      ]);

      // Verify all operations completed successfully
      expect(updatedUser?.name).toBe('Updated Name'); // Update result
      expect(emailVerified).toBe(true); // Verify email result

      // Get fresh user data to verify email verification
      const freshUser = await userRepository.findById(user.id);
      expect(freshUser?.emailVerified).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      // Create multiple users for pagination testing
      const userPromises = Array.from({ length: 5 }, (_, i) =>
        userService.create({
          email: `pagination${i}@example.com`,
          name: `Pagination User ${i}`,
          password: 'password123',
          emailVerified: false,
          isActive: true,
        }),
      );

      await Promise.all(userPromises);

      // Test pagination
      const page1 = await userRepository.findAll(2, 0);
      const page2 = await userRepository.findAll(2, 2);
      const page3 = await userRepository.findAll(2, 4);

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page3.length).toBeGreaterThanOrEqual(1);

      // Verify no duplicates between pages
      const allIds = [...page1, ...page2, ...page3].map((u) => u.id);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('Database Health', () => {
    it('should handle database errors gracefully', async () => {
      // Test with invalid UUID - should handle the error gracefully
      try {
        const result = await userRepository.findById('invalid-uuid');
        // If no error is thrown, result should be null
        expect(result).toBeNull();
      } catch (error) {
        // If error is thrown, it should be a database error
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });
  });
});
