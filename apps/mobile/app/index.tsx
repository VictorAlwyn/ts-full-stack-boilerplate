import React from "react";
import { authUtils } from "@repo/trpc/client";
import { router } from "expo-router";
import CreateTodo from "./CreateTodo";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

// Simple placeholder components
function AuthenticatedOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isAuthenticated = authUtils.isAuthenticatedSync();
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

function UserOrAdmin({ children }: { children: React.ReactNode }) {
  const isUserOrAdmin = authUtils.isUserOrAdminSync();
  return isUserOrAdmin ? <>{children}</> : null;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const isAdmin = authUtils.isAdminSync();
  return isAdmin ? <>{children}</> : null;
}

export default function TodosScreen() {
  const currentUser = authUtils.getCurrentUserSync();

  const sampleTodos = [
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
  ];

  const sampleStats = { total: 2, completed: 1, pending: 1 };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚀 Mobile tRPC + Auth</Text>
        {currentUser && (
          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: authUtils.isAdminSync()
                      ? "#d4edda"
                      : authUtils.isUserOrAdminSync()
                        ? "#fff3cd"
                        : "#f8d7da",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color: authUtils.isAdminSync()
                        ? "#155724"
                        : authUtils.isUserOrAdminSync()
                          ? "#856404"
                          : "#721c24",
                    },
                  ]}
                >
                  {currentUser.role?.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => authUtils.logoutSync(),
                  },
                ]);
              }}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <AuthenticatedOnly
        fallback={
          <View style={styles.authRequired}>
            <Text style={styles.authRequiredTitle}>
              🔒 Authentication Required
            </Text>
            <Text style={styles.authRequiredText}>
              Please sign in to access your todos and manage your tasks.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButtonText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {/* Development Notice */}
        <View style={styles.devNotice}>
          <Text style={styles.devNoticeTitle}>🚧 Development Mode</Text>
          <Text style={styles.devNoticeText}>
            Todo functionality will be available when tRPC backend is connected.
            Showing sample data.
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Your Stats</Text>
          <Text style={styles.statsText}>
            Total: {sampleStats.total} | Completed: {sampleStats.completed} |
            Pending: {sampleStats.pending}
          </Text>
        </View>

        {/* Create Todo */}
        <CreateTodo />

        {/* Your Todos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 Your Todos ({sampleTodos.length})
          </Text>
          {sampleTodos.map((todo) => (
            <View key={todo.id} style={styles.todoCard}>
              <View style={styles.todoContent}>
                <Text
                  style={[
                    styles.todoName,
                    {
                      textDecorationLine: todo.completed
                        ? "line-through"
                        : "none",
                    },
                  ]}
                >
                  {todo.name}
                </Text>
                <Text style={styles.todoDescription}>{todo.description}</Text>
                <View style={styles.todoPriority}>
                  <Text style={styles.priorityText}>
                    {todo.priority} priority
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Admin Section */}
        <AdminOnly>
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>👑 Admin Panel</Text>
            <Text style={styles.adminText}>
              Admin functionality will be available when tRPC backend is
              connected.
            </Text>
          </View>
        </AdminOnly>
      </AuthenticatedOnly>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  authRequired: {
    padding: 20,
    backgroundColor: "#f8d7da",
    borderRadius: 8,
    marginBottom: 20,
  },
  authRequiredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  authRequiredText: {
    fontSize: 14,
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666",
  },
  statsContainer: {
    padding: 16,
    backgroundColor: "#e7f3ff",
    borderRadius: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  todoCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  todoContent: {
    flex: 1,
    paddingRight: 8,
  },
  todoName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  todoDescription: {
    color: "#444",
    marginBottom: 8,
  },
  todoPriority: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  devNotice: {
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    marginBottom: 16,
  },
  devNoticeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  devNoticeText: {
    fontSize: 14,
  },
  adminSection: {
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    marginBottom: 16,
  },
  adminText: {
    fontSize: 14,
  },
});
