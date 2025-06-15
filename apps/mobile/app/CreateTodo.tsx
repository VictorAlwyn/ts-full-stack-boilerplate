import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateTodo() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;

    // Placeholder - would integrate with tRPC when backend is ready
    Alert.alert(
      "Todo Creation",
      "Todo functionality will be available when tRPC backend is connected.",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setName("");
            setDescription("");
            setDueDate(undefined);
            setPriority("");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Todo</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Todo name"
        style={styles.input}
      />

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        numberOfLines={3}
        style={[styles.input, { height: 80 }]}
      />

      <View style={{ marginBottom: 12 }}>
        <Button
          title={dueDate ? dueDate.toDateString() : "Pick due date"}
          onPress={() => setShowDatePicker(true)}
        />
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

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) => {
            setPriority(itemValue);
          }}
        >
          <Picker.Item label="Priority (optional)" value="" />
          <Picker.Item label="Low" value="low" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="High" value="high" />
        </Picker>
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Create Todo" onPress={handleSubmit} color="#2563eb" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});
