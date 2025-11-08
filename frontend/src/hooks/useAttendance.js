import { useState, useCallback } from 'react';
import { getAuthHeaders } from '../utils/utils';
import { buildApiUrl } from '../config/api';

export function useAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch daily overview of coaches with their sessions and fighters
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of coaches with their fighters and schedules
   */
  const fetchDailyOverview = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        buildApiUrl(`/attendance/daily-overview?date=${date}`),
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch daily overview');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching attendance data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit bulk attendance records
   * @param {Array} attendanceRecords - Array of attendance records to submit
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Object with success/error results
   */
  const submitBulkAttendance = useCallback(async (attendanceRecords, date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl('/attendance/bulk'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          attendanceRecords,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }

      const results = await response.json();
      
      // Separate successes and errors
      const errors = results.filter(result => !result.success);
      const successes = results.filter(result => result.success);

      return {
        success: true,
        results,
        errors,
        successes,
        hasNoSessionsError: errors.some(error => 
          error.error && error.error.includes('no sessions left')
        ),
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit attendance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark attendance for a single fighter
   * @param {number} fighterId - Fighter ID
   * @param {string} status - Attendance status (present, absent, late)
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} sessionType - Type of session (group, private)
   * @returns {Promise<Object>} Created attendance record
   */
  const markAttendance = useCallback(async (fighterId, status, date, sessionType = 'group') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl('/attendance'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fighterId,
          status,
          date,
          sessionType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark attendance');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark attendance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get attendance history for a specific fighter with optional date range
   * @param {number} fighterId - Fighter ID
   * @param {string} startDate - Optional start date (YYYY-MM-DD)
   * @param {string} endDate - Optional end date (YYYY-MM-DD)
   * @returns {Promise<Object>} Object containing fighter info, attendance records, and summary
   */
  const getAttendanceHistory = useCallback(async (fighterId, startDate = null, endDate = null) => {
    try {
      setLoading(true);
      setError(null);

      // Build query URL with optional date filters
      let url = buildApiUrl(`/attendance/${fighterId}`);
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch attendance history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchDailyOverview,
    submitBulkAttendance,
    markAttendance,
    getAttendanceHistory,
  };
}