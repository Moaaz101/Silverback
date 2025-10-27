import { useState } from "react";
import CoachCard from "../components/CoachCard";
import CoachSummaryBox from "../components/CoachSummaryBox";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import CreateCoachForm from "../components/CreateCoachForm";
import { useCoaches } from "../hooks/useCoaches";
import { useToast } from "../contexts/ToastContext";
import { UserCheck, Plus } from "lucide-react";

export default function CoachesPage() {
  const { toast } = useToast();
  const { coaches, loading, error, createCoach } = useCoaches();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCoach = async (coachData) => {
    try {
      setIsSubmitting(true);
      
      await createCoach(coachData);
      
      // Close modal on success
      setIsCreateModalOpen(false);
      toast.success("Coach created successfully!");
    } catch (error) {
      console.error("Error creating coach:", error);
      toast.error("Failed to create coach: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && coaches.length === 0) {
    return <LoadingSpinner message="Loading coaches..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} title="Error loading coaches" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coaches</h1>
            <p className="text-gray-500">Manage your gym coaches and schedules</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-6 py-3 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-medium shadow-lg hover:shadow-xl border border-[#5a3660]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Add Coach</span>
          </button>
        </div>

        {/* Coaches Grid */}
        {coaches.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No coaches found"
            description="There are currently no coaches registered in the system. Click 'Add Coach' to get started."
          />
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
            style={{ gridAutoRows: "min-content" }}
          >
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {coaches.length > 0 && <CoachSummaryBox coaches={coaches} />}

        {/* Create Coach Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
          title="Create New Coach"
        >
          <CreateCoachForm
            onSubmit={handleCreateCoach}
            onCancel={() => setIsCreateModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </div>
    </div>
  );
}