import { useState, useEffect } from "react";
import { Calendar, Target, History, Filter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import PrivateFighterCard from "../components/PrivateFighterCard";
import RecordSessionModal from "../components/RecordSessionModal";
import { useToast } from "../contexts/ToastContext";
import { usePrivateSessions } from "../hooks/usePrivateSessions";
import { useAuth } from "../contexts/AuthContext";
import { useCoaches } from "../hooks/useCoaches";

export default function PrivateSessionsPage() {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchPrivateFighters, recordPrivateSession } = usePrivateSessions();
  const { coaches } = useCoaches();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [privateFighters, setPrivateFighters] = useState([]);
  const [filteredFighters, setFilteredFighters] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch private fighters
  const loadPrivateFighters = async () => {
    try {
      setLoading(true);
      setError(null);
      const fighters = await fetchPrivateFighters();
      setPrivateFighters(fighters);
      setFilteredFighters(fighters);
    } catch (err) {
      console.error('Error fetching private fighters:', err);
      setError(err.message || 'Failed to load private fighters');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPrivateFighters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter fighters by coach
  useEffect(() => {
    if (selectedCoach === '') {
      setFilteredFighters(privateFighters);
    } else {
      const filtered = privateFighters.filter(
        fighter => fighter.coach?.id === parseInt(selectedCoach)
      );
      setFilteredFighters(filtered);
    }
  }, [selectedCoach, privateFighters]);

  // Reset state when refresh is triggered from navbar
  useEffect(() => {
    if (location.state?.refresh) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedCoach('');
      setShowModal(false);
      setSelectedFighter(null);
    }
  }, [location.state?.refresh]);

  const handleRecordSession = (fighter) => {
    setSelectedFighter(fighter);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      await recordPrivateSession({
        fighterId: selectedFighter.id,
        date: selectedDate,
        status: 'present', // Private sessions are always attended
        notes: `Private session`,
        createdBy: user?.username || 'admin'
      });

      toast.success(`Session recorded for ${selectedFighter.name}`);
      
      // Refresh fighters to update session counts
      await loadPrivateFighters();
      
      // Close modal on success
      setShowModal(false);
      setSelectedFighter(null);
      
    } catch (error) {
      console.error('Error recording session:', error);
      // Re-throw the error so the modal can catch and display it
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div key={location.state?.refresh}>
      {loading ? (
        <LoadingSpinner message="Loading private fighters..." />
      ) : error ? (
        <ErrorDisplay error={error} title="Error loading private fighters" />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Private Sessions</h1>
              <p className="text-gray-500 mt-1">Record 1-on-1 training sessions</p>
            </div>
            
            {/* Date Picker & History Link */}
            <div className="flex items-center gap-3">
              <Link
                to="/private-sessions/history"
                className="flex items-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-8 py-3.5 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl border-2 border-white/30 whitespace-nowrap transform hover:scale-105 active:scale-100 ring-2 ring-[#492e51]/30 ring-offset-2"
              >
                <History className="w-5 h-5" />
                <span>View History</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
                >
                  <option value="">All Coaches</option>
                  {coaches && coaches.map(coach => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="mt-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
            />
            {selectedCoach && (
              <span className="text-sm text-gray-500">
                {filteredFighters.length} fighter{filteredFighters.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
        </div>

        {/* Private Fighters List */}
        {filteredFighters.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedCoach ? 'No Fighters Found' : 'No Private Fighters'}
              </h3>
              <p className="text-gray-500">
                {selectedCoach 
                  ? 'No private fighters found for this coach. Try selecting a different coach.'
                  : 'No fighters with private packages found. Create a fighter with a private package to get started.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFighters.map((fighter) => (
              <PrivateFighterCard
                key={fighter.id}
                fighter={fighter}
                onRecordSession={handleRecordSession}
              />
            ))}
          </div>
        )}

        {/* Modal for Recording Session */}
        {showModal && selectedFighter && (
          <RecordSessionModal
            fighter={selectedFighter}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false);
              setSelectedFighter(null);
            }}
            isSubmitting={submitting}
          />
        )}
      </div>
        </div>
      )}
    </div>
  );
}
