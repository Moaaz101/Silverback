import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FighterAttendanceHistory from '../components/FighterAttendanceHistory';
import FighterPaymentHistory from '../components/FighterPaymentHistory';
import FighterProfileHeader from '../components/FighterProfileHeader';
import FighterEditForm from '../components/FighterEditForm';
import FighterSettings from '../components/FighterSettings';
import DeleteFighterModal from '../components/DeleteFighterModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { useFighter } from '../hooks/useFighter';

export default function FighterProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fighter, loading, error, updateFighter, deleteFighter, fetchFighter } = useFighter(id);
  
  const [activeTab, setActiveTab] = useState('attendance');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle fighter update
  const handleUpdateFighter = async (fighterData) => {
    setIsSubmitting(true);

    try {
      await updateFighter(fighterData);
      // Refresh fighter data to get updated coach information
      await fetchFighter();
      setIsEditing(false);
      toast.success('Fighter updated successfully');
    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle fighter deletion
  const handleDeleteFighter = async () => {
    setIsSubmitting(true);

    try {
      const success = await deleteFighter();
      if (success) {
        toast.success('Fighter deleted successfully');
        navigate('/fighters');
      }
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
      setIsDeleting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading fighter profile..." />;
  }

  if (error || !fighter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Fighter</h2>
            <p className="text-gray-700 mb-6">{error || "Fighter not found"}</p>
            <Link
              to="/fighters"
              className="inline-flex items-center text-[#5a3660] hover:text-[#492e51] font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Fighters List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render the Settings tab content
  const renderSettingsTab = () => {
    if (isEditing) {
      return (
        <FighterEditForm 
          fighter={fighter}
          onUpdate={handleUpdateFighter}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
        />
      );
    }

    return (
      <FighterSettings 
        onEditClick={() => setIsEditing(true)}
        onDeleteClick={() => setIsDeleting(true)}
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Link
            to="/fighters"
            className="inline-flex items-center text-[#5a3660] hover:text-[#492e51] font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Fighters List
          </Link>
        </div>

        {/* Fighter Profile Header */}
        <FighterProfileHeader fighter={fighter} />
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'attendance'
                    ? 'border-[#492e51] text-[#492e51]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-all`}
                onClick={() => setActiveTab('attendance')}
              >
                Attendance History
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-[#492e51] text-[#492e51]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-all`}
                onClick={() => setActiveTab('payments')}
              >
                Payment History
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-[#492e51] text-[#492e51]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-all`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'attendance' && (
              <FighterAttendanceHistory fighterId={id} />
            )}
            {activeTab === 'payments' && (
              <FighterPaymentHistory fighterId={id} />
            )}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {isDeleting && (
        <DeleteFighterModal
          isOpen={isDeleting}
          isSubmitting={isSubmitting}
          onConfirm={handleDeleteFighter}
          onCancel={() => setIsDeleting(false)}
          fighterName={fighter.name}
        />
      )}
    </div>
  );
}