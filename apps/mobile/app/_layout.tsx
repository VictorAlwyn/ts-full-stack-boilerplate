import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import TrpcProvider from "@repo/trpc/TrpcProvider";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <TrpcProvider url={process.env.EXPO_PUBLIC_TRPC_URL!}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: true,
                title: "My Todos",
                headerStyle: {
                  backgroundColor: "#2563eb",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerShown: true,
                title: "Sign In",
                headerStyle: {
                  backgroundColor: "#2563eb",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="edit-todo"
              options={{
                headerShown: true,
                title: "Edit Todo",
                headerStyle: {
                  backgroundColor: "#2563eb",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
                presentation: "modal",
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaView>
      </TrpcProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
