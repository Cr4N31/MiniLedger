import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { authHeaders, getApiUrl } from "../lib/api";
import type { LoanRecord, LoanSummary } from "../types/loans";

type DashboardData = {
  summary: LoanSummary | null;
  loans: LoanRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useDashboard(): DashboardData {
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const headers = await authHeaders();
        const [summaryResponse, loansResponse] = await Promise.all([
          fetch(`${apiUrl}/api/loans/summary`, { headers }),
          fetch(`${apiUrl}/api/loans`, { headers }),
        ]);

        if (summaryResponse.status === 401 || loansResponse.status === 401) {
          throw new Error(
            "Your session is invalid or expired. Verify OTP again.",
          );
        }
        if (!summaryResponse.ok || !loansResponse.ok) {
          throw new Error(
            `Unable to load dashboard (summary: ${summaryResponse.status}, loans: ${loansResponse.status}).`,
          );
        }

        const summaryPayload = await summaryResponse.json();
        const loansPayload = await loansResponse.json();
        if (active) {
          setSummary(summaryPayload.summary ?? null);
          setLoans(Array.isArray(loansPayload.loans) ? loansPayload.loans : []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load dashboard.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { summary, loans, loading, error, refresh };
}
