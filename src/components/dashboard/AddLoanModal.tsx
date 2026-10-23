import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  radius,
  spacing,
  typography,
  type ThemeColors,
} from "../../constants/theme";
import { authHeaders, getApiUrl } from "../../lib/api";

type Props = {
  colors: ThemeColors;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export default function AddLoanModal({
  colors,
  visible,
  onClose,
  onSaved,
}: Props) {
  const styles = makeStyles(colors);
  const [friendName, setFriendName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeForm() {
    if (saving) return;
    setError(null);
    onClose();
  }

  async function submitLoan() {
    const trimmedName = friendName.trim();
    const parsedAmount = Number(loanAmount);
    if (!trimmedName) return setError("Enter your friend’s name.");
    if (
      !loanAmount.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    )
      return setError("Enter a loan amount greater than zero.");
    if (!isValidDate(dueDate))
      return setError(
        "Enter a valid date as YYYY-MM-DD, for example 2026-11-15.",
      );

    try {
      setSaving(true);
      setError(null);
      const apiUrl = getApiUrl();
      const headers = await authHeaders();
      const response = await fetch(`${apiUrl}/api/loans`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          friendName: trimmedName,
          amount: parsedAmount,
          dueDate: `${dueDate}T00:00:00.000Z`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.message ?? `Could not create loan (${response.status}).`,
        );

      setFriendName("");
      setLoanAmount("");
      setDueDate("");
      onClose();
      onSaved();
      Alert.alert("Loan recorded", "Your loan has been saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save this loan.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={closeForm}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.dismissArea}
          onPress={closeForm}
          accessibilityLabel="Close loan form"
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>NEW RECORD</Text>
              <Text style={styles.title}>Record a loan</Text>
            </View>
            <Pressable
              onPress={closeForm}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>
          <Text style={styles.label}>FRIEND’S NAME</Text>
          <TextInput
            value={friendName}
            onChangeText={setFriendName}
            placeholder="e.g. Alex Johnson"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="next"
            style={styles.input}
          />
          <Text style={styles.label}>AMOUNT (NGN)</Text>
          <TextInput
            value={loanAmount}
            onChangeText={setLoanAmount}
            placeholder="e.g. 25000"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <Text style={styles.label}>DUE DATE</Text>
          <TextInput
            value={dueDate}
            onChangeText={(value) => {
              setDueDate(value.trim());
              if (error) setError(null);
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            maxLength={10}
          />
          <Text style={styles.hint}>Use the format 2026-11-15.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={submitLoan}
            style={[styles.saveButton, saving && styles.disabledButton]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving…" : "Save loan"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15, 18, 20, 0.45)",
    },
    dismissArea: { flex: 1 },
    card: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    eyebrow: {
      color: c.muted,
      fontSize: 9,
      letterSpacing: 1.8,
      marginBottom: 5,
      fontWeight: "600",
    },
    title: {
      color: c.ink,
      fontFamily: typography.display,
      fontSize: 27,
      letterSpacing: -0.6,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      color: c.muted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.2,
      marginTop: spacing.sm,
    },
    input: {
      color: c.ink,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 15,
    },
    hint: {
      color: c.muted,
      fontSize: 11,
      marginTop: -2,
      marginBottom: spacing.sm,
    },
    error: { color: c.danger, fontSize: 12, marginVertical: spacing.sm },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: c.primary,
      paddingVertical: spacing.lg,
      borderRadius: radius.md,
      marginTop: spacing.xs,
    },
    saveButtonText: { color: "#FFF9F0", fontSize: 14, fontWeight: "700" },
    disabledButton: { opacity: 0.6 },
  });
}
