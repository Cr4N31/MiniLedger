import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const token = await AsyncStorage.getItem("miniledger_token");

        if (!active) return;

        const firstSegment = segments[0];
        const inTabs = firstSegment === "(tabs)";
        const onAuthScreen =
          firstSegment === "login" || firstSegment === "verify-otp";

        if (!token && inTabs) {
          router.replace("/login");
        } else if (token && onAuthScreen) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Failed to restore session:", error);

        if (active && segments[0] === "(tabs)") {
          router.replace("/login");
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [segments, router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: checkingSession ? "none" : "default" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
