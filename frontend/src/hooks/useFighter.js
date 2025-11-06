import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../utils/utils';
import { buildApiUrl } from '../config/api';

export function useFighter(fighterId) {
  const [fighter, setFighter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fighter details
  const fetchFighter = useCallback(async () => {
    if (!fighterId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(buildApiUrl(`/fighters/${fighterId}`), {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch fighter data');
      }
      
      const data = await response.json();
      setFighter(data);
      return data;
    } catch (err) {
      console.error('Error fetching fighter:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fighterId]);

  // Update fighter details
  const updateFighter = useCallback(async (fighterData) => {
    if (!fighterId) return null;
    
    try {
      const response = await fetch(buildApiUrl(`/fighters/${fighterId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(fighterData)
      });

      if (!response.ok) {
        throw new Error('Failed to update fighter');
      }

      const updatedData = await response.json();
      setFighter(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error updating fighter:', err);
      throw err;
    }
  }, [fighterId]);

  // Delete fighter
  const deleteFighter = useCallback(async () => {
    if (!fighterId) return false;
    
    try {
      const response = await fetch(buildApiUrl(`/fighters/${fighterId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete fighter');
      }

      return true;
    } catch (err) {
      console.error('Error deleting fighter:', err);
      throw err;
    }
  }, [fighterId]);

  // Load fighter data on component mount
  useEffect(() => {
    fetchFighter();
  }, [fetchFighter]);

  return {
    fighter,
    loading,
    error,
    fetchFighter,
    updateFighter,
    deleteFighter
  };
}
