import { Injectable } from '@nestjs/common';
import { eq, and, desc, asc } from 'drizzle-orm';
import { DatabaseService } from '../config/database.config';
import { todos, Todo, InsertTodo, UpdateTodo } from '../schemas/todos.schema';

@Injectable()
export class TodoRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findById(id: string): Promise<Todo | null> {
    const result = await this.db
      .select()
      .from(todos)
      .where(eq(todos.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Todo | null> {
    const result = await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    return result[0] ?? null;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Todo[]> {
    return await this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findCompletedByUserId(
    userId: string,
    completed = true,
  ): Promise<Todo[]> {
    return await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.completed, completed)))
      .orderBy(desc(todos.createdAt));
  }

  async findByPriorityAndUserId(
    userId: string,
    priority: 'low' | 'medium' | 'high',
  ): Promise<Todo[]> {
    return await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.priority, priority)))
      .orderBy(desc(todos.createdAt));
  }

  async create(todoData: InsertTodo): Promise<Todo> {
    const insertData = {
      name: todoData.name,
      description: todoData.description,
      completed: todoData.completed,
      priority: todoData.priority,
      userId: todoData.userId,
      dueDate: todoData.dueDate ? new Date(todoData.dueDate) : null,
    };

    const result = await this.db.insert(todos).values(insertData).returning();

    if (!result[0]) {
      throw new Error('Failed to create todo');
    }

    return result[0];
  }

  async updateById(
    id: string,
    userId: string,
    todoData: UpdateTodo,
  ): Promise<Todo | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (todoData.name !== undefined) {
      updateData.name = todoData.name;
    }
    if (todoData.description !== undefined) {
      updateData.description = todoData.description;
    }
    if (todoData.completed !== undefined) {
      updateData.completed = todoData.completed;
    }
    if (todoData.priority !== undefined) {
      updateData.priority = todoData.priority;
    }
    if (todoData.dueDate !== undefined) {
      updateData.dueDate = new Date(todoData.dueDate);
    }

    const result = await this.db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    return result[0] ?? null;
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning({ id: todos.id });

    return result.length > 0;
  }

  async markAsCompleted(id: string, userId: string): Promise<Todo | null> {
    const result = await this.db
      .update(todos)
      .set({
        completed: true,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    return result[0] ?? null;
  }

  async markAsIncomplete(id: string, userId: string): Promise<Todo | null> {
    const result = await this.db
      .update(todos)
      .set({
        completed: false,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    return result[0] ?? null;
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: todos.id })
      .from(todos)
      .where(eq(todos.userId, userId));

    return result.length;
  }

  async countCompletedByUserId(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: todos.id })
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.completed, true)));

    return result.length;
  }

  async findDueSoon(userId: string, days = 7): Promise<Todo[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.db
      .select()
      .from(todos)
      .where(
        and(
          eq(todos.userId, userId),
          eq(todos.completed, false),
          // Note: This would need proper date comparison in a real implementation
        ),
      )
      .orderBy(asc(todos.dueDate));
  }

  // Admin-only methods
  async findAll(limit = 50, offset = 0): Promise<Todo[]> {
    return await this.db
      .select()
      .from(todos)
      .orderBy(desc(todos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async deleteByIdAdmin(id: string): Promise<boolean> {
    const result = await this.db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning({ id: todos.id });

    return result.length > 0;
  }
}
