import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getAuthToken() {
  const token =
    process.env.EXPO_PUBLIC_DEV_TOKEN ??
    (await AsyncStorage.getItem("miniledger_token"));

  if (!token) {
    throw new Error(
      "No saved session token. Sign in again or configure EXPO_PUBLIC_DEV_TOKEN for local testing.",
    );
  }
  return token;
}

export async function authHeaders() {
  return {
    Authorization: `Bearer ${await getAuthToken()}`,
    "Content-Type": "application/json",
  };
}

export function getApiUrl() {
  if (!API_URL) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_URL. Set it to your backend's reachable URL.",
    );
  }
  return API_URL.replace(/\/$/, "");
}
