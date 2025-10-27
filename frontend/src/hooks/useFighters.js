import { useEffect, useState, useCallback } from "react"
import { getAuthHeaders } from "../utils/utils"

export function useFighters(coachId = null) {
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFighters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let url = "http://localhost:4000/fighters"
      if (coachId) {
        url = `http://localhost:4000/fighters/by-coach/${coachId}`
      }
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch fighters")
      }
      const data = await response.json()
      setFighters(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [coachId])

  useEffect(() => {
    fetchFighters()
  }, [fetchFighters])

  return { fighters, loading, error, refetch: fetchFighters }
}
