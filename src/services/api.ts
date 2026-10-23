const API_URL = "http://YOUR_COMPUTER_IP:YOUR_PORT";

export async function apiRequest<T>(
  endpoint: string,
  token: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
