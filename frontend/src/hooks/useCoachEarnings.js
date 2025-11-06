import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../utils/utils';
import { buildApiUrl } from '../config/api';

export function useCoachEarnings(month, year) {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct the URL with query parameters
      const url = new URL(buildApiUrl('/payments/earnings/by-coach'));
      if (month && year) {
        url.searchParams.append('month', month);
        url.searchParams.append('year', year);
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch coach earnings');
      }
      const data = await response.json();
      setEarnings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return { earnings, loading, error, refetch: fetchEarnings };
}