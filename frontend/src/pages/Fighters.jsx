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
import { User, Plus } from "lucide-react"

export default function FightersPage() {
  const { toast } = useToast()
  const { fighters, loading, error, refetch } = useFighters()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">All Fighters</h1>
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
