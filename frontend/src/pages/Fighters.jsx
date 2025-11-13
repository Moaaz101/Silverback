import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import FighterCard from "../components/FighterCard"
import SummaryBox from "../components/SummaryBox"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorDisplay from "../components/ErrorDisplay"
import EmptyState from "../components/EmptyState"
import Modal from "../components/Modal"
import CreateFighterForm from "../components/CreateFighterForm"
import { useFighters } from "../hooks/useFighters"
import { User, Plus, UserPlus  } from "lucide-react"
import { useCoaches } from "../hooks/useCoaches"

export default function FightersPage() {
  const location = useLocation();
  const { coaches } = useCoaches()
  const [selectedCoachId, setSelectedCoachId] = useState("")
  const { fighters, loading, error } = useFighters(selectedCoachId || null);

  // Reset filters when refresh is triggered from navbar
  useEffect(() => {
    if (location.state?.refresh) {
      setSelectedCoachId("");
    }
  }, [location.state?.refresh]); 

  return (
    <div key={location.state?.refresh}>
      {loading ? (
        <LoadingSpinner message="Loading fighters..." />
      ) : error ? (
        <ErrorDisplay error={error} title="Error loading fighters" />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Fighters</h1>
  </div>
  
  <div className="flex items-center gap-4">
    {/* Coach Filter Dropdown */}
    <div className="relative">
      <select
        id="coach-filter"
        value={selectedCoachId}
        onChange={(e) => setSelectedCoachId(e.target.value)}
        className="w-64 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:border-[#492e51]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23492e51'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
      >
        <option value="">All Coaches</option>
        {coaches && coaches.map((coach) => (
          <option key={coach.id} value={coach.id}>
            {coach.name}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

        {/* Fighters Grid */}
        {fighters.length === 0 ? (
          <EmptyState 
            icon={User}
            title="No fighters found"
            description="There are currently no fighters registered in the system."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start" style={{ gridAutoRows: 'min-content' }}>
            {fighters.map((fighter) => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <SummaryBox fighters={fighters} />
      </div>
        </div>
      )}
    </div>
  )
}
