import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { themes, spacing, radius, typography } from "@/constants/theme";
import { useDashboard } from "@/hooks/useDashboard";
import { authHeaders, getApiUrl } from "@/lib/api";
import type { LoanRecord } from "@/types/loans";

type LoanFilter = "all" | "outstanding" | "repaid" | "overdue";

const filters: { label: string; value: LoanFilter }[] = [
  { label: "All", value: "all" },
  { label: "Outstanding", value: "outstanding" },
  { label: "Repaid", value: "repaid" },
  { label: "Overdue", value: "overdue" },
];

const money = (amount: number | string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function formatDate(value: string) {
  const datePart = value.slice(0, 10);
  const parts = datePart.split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some(Number.isNaN) ||
    parts[0] < 1 ||
    parts[1] < 1 ||
    parts[1] > 12 ||
    parts[2] < 1 ||
    parts[2] > 31
  ) {
    return value;
  }

  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  if (
    date.getFullYear() !== parts[0] ||
    date.getMonth() !== parts[1] - 1 ||
    date.getDate() !== parts[2]
  ) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLoanStatus(loan: LoanRecord) {
  if (loan.repaidAt) return "repaid";
  if (loan.isOverdue) return "overdue";
  return "outstanding";
}

export default function LoansScreen() {
  const scheme = useColorScheme();
  const colors = themes[scheme === "dark" ? "dark" : "light"];
  const styles = makeStyles(colors);

  const { loans, loading, error, refresh } = useDashboard();

  const [filter, setFilter] = useState<LoanFilter>("all");
  const [savingId, setSavingId] = useState<string | number | null>(null);

  const filteredLoans = useMemo(
    () =>
      loans.filter((loan) => {
        if (filter === "all") return true;
        return getLoanStatus(loan) === filter;
      }),
    [loans, filter],
  );

  const outstandingTotal = loans
    .filter((loan) => !loan.repaidAt)
    .reduce((total, loan) => total + Number(loan.amount || 0), 0);

  async function markRepaid(loan: LoanRecord) {
    try {
      setSavingId(loan.id);

      const apiUrl = getApiUrl();
      const headers = await authHeaders();

      const response = await fetch(`${apiUrl}/api/loans/${loan.id}/repay`, {
        method: "PATCH",
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ?? `Could not update loan (${response.status}).`,
        );
      }

      Alert.alert(
        "Repayment recorded",
        `${loan.friendName}'s loan is marked as repaid.`,
      );
      refresh();
    } catch (err) {
      Alert.alert(
        "Couldn't update loan",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setSavingId(null);
    }
  }

  function confirmRepayment(loan: LoanRecord) {
    Alert.alert(
      "Mark loan as repaid?",
      `Confirm that ${loan.friendName} has repaid ${money(loan.amount)}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm repayment",
          onPress: () => void markRepaid(loan),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>YOUR RECORDS</Text>
          <Text style={styles.title}>Loans</Text>
          <Text style={styles.subtitle}>
            Keep track of the money you've lent and who's yet to repay you.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="wallet-outline" size={23} color={colors.accent} />
          </View>

          <Text style={styles.summaryLabel}>TOTAL OUTSTANDING</Text>
          <Text style={styles.summaryAmount}>{money(outstandingTotal)}</Text>
          <Text style={styles.summaryFootnote}>
            {loans.filter((loan) => !loan.repaidAt).length} unpaid{" "}
            {loans.filter((loan) => !loan.repaidAt).length === 1
              ? "loan"
              : "loans"}
          </Text>
        </View>

        <View style={styles.listHeading}>
          <Text style={styles.sectionTitle}>All loans</Text>
          <Text style={styles.loanCount}>{loans.length} records</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filters.map((item) => {
            const selected = filter === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setFilter(item.value)}
                style={[
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="cloud-offline-outline"
              size={28}
              color={colors.danger}
            />
            <Text style={styles.stateTitle}>Couldn't load your loans</Text>
            <Text style={styles.stateMessage}>{error}</Text>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : loading && loans.length === 0 ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateMessage}>Loading your loans…</Text>
          </View>
        ) : filteredLoans.length === 0 ? (
          <View style={styles.stateCard}>
            <Ionicons name="file-tray-outline" size={30} color={colors.muted} />
            <Text style={styles.stateTitle}>
              {loans.length === 0 ? "No loans yet" : "No matching loans"}
            </Text>
            <Text style={styles.stateMessage}>
              {loans.length === 0
                ? "Your recorded loans will appear here."
                : "Try choosing a different filter."}
            </Text>
          </View>
        ) : (
          <View style={styles.loanList}>
            {filteredLoans.map((loan, index) => {
              const status = getLoanStatus(loan);
              const repaid = status === "repaid";
              const overdue = status === "overdue";
              const saving = savingId === loan.id;

              return (
                <View
                  key={loan.id}
                  style={[
                    styles.loanCard,
                    index === filteredLoans.length - 1 && styles.lastLoanCard,
                  ]}
                >
                  <View style={styles.loanTopRow}>
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
                          {
                            color: repaid ? colors.accent : colors.primary,
                          },
                        ]}
                      >
                        {(loan.friendName || "?")
                          .trim()
                          .split(/\s+/)
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.loanInfo}>
                      <Text style={styles.friendName}>{loan.friendName}</Text>
                      <Text style={styles.dueDate}>
                        {repaid
                          ? `Repaid${loan.repaidAt ? ` · ${formatDate(loan.repaidAt)}` : ""}`
                          : `Due ${formatDate(loan.dueDate)}`}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: repaid
                            ? colors.accentSurface
                            : overdue
                              ? colors.dangerSurface
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
                              : overdue
                                ? colors.danger
                                : colors.muted,
                          },
                        ]}
                      >
                        {status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.loanBottomRow}>
                    <Text style={styles.amount}>{money(loan.amount)}</Text>

                    {!repaid && (
                      <Pressable
                        accessibilityRole="button"
                        disabled={saving || savingId !== null}
                        onPress={() => confirmRepayment(loan)}
                        style={[
                          styles.repayButton,
                          (saving || savingId !== null) &&
                            styles.disabledButton,
                        ]}
                      >
                        {saving ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.surface}
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={colors.surface}
                            />
                            <Text style={styles.repayButtonText}>
                              Mark repaid
                            </Text>
                          </>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.footerNote}>
          Keep good records. Keep good relationships.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: (typeof themes)["light"]) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    heading: {
      marginBottom: spacing.xl,
    },
    eyebrow: {
      color: c.muted,
      fontSize: 10,
      letterSpacing: 2,
      fontWeight: "600",
      marginBottom: spacing.sm,
    },
    title: {
      fontFamily: typography.display,
      fontSize: 34,
      color: c.ink,
    },
    subtitle: {
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 21,
      color: c.muted,
    },
    summaryCard: {
      padding: spacing.xl,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      marginBottom: spacing.xl,
    },
    summaryIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: c.accentSurface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    summaryLabel: {
      color: c.muted,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1.4,
    },
    summaryAmount: {
      color: c.ink,
      fontFamily: typography.display,
      fontSize: 29,
      marginTop: spacing.sm,
    },
    summaryFootnote: {
      color: c.muted,
      fontSize: 12,
      marginTop: spacing.xs,
    },
    listHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: c.ink,
      fontFamily: typography.display,
      fontSize: 23,
    },
    loanCount: {
      color: c.muted,
      fontSize: 12,
    },
    filterList: {
      gap: spacing.sm,
      paddingBottom: spacing.lg,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
    },
    filterChipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    filterText: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "600",
    },
    filterTextSelected: {
      color: "#FFF9F0",
    },
    loanList: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
    },
    loanCard: {
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: spacing.md,
    },
    lastLoanCard: {
      borderBottomWidth: 0,
    },
    loanTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    avatar: {
      width: 43,
      height: 43,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: typography.display,
      fontSize: 17,
    },
    loanInfo: {
      flex: 1,
      gap: 5,
    },
    friendName: {
      color: c.ink,
      fontSize: 14,
      fontWeight: "600",
    },
    dueDate: {
      color: c.muted,
      fontSize: 11,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: radius.sm,
    },
    statusText: {
      fontSize: 8,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    loanBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 43 + spacing.md,
      gap: spacing.sm,
    },
    amount: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "700",
    },
    repayButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      backgroundColor: c.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    repayButtonText: {
      color: "#FFF9F0",
      fontSize: 11,
      fontWeight: "700",
    },
    disabledButton: {
      opacity: 0.6,
    },
    stateCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.xl,
      minHeight: 170,
    },
    stateTitle: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
    },
    stateMessage: {
      color: c.muted,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
    },
    retryButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: c.primary,
      borderRadius: radius.md,
    },
    retryText: {
      color: "#FFF9F0",
      fontSize: 12,
      fontWeight: "700",
    },
    footerNote: {
      color: c.muted,
      fontFamily: typography.display,
      fontSize: 15,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });
}
