import { Tabs } from "expo-router";
import AppTabBar from "@/components/navigation/AppTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="loans" options={{ title: "Loans" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
