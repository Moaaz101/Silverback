import { useEffect, useState, useCallback } from "react"

export function useFighters() {
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFighters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:4000/fighters")
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
  }, [])

  useEffect(() => {
    fetchFighters()
  }, [fetchFighters])

  return { fighters, loading, error, refetch: fetchFighters }
}
