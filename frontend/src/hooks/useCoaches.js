import { useEffect, useState, useCallback } from "react"
import { getAuthHeaders } from "../utils/utils"

export function useCoaches() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:4000/coaches", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch coaches")
      }
      const data = await response.json()
      setCoaches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoaches()
  }, [fetchCoaches])

  return { coaches, loading, error, refetch: fetchCoaches }
}
