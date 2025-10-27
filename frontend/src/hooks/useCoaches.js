import { useEffect, useState, useCallback } from "react";
import { getAuthHeaders } from "../utils/utils";

export function useCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all coaches
   */
  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:4000/coaches", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch coaches");
      }
      const data = await response.json();
      setCoaches(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new coach
   * @param {Object} coachData - Coach data to create
   * @returns {Promise<Object>} Created coach object
   */
  const createCoach = useCallback(async (coachData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:4000/coaches", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(coachData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create coach");
      }

      const newCoach = await response.json();
      
      // Add the new coach to the local state
      setCoaches(prevCoaches => [...prevCoaches, newCoach]);
      
      return newCoach;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create coach";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing coach
   * @param {number} coachId - Coach ID to update
   * @param {Object} coachData - Updated coach data
   * @returns {Promise<Object>} Updated coach object
   */
  const updateCoach = useCallback(async (coachId, coachData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:4000/coaches/${coachId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(coachData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update coach");
      }

      const updatedCoach = await response.json();
      
      // Update the coach in local state
      setCoaches(prevCoaches =>
        prevCoaches.map(coach => coach.id === coachId ? updatedCoach : coach)
      );
      
      return updatedCoach;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update coach";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a coach
   * @param {number} coachId - Coach ID to delete
   * @returns {Promise<void>}
   */
  const deleteCoach = useCallback(async (coachId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:4000/coaches/${coachId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete coach");
      }

      // Remove the coach from local state
      setCoaches(prevCoaches => prevCoaches.filter(coach => coach.id !== coachId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete coach";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  return {
    coaches,
    loading,
    error,
    refetch: fetchCoaches,
    createCoach,
    updateCoach,
    deleteCoach,
  };
}