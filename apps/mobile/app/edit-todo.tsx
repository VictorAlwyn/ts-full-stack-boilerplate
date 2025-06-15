import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { router, useLocalSearchParams } from "expo-router";

export default function EditTodoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("");
  const [completed, setCompleted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sample todo data for development
  const sampleTodo = {
    id: "1",
    name: "Sample Todo",
    description: "This is a sample todo",
    completed: false,
    priority: "medium" as const,
    dueDate: null,
  };

  useEffect(() => {
    // Load sample data
    setName(sampleTodo.name);
    setDescription(sampleTodo.description || "");
    setDueDate(sampleTodo.dueDate ? new Date(sampleTodo.dueDate) : undefined);
    setPriority(sampleTodo.priority);
    setCompleted(sampleTodo.completed);
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Todo name is required");
      return;
    }

    Alert.alert(
      "Todo Update",
      "Todo functionality will be available when tRPC backend is connected.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Todo Deletion",
            "Todo functionality will be available when tRPC backend is connected.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Edit Todo</Text>

          {/* Development Notice */}
          <View style={styles.devNotice}>
            <Text style={styles.devNoticeText}>
              🚧 Development Mode: Editing sample todo data
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Todo Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter todo name"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description (optional)"
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dueDate
                  ? dueDate.toDateString()
                  : "Select due date (optional)"}
              </Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setDueDate(undefined)}
              >
                <Text style={styles.clearDateText}>Clear date</Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={dueDate ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue) => setPriority(itemValue)}
              >
                <Picker.Item label="Select priority" value="" />
                <Picker.Item label="🔴 High" value="high" />
                <Picker.Item label="🟡 Medium" value="medium" />
                <Picker.Item label="🟢 Low" value="low" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Completed</Text>
            <TouchableOpacity
              style={[
                styles.completedButton,
                completed
                  ? styles.completedButtonActive
                  : styles.completedButtonInactive,
              ]}
              onPress={() => setCompleted(!completed)}
            >
              <Text
                style={[
                  styles.completedButtonText,
                  completed
                    ? styles.completedButtonTextActive
                    : styles.completedButtonTextInactive,
                ]}
              >
                {completed ? "✅ Completed" : "⏳ Pending"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleSubmit}
            >
              <Text style={styles.updateButtonText}>Update Todo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete Todo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1f2937",
    textAlign: "center",
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  clearDateText: {
    fontSize: 14,
    color: "#dc2626",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  statusButtons: {
    flexDirection: "row",
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  statusButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  statusButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  statusButtonTextActive: {
    color: "#2563eb",
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  updateButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#dc2626",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#6b7280",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  devNotice: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  devNoticeText: {
    fontSize: 14,
    color: "#6b7280",
  },
  completedButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  completedButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  completedButtonInactive: {
    backgroundColor: "#ffffff",
  },
  completedButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  completedButtonTextActive: {
    color: "#2563eb",
  },
  completedButtonTextInactive: {
    color: "#6b7280",
  },
  buttonGroup: {
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
