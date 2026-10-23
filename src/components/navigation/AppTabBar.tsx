import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useColorScheme, Pressable, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themes } from "@/constants/theme";

const tabs = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  loans: { label: "Loans", icon: "wallet-outline", activeIcon: "wallet" },
  settings: {
    label: "Settings",
    icon: "settings-outline",
    activeIcon: "settings",
  },
} as const;

export default function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const scheme = useColorScheme();
  const colors = themes[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingHorizontal: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const tab = tabs[route.name as keyof typeof tabs];

        if (!tab) return null;

        const focused = state.index === index;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              descriptors[route.key]?.options.tabBarAccessibilityLabel
            }
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingVertical: 4,
            }}
          >
            <Ionicons
              name={focused ? tab.activeIcon : tab.icon}
              size={23}
              color={focused ? colors.primary : colors.muted}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? "600" : "400",
                color: focused ? colors.primary : colors.muted,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
