import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="medications/add" />
        <Stack.Screen name="refills" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="history" />
        <Stack.Screen name="cycle" />
        <Stack.Screen name="menstrual-tracker" />
      </Stack>
    </>
  );
}
