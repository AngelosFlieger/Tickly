import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import IndexScreen from "./IndexScreen";
import TabNavigator from "./TabNavigator";
import EventListingScreen from "./viewEvents";
import EventDetailScreen from "./EventDetailScreen";
import editEvent from "./editEvent";
import ViewAllEventsScreen from "./ViewAllEventsScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{ animation: "none" }}
        initialRouteName="Welcome"
      >
        <Stack.Screen
          name="Welcome"
          component={IndexScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Events"
          component={EventListingScreen}
          options={{ title: "Event Listings" }}
        />
        <Stack.Screen
          name="Event Details"
          component={EventDetailScreen}
          options={{ title: "Event Details" }}
        />
        <Stack.Screen
          name="editEvent"
          component={editEvent}
          options={{ title: "editEvent" }}
        />
        <Stack.Screen
          name="ViewAllEventsScreen"
          component={ViewAllEventsScreen}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
