import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from '../database/repositories/todo.repository';
import { Todo, InsertTodo, UpdateTodo } from '../database/schemas/todos.schema';

@Injectable()
export class TodosService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async getTodoById(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findByIdAndUserId(id, userId);
    if (!todo) {
      throw new NotFoundException('Todo not found.');
    }
    return todo;
  }

  async getAllTodos(userId: string, limit = 50, offset = 0): Promise<Todo[]> {
    return await this.todoRepository.findByUserId(userId, limit, offset);
  }

  async getCompletedTodos(userId: string, completed = true): Promise<Todo[]> {
    return await this.todoRepository.findCompletedByUserId(userId, completed);
  }

  async getTodosByPriority(
    userId: string,
    priority: 'low' | 'medium' | 'high',
  ): Promise<Todo[]> {
    return await this.todoRepository.findByPriorityAndUserId(userId, priority);
  }

  async createTodo(todoData: InsertTodo): Promise<Todo> {
    return await this.todoRepository.create(todoData);
  }

  async updateTodo(
    id: string,
    userId: string,
    data: UpdateTodo,
  ): Promise<Todo> {
    const updatedTodo = await this.todoRepository.updateById(id, userId, data);
    if (!updatedTodo) {
      throw new NotFoundException('Todo not found.');
    }
    return updatedTodo;
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    const deleted = await this.todoRepository.deleteById(id, userId);
    if (!deleted) {
      throw new NotFoundException('Todo not found.');
    }
    return deleted;
  }

  async markAsCompleted(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.markAsCompleted(id, userId);
    if (!todo) {
      throw new NotFoundException('Todo not found.');
    }
    return todo;
  }

  async markAsIncomplete(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.markAsIncomplete(id, userId);
    if (!todo) {
      throw new NotFoundException('Todo not found.');
    }
    return todo;
  }

  async getTodoCount(userId: string): Promise<number> {
    return await this.todoRepository.countByUserId(userId);
  }

  async getCompletedTodoCount(userId: string): Promise<number> {
    return await this.todoRepository.countCompletedByUserId(userId);
  }

  async getDueSoonTodos(userId: string, days = 7): Promise<Todo[]> {
    return await this.todoRepository.findDueSoon(userId, days);
  }

  // Admin-only methods
  async getAllTodosAdmin(limit = 50, offset = 0): Promise<Todo[]> {
    return await this.todoRepository.findAll(limit, offset);
  }

  async deleteTodoAdmin(id: string): Promise<boolean> {
    const deleted = await this.todoRepository.deleteByIdAdmin(id);
    if (!deleted) {
      throw new NotFoundException('Todo not found.');
    }
    return deleted;
  }
}
