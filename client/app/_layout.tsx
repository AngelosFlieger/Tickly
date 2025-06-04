import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";
import { View, Text } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      </Stack>
    </AuthProvider>
  );
}
