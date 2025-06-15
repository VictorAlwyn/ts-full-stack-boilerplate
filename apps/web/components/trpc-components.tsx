"use client";

import React from "react";
import { authUtils } from "@repo/trpc/client";

// Simple placeholder components to replace the removed trpc UI components

export function AuthManager() {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <h3>🔐 Authentication Manager</h3>
      <p>Authentication components moved to app-specific implementation.</p>
      <p>
        Current status:{" "}
        {typeof window !== "undefined" && authUtils.isAuthenticatedSync()
          ? "✅ Authenticated"
          : "❌ Not authenticated"}
      </p>
    </div>
  );
}

export function TodoTester() {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <h3>📝 Todo Tester</h3>
      <p>Todo testing components moved to app-specific implementation.</p>
    </div>
  );
}

export function UserManager() {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <h3>👥 User Manager</h3>
      <p>User management components moved to app-specific implementation.</p>
    </div>
  );
}

interface ConditionalProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback }: ConditionalProps) {
  const isAdmin =
    typeof window !== "undefined" ? authUtils.isAdminSync() : false;
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

export function UserOrAdmin({ children, fallback }: ConditionalProps) {
  const isUserOrAdmin =
    typeof window !== "undefined" ? authUtils.isUserOrAdminSync() : false;
  return isUserOrAdmin ? <>{children}</> : <>{fallback}</>;
}

export function AuthenticatedOnly({ children, fallback }: ConditionalProps) {
  const isAuthenticated =
    typeof window !== "undefined" ? authUtils.isAuthenticatedSync() : false;
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}
