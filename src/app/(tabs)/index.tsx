import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  themes,
  spacing,
  typography,
  type ThemeMode,
  type ThemeColors,
} from "../../constants/theme";
import { useDashboard } from "../../hooks/useDashboard";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import FinancialOverview from "../../components/dashboard/FinancialOverview";
import OverdueCard from "../../components/dashboard/OverdueCard";
import RecentLoans from "../../components/dashboard/RecentLoans";
import AddLoanModal from "../../components/dashboard/AddLoanModal";

export default function DashboardScreen() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [showLoanForm, setShowLoanForm] = useState(false);
  const colors = themes[mode];
  const styles = makeStyles(colors);
  const { summary, loans, loading, error, refresh } = useDashboard();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle={mode === "light" ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          colors={colors}
          mode={mode}
          onToggleTheme={() =>
            setMode((current) => (current === "light" ? "dark" : "light"))
          }
        />
        <FinancialOverview colors={colors} summary={summary} />
        <OverdueCard colors={colors} amount={summary?.overdueAmount ?? 0} />
        <RecentLoans
          colors={colors}
          loans={loans}
          loading={loading}
          error={error}
        />
        <Text style={styles.footerNote}>
          Keep good records. Keep good relationships.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowLoanForm(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={23} color="#FFF9F0" />
          <Text style={styles.addButtonText}>Record a loan</Text>
        </Pressable>
        {!error && !loading ? (
          <Text style={styles.demoNote}>
            Live data from your MiniLedger account.
          </Text>
        ) : null}
      </ScrollView>
      <AddLoanModal
        colors={colors}
        visible={showLoanForm}
        onClose={() => setShowLoanForm(false)}
        onSaved={refresh}
      />
    </SafeAreaView>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
    },
    footerNote: {
      color: c.muted,
      fontFamily: typography.display,
      fontSize: 15,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: c.primary,
      paddingVertical: spacing.lg,
      borderRadius: 12,
    },
    addButtonText: { color: "#FFF9F0", fontSize: 14, fontWeight: "700" },
    demoNote: {
      color: c.muted,
      fontSize: 10,
      textAlign: "center",
      marginTop: spacing.md,
    },
  });
}
