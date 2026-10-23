import { Ionicons } from "@expo/vector-icons";
import {
  useColorScheme,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { themes, spacing, radius, typography } from "@/constants/theme";

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = themes[scheme === "dark" ? "dark" : "light"];

  const sections = [
    {
      title: "PREFERENCES",
      items: [
        {
          icon: "color-palette-outline",
          label: "Appearance",
          detail: scheme === "dark" ? "Dark mode" : "Light mode",
        },
        {
          icon: "notifications-outline",
          label: "Notifications",
          detail: "Manage reminders",
        },
      ],
    },
    {
      title: "YOUR ACCOUNT",
      items: [
        {
          icon: "person-circle-outline",
          label: "Profile",
          detail: "Your personal information",
        },
        {
          icon: "shield-checkmark-outline",
          label: "Privacy & security",
          detail: "Keep your account secure",
        },
      ],
    },
    {
      title: "ABOUT",
      items: [
        {
          icon: "information-circle-outline",
          label: "About MiniLedger",
          detail: "Your personal lending tracker",
        },
        {
          icon: "help-circle-outline",
          label: "Help & support",
          detail: "Get help with the app",
        },
      ],
    },
  ] as const;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingTop: 64,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          fontFamily: typography.display,
          fontSize: 34,
          color: colors.ink,
        }}
      >
        Settings
      </Text>

      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          marginTop: 8,
          marginBottom: 32,
        }}
      >
        Make MiniLedger work for you.
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 18,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 32,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.accentSurface,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <Ionicons name="person-outline" size={25} color={colors.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }}>
            Your account
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            Manage your personal details
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>

      {sections.map((section) => (
        <View key={section.title} style={{ marginBottom: 28 }}>
          <Text
            style={{
              color: colors.muted,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            {section.title}
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
            }}
          >
            {section.items.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => {}}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 17,
                  borderBottomWidth: index === section.items.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Ionicons name={item.icon} size={21} color={colors.primary} />

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.muted,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {item.detail}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Text
        style={{
          textAlign: "center",
          color: colors.muted,
          fontSize: 12,
          marginTop: 4,
        }}
      >
        MINILEDGER · VERSION 1.0.0
      </Text>
    </ScrollView>
  );
}
