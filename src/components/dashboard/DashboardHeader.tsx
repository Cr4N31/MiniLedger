import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  radius,
  spacing,
  typography,
  type ThemeColors,
  type ThemeMode,
} from "../../constants/theme";

type Props = {
  colors: ThemeColors;
  mode: ThemeMode;
  onToggleTheme: () => void;
};

export default function DashboardHeader({
  colors,
  mode,
  onToggleTheme,
}: Props) {
  const styles = makeStyles(colors);
  return (
    <>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Ionicons name="wallet-outline" size={21} color={colors.surface} />
          </View>
          <Text style={styles.brandName}>miniledger.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
          onPress={onToggleTheme}
          style={styles.themeButton}
        >
          <Ionicons
            name={mode === "light" ? "moon-outline" : "sunny-outline"}
            size={21}
            color={colors.ink}
          />
        </Pressable>
      </View>
      <Text style={styles.eyebrow}>YOUR MONEY, ACCOUNTED FOR.</Text>
    </>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xxl,
    },
    brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    brandMark: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    brandName: {
      fontFamily: typography.display,
      fontSize: 25,
      letterSpacing: -1.2,
      color: c.ink,
    },
    themeButton: {
      width: 42,
      height: 42,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    eyebrow: {
      color: c.muted,
      fontSize: 10,
      letterSpacing: 2,
      fontWeight: "600",
      marginBottom: spacing.md,
    },
  });
}
