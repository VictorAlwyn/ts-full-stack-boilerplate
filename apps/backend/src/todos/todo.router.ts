import {
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc';
import { TodosService } from './todos.service';
import { z } from 'zod';
import {
  insertTodoSchema,
  updateTodoSchema,
} from '../database/schemas/todos.schema';
import { TrpcAuthMiddleware } from '../auth/middleware/trpc-auth.middleware';
import { LoggedMiddleware } from '../common/middleware/logger.middleware';
import { AuthenticatedContext } from '../common/types/trpc.types';
import {
  requireUserOrAdmin,
  requireAdmin,
} from '../auth/decorators/auth-decorators';

// Output schema for API responses
const todoOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

@Router({ alias: 'todo' })
@UseMiddlewares(LoggedMiddleware)
export class TodoRouter {
  constructor(private readonly todosService: TodosService) {}

  @Query({
    input: z.object({ id: z.string() }),
    output: todoOutputSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getTodoById(@Input('id') id: string, @Ctx() ctx: AuthenticatedContext) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    console.log('Authenticated user ID:', user.id, 'Role:', user.role);
    return await this.todosService.getTodoById(id, user.id);
  }

  @Query({
    input: z
      .object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
      .optional(),
    output: z.array(todoOutputSchema),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getAllTodos(
    @Input() input: { limit?: number; offset?: number } = {},
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    console.log('Getting todos for user:', user.id, 'Role:', user.role);
    return await this.todosService.getAllTodos(
      user.id,
      input.limit || 50,
      input.offset || 0,
    );
  }

  @Query({
    input: z.object({ completed: z.boolean().default(true) }),
    output: z.array(todoOutputSchema),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getCompletedTodos(
    @Input() input: { completed: boolean },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    return await this.todosService.getCompletedTodos(user.id, input.completed);
  }

  @Query({
    input: z.object({ priority: z.enum(['low', 'medium', 'high']) }),
    output: z.array(todoOutputSchema),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getTodosByPriority(
    @Input() input: { priority: 'low' | 'medium' | 'high' },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    return await this.todosService.getTodosByPriority(user.id, input.priority);
  }

  @Mutation({
    input: insertTodoSchema.omit({ userId: true }),
    output: todoOutputSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async createTodo(
    @Input() input: Omit<z.infer<typeof insertTodoSchema>, 'userId'>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    console.log('Creating todo for user:', user.id, 'Role:', user.role);
    return await this.todosService.createTodo({
      ...input,
      userId: user.id,
    });
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: updateTodoSchema,
    }),
    output: todoOutputSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async updateTodo(
    @Input() input: { id: string; data: z.infer<typeof updateTodoSchema> },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    console.log('Updating todo for user:', user.id, 'Role:', user.role);
    return await this.todosService.updateTodo(input.id, user.id, input.data);
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.boolean(),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async deleteTodo(@Input('id') id: string, @Ctx() ctx: AuthenticatedContext) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    console.log('Deleting todo for user:', user.id, 'Role:', user.role);
    return await this.todosService.deleteTodo(id, user.id);
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: todoOutputSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async markAsCompleted(
    @Input('id') id: string,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    return await this.todosService.markAsCompleted(id, user.id);
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: todoOutputSchema,
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async markAsIncomplete(
    @Input('id') id: string,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    return await this.todosService.markAsIncomplete(id, user.id);
  }

  @Query({
    output: z.object({
      total: z.number(),
      completed: z.number(),
      pending: z.number(),
    }),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getTodoStats(@Ctx() ctx: AuthenticatedContext) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    const [total, completed] = await Promise.all([
      this.todosService.getTodoCount(user.id),
      this.todosService.getCompletedTodoCount(user.id),
    ]);

    return {
      total,
      completed,
      pending: total - completed,
    };
  }

  @Query({
    input: z.object({ days: z.number().min(1).max(30).default(7) }),
    output: z.array(todoOutputSchema),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getDueSoonTodos(
    @Input() input: { days: number } = { days: 7 },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for role validation
    const user = requireUserOrAdmin(ctx);

    return await this.todosService.getDueSoonTodos(user.id, input.days);
  }

  @Query({
    input: z
      .object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
      .optional(),
    output: z.array(todoOutputSchema),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async getAllTodosAdmin(
    @Input() input: { limit?: number; offset?: number } = {},
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for admin validation
    const user = requireAdmin(ctx);

    console.log('Admin getting all todos:', user.id, 'Role:', user.role);
    return await this.todosService.getAllTodosAdmin(
      input.limit || 50,
      input.offset || 0,
    );
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.boolean(),
  })
  @UseMiddlewares(TrpcAuthMiddleware)
  async deleteTodoAdmin(
    @Input('id') id: string,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Use utility function for admin validation
    const user = requireAdmin(ctx);

    console.log(
      'Admin deleting todo:',
      id,
      'by user:',
      user.id,
      'Role:',
      user.role,
    );
    return await this.todosService.deleteTodoAdmin(id);
  }
}
