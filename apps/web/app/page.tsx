"use client";

import dynamic from "next/dynamic";
import { authUtils } from "@repo/trpc/client";

// Dynamic imports for local components
const AuthManager = dynamic(
  () =>
    import("../components/trpc-components").then((mod) => ({
      default: mod.AuthManager,
    })),
  { ssr: false }
);
const TodoTester = dynamic(
  () =>
    import("../components/trpc-components").then((mod) => ({
      default: mod.TodoTester,
    })),
  { ssr: false }
);
const UserManager = dynamic(
  () =>
    import("../components/trpc-components").then((mod) => ({
      default: mod.UserManager,
    })),
  { ssr: false }
);
const AdminOnly = dynamic(
  () =>
    import("../components/trpc-components").then((mod) => ({
      default: mod.AdminOnly,
    })),
  { ssr: false }
);
const UserOrAdmin = dynamic(
  () =>
    import("../components/trpc-components").then((mod) => ({
      default: mod.UserOrAdmin,
    })),
  { ssr: false }
);
const AuthenticatedOnly = dynamic(
  () =>
    import("../components/trpc-components").then((mod) => ({
      default: mod.AuthenticatedOnly,
    })),
  { ssr: false }
);

export default function Home() {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🚀 Full-Stack tRPC + Role-Based Auth</h1>

      <div
        style={{
          padding: "15px",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #b3d9ff",
        }}
      >
        <h3>🎯 Features Showcase</h3>
        <ul>
          <li>
            <strong>Authentication:</strong> Login/Register with JWT tokens
          </li>
          <li>
            <strong>Role-Based Access:</strong> Public, User, Admin roles with
            different permissions
          </li>
          <li>
            <strong>Todo Management:</strong> CRUD operations with user-specific
            and admin views
          </li>
          <li>
            <strong>User Management:</strong> Profile updates and admin user
            management
          </li>
          <li>
            <strong>Conditional Rendering:</strong> UI components that adapt
            based on user roles
          </li>
        </ul>
      </div>

      {/* Authentication Manager */}
      <AuthManager />

      {/* Role-based conditional rendering examples */}
      <AuthenticatedOnly
        fallback={
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8d7da",
              borderRadius: "8px",
              margin: "20px 0",
              border: "1px solid #f5c6cb",
            }}
          >
            <h3>🔒 Authentication Required</h3>
            <p>Please log in to access the full application features.</p>
          </div>
        }
      >
        {/* Quick Status Overview */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "#d4edda",
            borderRadius: "8px",
            margin: "20px 0",
            border: "1px solid #c3e6cb",
          }}
        >
          <h3>✅ Welcome! You&apos;re authenticated</h3>
          <p>
            Current user:{" "}
            <strong>
              {typeof window !== "undefined"
                ? authUtils.getCurrentUserSync()?.name || "Unknown"
                : "Loading..."}
            </strong>
          </p>
          <p>
            Role:{" "}
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "3px",
                backgroundColor:
                  typeof window !== "undefined" && authUtils.isAdminSync()
                    ? "#d4edda"
                    : typeof window !== "undefined" &&
                        authUtils.isUserOrAdminSync()
                      ? "#fff3cd"
                      : "#f8d7da",
                color:
                  typeof window !== "undefined" && authUtils.isAdminSync()
                    ? "#155724"
                    : typeof window !== "undefined" &&
                        authUtils.isUserOrAdminSync()
                      ? "#856404"
                      : "#721c24",
              }}
            >
              {typeof window !== "undefined"
                ? authUtils.getCurrentUserSync()?.role?.toUpperCase() ||
                  "UNKNOWN"
                : "LOADING"}
            </span>
          </p>
        </div>

        {/* Placeholder for Todos Section */}
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            marginBottom: "20px",
          }}
        >
          <h3>📝 Your Recent Todos</h3>
          <p>
            Todo functionality will be implemented when tRPC client is properly
            configured with your backend.
          </p>
        </div>

        {/* Todo Management Section */}
        <UserOrAdmin>
          <TodoTester />
        </UserOrAdmin>

        {/* User Management Section */}
        <UserOrAdmin>
          <UserManager />
        </UserOrAdmin>

        {/* Admin-only section */}
        <AdminOnly
          fallback={
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff3cd",
                borderRadius: "8px",
                margin: "20px 0",
                border: "1px solid #ffeaa7",
              }}
            >
              <h3>🔐 Admin Access Required</h3>
              <p>This section is only available to administrators.</p>
            </div>
          }
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "#d1ecf1",
              borderRadius: "8px",
              margin: "20px 0",
              border: "1px solid #bee5eb",
            }}
          >
            <h3>👑 Admin Panel</h3>
            <p>Welcome, Administrator! You have access to all features.</p>
            <ul>
              <li>Manage all users</li>
              <li>View all todos</li>
              <li>System administration</li>
            </ul>
          </div>
        </AdminOnly>
      </AuthenticatedOnly>

      {/* Package Information */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h3>📦 Package Status</h3>
        <p>
          <strong>@repo/trpc:</strong> Cross-platform client logic ✅
        </p>
        <p>
          <strong>Authentication:</strong> Storage adapters and utilities ✅
        </p>
        <p>
          <strong>UI Components:</strong> App-specific implementation ✅
        </p>
      </div>
    </div>
  );
}
