import { useState } from "react"
import FighterCard from "../components/FighterCard"
import SummaryBox from "../components/SummaryBox"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorDisplay from "../components/ErrorDisplay"
import EmptyState from "../components/EmptyState"
import Modal from "../components/Modal"
import CreateFighterForm from "../components/CreateFighterForm"
import { useFighters } from "../hooks/useFighters"
import { useToast } from "../contexts/ToastContext"
import { User, Plus, UserPlus  } from "lucide-react"
import { useCoaches } from "../hooks/useCoaches"

export default function FightersPage() {
  const { toast } = useToast()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { coaches } = useCoaches()
  const [selectedCoachId, setSelectedCoachId] = useState("")
  const { fighters, loading, error, refetch } = useFighters(selectedCoachId || null); 

  const handleCreateFighter = async (fighterData) => {
    try {
      const response = await fetch("http://localhost:4000/fighters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fighterData),
      })

      if (!response.ok) {
        throw new Error("Failed to create fighter")
      }

      // Close modal and refresh the fighters list
      setIsCreateModalOpen(false)
      await refetch() // Await the refetch to ensure it completes
      toast.success("Fighter created successfully!")
    } catch (error) {
      console.error("Error creating fighter:", error)
      toast.error("Failed to create fighter: " + error.message)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading fighters..." />
  }

  if (error) {
    return <ErrorDisplay error={error} title="Error loading fighters" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Fighters</h1>
    <p className="text-gray-600">Manage and view all fighters</p>
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
        
        {/* Create Fighter Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Fighter"
        >
          <CreateFighterForm
            onSubmit={handleCreateFighter}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  )
}
