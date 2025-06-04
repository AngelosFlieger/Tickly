import React from "react";
import { AuthProvider } from "../AuthContext";
import AppNavigator from "./AppNavigator";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
