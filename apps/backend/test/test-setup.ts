import 'jest-extended';
import { TestDatabaseService } from '../src/database/test-database.service';
import { users } from '../src/database/schemas/users.schema';
import { todos } from '../src/database/schemas/todos.schema';

// Global test database instance
let testDatabaseService: TestDatabaseService;

// Setup before all tests
beforeAll(async () => {
  testDatabaseService = new TestDatabaseService();
  await testDatabaseService.setupTestDatabase();
}, 60000); // 60 second timeout for container startup

// Cleanup after all tests
afterAll(async () => {
  if (testDatabaseService) {
    await testDatabaseService.teardownTestDatabase();
  }
}, 30000);

// Clear database before each test
beforeEach(async () => {
  if (testDatabaseService) {
    await testDatabaseService.clearDatabase();
  }
});

// Export for use in tests
export { testDatabaseService };

// Global test utilities
export const testUtils = {
  createTestUser: async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword123',
      role: 'user' as const,
    };

    const [user] = await testDatabaseService.db
      .insert(users)
      .values(userData)
      .returning();

    if (!user) {
      throw new Error('Failed to create test user');
    }

    return user;
  },

  createTestTodo: async (userId: string) => {
    const todoData = {
      name: 'Test Todo',
      description: 'Test Description',
      userId,
      priority: 'medium' as const,
    };

    const [todo] = await testDatabaseService.db
      .insert(todos)
      .values(todoData)
      .returning();

    if (!todo) {
      throw new Error('Failed to create test todo');
    }

    return todo;
  },

  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};
