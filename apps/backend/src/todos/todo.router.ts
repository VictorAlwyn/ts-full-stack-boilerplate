import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { TodosService } from './todos.service';
import { z } from 'zod';
import { CreateTodoInput, createTodoSchema, todoSchema } from './todo.schema';

@Router({ alias: 'todo' })
export class TodoRouter {
  constructor(private readonly todosService: TodosService) {}

  @Query({
    input: z.object({ id: z.string() }),
    output: todoSchema,
  })
  getTodoById(@Input('id') id: string) {
    return this.todosService.getTodoById(id);
  }

  @Query({
    output: z.array(todoSchema),
  })
  getAllTodos() {
    return this.todosService.getAllTodos();
  }

  @Mutation({
    input: createTodoSchema,
    output: todoSchema,
  })
  createTodo(@Input() todoData: CreateTodoInput) {
    return this.todosService.createTodo(todoData);
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: createTodoSchema.partial(),
    }),
    output: todoSchema,
  })
  updateTodo(
    @Input('id') id: string,
    @Input('data') data: Partial<CreateTodoInput>,
  ) {
    return this.todosService.updateTodo(id, data);
  }

  @Mutation({
    input: z.object({
      id: z.string(),
    }),
    output: z.boolean(),
  })
  deleteTodo(@Input('id') id: string) {
    return this.todosService.deleteTodo(id);
  }
}
