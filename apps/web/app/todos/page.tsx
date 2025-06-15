"use client";

import { useState } from "react";

export default function TodosPage() {
  const [todos] = useState([
    {
      id: "1",
      name: "Sample Todo",
      description: "This is a sample todo",
      completed: false,
      priority: "medium",
    },
    {
      id: "2",
      name: "Another Todo",
      description: "Another sample todo",
      completed: true,
      priority: "high",
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Todos</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🚧 Development Mode
        </h3>
        <p className="text-yellow-700">
          Todo functionality will be available when the tRPC backend is properly
          connected. Currently showing sample data.
        </p>
      </div>

      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`p-4 border rounded-lg ${
              todo.completed
                ? "bg-gray-50 border-gray-200"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold ${
                    todo.completed
                      ? "line-through text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {todo.name}
                </h3>
                <p className="text-gray-600 mt-1">{todo.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      todo.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {todo.completed ? "Completed" : "Pending"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      todo.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : todo.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {todo.priority} priority
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={() =>
                    alert(
                      "Edit functionality will be available when tRPC backend is connected."
                    )
                  }
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  onClick={() =>
                    alert(
                      "Delete functionality will be available when tRPC backend is connected."
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
