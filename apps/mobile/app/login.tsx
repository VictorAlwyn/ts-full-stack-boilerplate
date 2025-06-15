import { authUtils } from "@repo/trpc/client";
import { useState } from "react";
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    // For demo purposes, create a sample user and token
    const sampleToken = "sample-jwt-token-123";
    const sampleUser = {
      id: "sample-user-id",
      name: isLogin ? "Demo User" : name.trim(),
      email: email.trim(),
      role: isLogin ? "user" : role,
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use auth utilities to store authentication data
    authUtils.loginSync(sampleToken, sampleUser);

    Alert.alert(
      "Success",
      `${isLogin ? "Logged in" : "Account created"} successfully! (Development mode - connects to sample data)`,
      [{ text: "OK", onPress: () => router.replace("/") }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLogin ? "🔐 Sign In" : "📝 Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Welcome back! Please sign in to continue."
              : "Join us! Create your account to get started."}
          </Text>

          {/* Development Notice */}
          <View style={styles.devNotice}>
            <Text style={styles.devNoticeText}>
              🚧 Development Mode: Authentication will connect to tRPC backend
              when configured
            </Text>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                style={styles.input}
                autoComplete="name"
                textContentType="name"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              style={styles.input}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "user" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("user")}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "user" && styles.roleButtonTextActive,
                    ]}
                  >
                    👤 User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "admin" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("admin")}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "admin" && styles.roleButtonTextActive,
                    ]}
                  >
                    👑 Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>
                {isLogin ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchLink}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick access buttons for demo */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Demo Access:</Text>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => {
                setEmail("demo@example.com");
                setPassword("password123");
                setName("Demo User");
                setRole("user");
              }}
            >
              <Text style={styles.demoButtonText}>Fill User Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => {
                setEmail("admin@example.com");
                setPassword("admin123");
                setName("Demo Admin");
                setRole("admin");
              }}
            >
              <Text style={styles.demoButtonText}>Fill Admin Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  roleButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  roleButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  roleButtonTextActive: {
    color: "#2563eb",
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  switchText: {
    fontSize: 16,
    color: "#6b7280",
  },
  switchLink: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  devNotice: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginBottom: 24,
  },
  devNoticeText: {
    fontSize: 14,
    color: "#0369a1",
  },
  demoSection: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0c4a6e",
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    textAlign: "center",
  },
});
