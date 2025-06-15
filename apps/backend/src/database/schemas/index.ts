// Export all database schemas from this central location
export * from './users.schema';
export * from './todos.schema';

// Re-export for convenience
export {
  users,
  insertUserSchema,
  updateUserSchema,
  publicUserSchema,
} from './users.schema';
export {
  todos,
  priorityEnum,
  insertTodoSchema,
  updateTodoSchema,
  usersRelations,
  todosRelations,
} from './todos.schema';
