import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  radius,
  spacing,
  typography,
  type ThemeColors,
} from "../../constants/theme";
import { money } from "../../utils/formatters";
import type { LoanSummary } from "../../types/loans";

type Props = { colors: ThemeColors; summary: LoanSummary | null };

export default function FinancialOverview({ colors, summary }: Props) {
  const styles = makeStyles(colors);
  const totalLent = Number(summary?.totalLent ?? 0);
  const totalRepaid = Number(summary?.totalRepaid ?? 0);
  const outstanding = Math.max(0, totalLent - totalRepaid);
  const progress =
    totalLent > 0 ? Math.min(100, (totalRepaid / totalLent) * 100) : 0;

  return (
    <View style={styles.overview}>
      <Text style={styles.mutedLabel}>TOTAL OUTSTANDING</Text>
      <Text style={styles.heroAmount}>{money(outstanding)}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <View style={styles.progressCaption}>
        <Text style={styles.progressText}>Collection progress</Text>
        <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.overviewDivider} />
      <View style={styles.metricRow}>
        <View style={styles.metric}>
          <View style={styles.metricHeading}>
            <Ionicons
              name="arrow-up-circle-outline"
              size={18}
              color={colors.muted}
            />
            <Text style={styles.mutedLabel}>TOTAL LENT</Text>
          </View>
          <Text style={styles.metricAmount}>{money(totalLent)}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <View style={styles.metricHeading}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.accent}
            />
            <Text style={styles.mutedLabel}>COLLECTED</Text>
          </View>
          <Text style={styles.metricAmount}>{money(totalRepaid)}</Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    overview: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.xl,
      marginBottom: spacing.md,
    },
    mutedLabel: {
      color: c.muted,
      fontSize: 10,
      letterSpacing: 1.2,
      fontWeight: "600",
    },
    heroAmount: {
      color: c.ink,
      fontFamily: typography.display,
      fontSize: 37,
      letterSpacing: -1.5,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    progressTrack: {
      height: 5,
      borderRadius: radius.pill,
      backgroundColor: c.surfaceMuted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: radius.pill,
      backgroundColor: c.accent,
    },
    progressCaption: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },
    progressText: { color: c.muted, fontSize: 12 },
    progressValue: { color: c.accent, fontSize: 12, fontWeight: "700" },
    overviewDivider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: spacing.lg,
    },
    metricRow: { flexDirection: "row", gap: spacing.md },
    metric: { flex: 1, gap: spacing.sm },
    metricHeading: { flexDirection: "row", alignItems: "center", gap: 6 },
    metricAmount: { color: c.ink, fontSize: 17, fontWeight: "600" },
    metricDivider: { width: 1, backgroundColor: c.border },
  });
}
