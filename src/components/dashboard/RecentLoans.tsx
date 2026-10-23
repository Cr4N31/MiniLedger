import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  radius,
  spacing,
  typography,
  type ThemeColors,
} from "../../constants/theme";
import { formatDate, money } from "../../utils/formatters";
import type { LoanRecord } from "../../types/loans";
import { useRouter } from "expo-router";

type Props = {
  colors: ThemeColors;
  loans: LoanRecord[];
  loading: boolean;
  error: string | null;
};

export default function RecentLoans({ colors, loans, loading, error }: Props) {
  const router = useRouter();
  const styles = makeStyles(colors);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(tabs)/loans")}
        style={styles.textAction}
      >
        <Text style={styles.actionText}>View all</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </Pressable>
      <View style={styles.loanList}>
        {error ? (
          <Text style={[styles.message, { color: colors.danger }]}>
            {error}
          </Text>
        ) : loading ? (
          <Text style={styles.message}>Loading your loans…</Text>
        ) : loans.length === 0 ? (
          <Text style={styles.message}>No loans recorded yet.</Text>
        ) : (
          loans.map((loan, index) => {
            const repaid = Boolean(loan.repaidAt);
            const initials = (loan.friendName || "?")
              .trim()
              .split(/\s+/)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <View
                key={loan.id}
                style={[
                  styles.loanRow,
                  index === loans.length - 1 && styles.lastLoanRow,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: repaid
                        ? colors.accentSurface
                        : colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: repaid ? colors.accent : colors.primary },
                    ]}
                  >
                    {initials}
                  </Text>
                </View>
                <View style={styles.loanDetails}>
                  <Text style={styles.loanName}>{loan.friendName}</Text>
                  <Text style={styles.loanDue}>
                    {repaid
                      ? "Repaid"
                      : loan.isOverdue
                        ? `Overdue · ${formatDate(loan.dueDate)}`
                        : `Due ${formatDate(loan.dueDate)}`}
                  </Text>
                </View>
                <View style={styles.loanRight}>
                  <Text style={styles.loanAmount}>{money(loan.amount)}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: repaid
                          ? colors.accentSurface
                          : colors.surfaceMuted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: repaid
                            ? colors.accent
                            : loan.isOverdue
                              ? colors.danger
                              : colors.muted,
                        },
                      ]}
                    >
                      {repaid
                        ? "REPAID"
                        : loan.isOverdue
                          ? "OVERDUE"
                          : "OUTSTANDING"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    sectionEyebrow: {
      color: c.muted,
      fontSize: 9,
      letterSpacing: 1.8,
      marginBottom: 5,
      fontWeight: "600",
    },
    sectionTitle: {
      color: c.ink,
      fontFamily: typography.display,
      fontSize: 27,
      letterSpacing: -0.6,
    },
    textAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: spacing.sm,
    },
    actionText: { color: c.primary, fontSize: 12, fontWeight: "600" },
    loanList: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
    },
    message: { color: c.muted, paddingVertical: spacing.lg, fontSize: 12 },
    loanRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    lastLoanRow: { borderBottomWidth: 0 },
    avatar: {
      width: 43,
      height: 43,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontFamily: typography.display, fontSize: 19 },
    loanDetails: { flex: 1, gap: 5 },
    loanName: { color: c.ink, fontSize: 14, fontWeight: "600" },
    loanDue: { color: c.muted, fontSize: 11 },
    loanRight: { alignItems: "flex-end", gap: 6 },
    loanAmount: { color: c.ink, fontSize: 13, fontWeight: "600" },
    statusBadge: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: radius.sm,
    },
    statusText: { fontSize: 8, fontWeight: "700", letterSpacing: 0.5 },
  });
}
