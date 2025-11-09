import { useState, useCallback } from 'react';
import { getAuthHeaders } from '../utils/utils';
import { buildApiUrl } from '../config/api';

export function usePrivateSessions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all fighters with private subscriptions
   * @returns {Promise<Array>} Array of private fighters
   */
  const fetchPrivateFighters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl('/fighters'), {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fighters');
      }

      const allFighters = await response.json();
      
      // Filter to only private subscription fighters
      const privateFighters = allFighters.filter(f => f.subscriptionType === 'private');
      
      return privateFighters;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching private fighters';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Record a private session
   * @param {Object} sessionData - Session data
   * @param {number} sessionData.fighterId - Fighter ID
   * @param {string} sessionData.date - Date in YYYY-MM-DD format
   * @param {string} sessionData.status - Session status (present/absent/late)
   * @param {string} sessionData.notes - Session notes
   * @param {string} sessionData.duration - Session duration in minutes
   * @param {string} sessionData.createdBy - Username of admin recording
   * @returns {Promise<Object>} Created session data
   */
  const recordPrivateSession = useCallback(async (sessionData) => {
    try {
      setLoading(true);

      const response = await fetch(buildApiUrl('/attendance/private'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record session');
      }

      await response.json();
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch private session history with filters
   * @param {Object} filters - Optional filters
   * @param {number} filters.fighterId - Filter by fighter ID
   * @param {string} filters.startDate - Filter by start date
   * @param {string} filters.endDate - Filter by end date
   * @param {number} filters.limit - Limit number of results
   * @returns {Promise<Array>} Array of private sessions
   */
  const fetchPrivateSessionHistory = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.fighterId) params.append('fighterId', filters.fighterId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(
        buildApiUrl(`/attendance/private?${params.toString()}`),
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session history');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching session history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPrivateFighters,
    recordPrivateSession,
    fetchPrivateSessionHistory
  };
}
