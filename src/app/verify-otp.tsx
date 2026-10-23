import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiUrl } from "@/lib/api";

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerifyOtp() {
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      Alert.alert("Invalid code", "Enter the six-digit verification code.");
      return;
    }

    if (!phone) {
      Alert.alert("Missing phone number", "Return to login and try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: cleanOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "The verification code was rejected.",
        );
      }

      const token = data.token ?? data.accessToken;

      if (typeof token !== "string" || !token) {
        throw new Error("The server did not return an authentication token.");
      }

      await AsyncStorage.setItem("miniledger_token", token);

      // Replace the verification screen with the existing dashboard.
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Verification failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>#</Text>
            </View>

            <Text style={styles.eyebrow}>PHONE VERIFICATION</Text>
            <Text style={styles.title}>Check your code.</Text>
            <Text style={styles.description}>
              Enter the six-digit code generated for{" "}
              <Text style={styles.phone}>{phone || "your phone number"}</Text>.
            </Text>

            <Text style={styles.label}>Verification code</Text>
            <TextInput
              value={otp}
              onChangeText={(value) =>
                setOtp(value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              placeholderTextColor="#9298A5"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              editable={!loading}
              autoFocus
              style={styles.input}
              onSubmitEditing={handleVerifyOtp}
              returnKeyType="go"
            />

            <Pressable
              onPress={handleVerifyOtp}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify and continue</Text>
              )}
            </Pressable>

            <Text style={styles.helper}>
              For this demo, check your backend terminal for the OTP.
            </Text>
          </View>

          <Text style={styles.footer}>
            MiniLedger · Simple lending, clear records.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingRight: 16,
  },
  backText: {
    color: "#555D6D",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    marginVertical: 40,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E8EAF0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  iconText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#171A22",
  },
  eyebrow: {
    color: "#737B8C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    color: "#171A22",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1,
  },
  description: {
    color: "#747B89",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 32,
  },
  phone: {
    color: "#252A35",
    fontWeight: "700",
  },
  label: {
    color: "#252A35",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: "#E1E4EA",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 8,
    color: "#171A22",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },
  button: {
    height: 56,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: "#171A22",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  helper: {
    color: "#858B98",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 16,
  },
  footer: {
    color: "#9AA0AB",
    fontSize: 11,
    textAlign: "center",
  },
});
