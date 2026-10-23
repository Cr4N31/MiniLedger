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
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiUrl } from "@/lib/api";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    const cleanPhone = phone.trim();

    if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Enter a valid phone number, including your country code if needed.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Could not send OTP.");
      }

      router.push({
        pathname: "/verify-otp",
        params: { phone: cleanPhone },
      });
    } catch (error) {
      Alert.alert(
        "Couldn't send OTP",
        error instanceof Error
          ? error.message
          : "Check your connection and try again.",
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
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.brandName}>MiniLedger</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>YOUR MONEY, ORGANIZED</Text>
            <Text style={styles.title}>Keep track.{"\n"}Stay in control.</Text>
            <Text style={styles.description}>
              Manage money you've lent to friends, track repayments, and never
              lose sight of a due date.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+2348012345678"
                placeholderTextColor="#9298A5"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={16}
                editable={!loading}
                style={styles.input}
                onSubmitEditing={handleSendOtp}
                returnKeyType="go"
              />

              <Pressable
                onPress={handleSendOtp}
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
                  <Text style={styles.buttonText}>Send verification code</Text>
                )}
              </Pressable>

              <Text style={styles.helper}>
                We'll send a one-time code to verify your number.
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>Simple lending. Clear records.</Text>
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
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#171A22",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  brandName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#171A22",
    letterSpacing: -0.5,
  },
  content: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    marginVertical: 40,
  },
  eyebrow: {
    color: "#737B8C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 18,
  },
  title: {
    color: "#171A22",
    fontSize: 38,
    lineHeight: 45,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  description: {
    color: "#747B89",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
    maxWidth: 340,
  },
  form: {
    marginTop: 38,
  },
  label: {
    color: "#252A35",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E1E4EA",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#171A22",
    backgroundColor: "#FFFFFF",
  },
  button: {
    height: 56,
    marginTop: 16,
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
    marginTop: 14,
  },
  footer: {
    color: "#9AA0AB",
    fontSize: 12,
    textAlign: "center",
  },
});
