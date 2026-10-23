import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, type ThemeColors } from "../../constants/theme";
import { money } from "../../utils/formatters";

type Props = { colors: ThemeColors; amount: number | string };

export default function OverdueCard({ colors, amount }: Props) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="alert-circle-outline" size={23} color={colors.danger} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Overdue balance</Text>
        <Text style={styles.subtitle}>Outstanding past its due date</Text>
      </View>
      <Text style={styles.amount}>{money(amount)}</Text>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: c.dangerSurface,
      borderRadius: radius.md,
      padding: spacing.lg,
      marginBottom: spacing.section,
    },
    icon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    copy: { flex: 1, gap: 4 },
    title: { color: c.ink, fontSize: 14, fontWeight: "600" },
    subtitle: { color: c.muted, fontSize: 11 },
    amount: { color: c.danger, fontSize: 15, fontWeight: "700" },
  });
}
