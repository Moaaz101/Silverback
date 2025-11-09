import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CoachCard from "../components/CoachCard";
import CoachSummaryBox from "../components/CoachSummaryBox";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import CreateCoachForm from "../components/CreateCoachForm";
import EditCoachForm from "../components/EditCoachForm";
import { useCoaches } from "../hooks/useCoaches";
import { useToast } from "../contexts/ToastContext";
import { UserCheck, Plus } from "lucide-react";

export default function CoachesPage() {
  const location = useLocation();
  const { toast } = useToast();
  const { coaches, loading, error, createCoach, updateCoach, deleteCoach } = useCoaches();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when refresh is triggered from navbar
  useEffect(() => {
    if (location.state?.refresh) {
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedCoach(null);
    }
  }, [location.state?.refresh]);

  const handleCreateCoach = async (coachData) => {
    try {
      setIsSubmitting(true);
      await createCoach(coachData);
      setIsCreateModalOpen(false);
      toast.success("Coach created successfully!");
    } catch (error) {
      console.error("Error creating coach:", error);
      toast.error("Failed to create coach: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCoach = async (coachData) => {
    try {
      setIsSubmitting(true);
      await updateCoach(selectedCoach.id, coachData);
      setIsEditModalOpen(false);
      setSelectedCoach(null);
      toast.success("Coach updated successfully!");
    } catch (error) {
      console.error("Error updating coach:", error);
      toast.error("Failed to update coach: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoach = async () => {
    try {
      setIsSubmitting(true);
      await deleteCoach(selectedCoach.id);
      setIsDeleteModalOpen(false);
      setSelectedCoach(null);
      toast.success("Coach deleted successfully!");
    } catch (error) {
      console.error("Error deleting coach:", error);
      toast.error("Failed to delete coach: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (coach) => {
    setSelectedCoach(coach);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (coach) => {
    setSelectedCoach(coach);
    setIsDeleteModalOpen(true);
  };

  return (
    <div key={location.state?.refresh}>
      {loading && coaches.length === 0 ? (
        <LoadingSpinner message="Loading coaches..." />
      ) : error ? (
        <ErrorDisplay error={error} title="Error loading coaches" />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coaches</h1>
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
              <CoachCard 
                key={coach.id} 
                coach={coach} 
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
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

        {/* Edit Coach Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => !isSubmitting && setIsEditModalOpen(false)}
          title="Edit Coach"
        >
          {selectedCoach && (
            <EditCoachForm
              coach={selectedCoach}
              onSubmit={handleEditCoach}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedCoach(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
          title="Delete Coach"
        >
          {selectedCoach && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedCoach.name}</strong>?
              </p>
              {selectedCoach.fighters && selectedCoach.fighters.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Warning:</strong> This coach has <strong>{selectedCoach.fighters.length}</strong> assigned fighter(s). 
                    Deleting will remove the coach assignment from these fighters.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCoach(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCoach}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete Coach"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
        </div>
      )}
    </div>
  );
}