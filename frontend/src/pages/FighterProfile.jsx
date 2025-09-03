import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Phone } from 'lucide-react';
import FighterAttendanceHistory from '../components/FighterAttendanceHistory';
import FighterPaymentHistory from '../components/FighterPaymentHistory';
import LoadingSpinner from '../components/LoadingSpinner';

export default function FighterProfilePage() {
  const { id } = useParams();
  const [fighter, setFighter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    const fetchFighter = async () => {
      try {
        const response = await fetch(`http://localhost:4000/fighters/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fighter data');
        }
        const data = await response.json();
        setFighter(data);
      } catch (err) {
        console.error('Error fetching fighter:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFighter();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/fighters"
          className="inline-flex items-center text-[#5a3660] hover:text-[#492e51] font-medium mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Fighters
        </Link>

        {/* Fighter Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">{fighter.name}</h1>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <User size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Coach</p>
                <p className="font-medium">{fighter.coach?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{fighter.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Sessions Left</p>
                <p className="font-medium">{fighter.sessionsLeft}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(fighter.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-[#5a3660] text-[#5a3660]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance History
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-[#5a3660] text-[#5a3660]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-[#5a3660] text-[#5a3660]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'attendance' && (
            <FighterAttendanceHistory fighterId={fighter.id} />
          )}
          {activeTab === 'payments' && (
            <FighterPaymentHistory fighterId={fighter.id} />
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Fighter Settings</h2>
              <p className="text-gray-500">Settings panel will be available here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}