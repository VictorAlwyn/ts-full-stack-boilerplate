import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

// User role enum
const userRoleSchema = z.enum(["public", "user", "admin"]);

// User schemas
const publicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Todo schema
const todoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// This file now only exports types - the actual implementations are in the NestJS backend
// The TRPC client will make HTTP calls to the backend, not use these local implementations

export type AppRouter = {
  auth: {
    register: {
      input: {
        email: string;
        password: string;
        name: string;
        role?: "public" | "user" | "admin";
      };
      output: {
        access_token: string;
        user: z.infer<typeof publicUserSchema>;
      };
    };
    login: {
      input: {
        email: string;
        password: string;
      };
      output: {
        access_token: string;
        user: z.infer<typeof publicUserSchema>;
      };
    };
    me: {
      output: z.infer<typeof publicUserSchema>;
    };
  };
  todo: {
    getTodoById: {
      input: { id: string };
      output: z.infer<typeof todoSchema>;
    };
    getAllTodos: {
      input?: {
        limit?: number;
        offset?: number;
      };
      output: z.infer<typeof todoSchema>[];
    };
    getCompletedTodos: {
      input: { completed?: boolean };
      output: z.infer<typeof todoSchema>[];
    };
    getTodosByPriority: {
      input: { priority: "low" | "medium" | "high" };
      output: z.infer<typeof todoSchema>[];
    };
    createTodo: {
      input: {
        name: string;
        description?: string;
        completed?: boolean;
        priority?: "low" | "medium" | "high";
        dueDate?: string;
      };
      output: z.infer<typeof todoSchema>;
    };
    updateTodo: {
      input: {
        id: string;
        data: {
          name?: string;
          description?: string;
          completed?: boolean;
          priority?: "low" | "medium" | "high";
          dueDate?: string;
        };
      };
      output: z.infer<typeof todoSchema>;
    };
    deleteTodo: {
      input: { id: string };
      output: boolean;
    };
    markAsCompleted: {
      input: { id: string };
      output: z.infer<typeof todoSchema>;
    };
    markAsIncomplete: {
      input: { id: string };
      output: z.infer<typeof todoSchema>;
    };
    getTodoStats: {
      output: {
        total: number;
        completed: number;
        pending: number;
      };
    };
    getDueSoonTodos: {
      input: { days?: number };
      output: z.infer<typeof todoSchema>[];
    };
    getAllTodosAdmin: {
      input?: {
        limit?: number;
        offset?: number;
      };
      output: z.infer<typeof todoSchema>[];
    };
    deleteTodoAdmin: {
      input: { id: string };
      output: boolean;
    };
  };
  user: {
    getProfile: {
      output: z.infer<typeof publicUserSchema>;
    };
    updateProfile: {
      input: {
        name?: string;
        email?: string;
      };
      output: z.infer<typeof publicUserSchema>;
    };
    getAllUsers: {
      input?: {
        limit?: number;
        offset?: number;
      };
      output: z.infer<typeof publicUserSchema>[];
    };
    getUserById: {
      input: { id: string };
      output: z.infer<typeof publicUserSchema>;
    };
    updateUserRole: {
      input: {
        id: string;
        role: "public" | "user" | "admin";
      };
      output: z.infer<typeof publicUserSchema>;
    };
    deactivateUser: {
      input: { id: string };
      output: boolean;
    };
    getUserStats: {
      output: {
        total: number;
        active: number;
        inactive: number;
        byRole: {
          public: number;
          user: number;
          admin: number;
        };
      };
    };
  };
};

// Export schemas for use in components
export { userRoleSchema, publicUserSchema, todoSchema };
