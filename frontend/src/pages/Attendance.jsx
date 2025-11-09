import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Check, 
  Users, 
  UserCheck, 
  CalendarDays, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon 
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import { useToast } from "../contexts/ToastContext";
import { useAttendance } from "../hooks/useAttendance";
import { formatTime } from "../utils/utils.js";

export default function AttendancePage() {
  const location = useLocation();
  const { toast } = useToast();
  const { loading, error, fetchDailyOverview, submitBulkAttendance } = useAttendance();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [coachesWithSessions, setCoachesWithSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});

  // Reset state when refresh is triggered from navbar
  useEffect(() => {
    if (location.state?.refresh) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setAttendanceData({});
    }
  }, [location.state?.refresh]);

  /**
   * Load daily overview data
   */
  const loadDailyOverview = async (date) => {
    try {
      const data = await fetchDailyOverview(date);
      setCoachesWithSessions(data);
      
      // Initialize attendance data with existing records
      const initialAttendanceData = {};
      data.forEach(coach => {
        coach.fighters.forEach(fighter => {
          const existingAttendance = fighter.attendances[0]; // Should only be one per day
          if (existingAttendance) {
            initialAttendanceData[fighter.id] = existingAttendance.status;
          } else {
            initialAttendanceData[fighter.id] = 'not_marked';
          }
        });
      });
      setAttendanceData(initialAttendanceData);
    } catch (err) {
      console.error('Error loading daily overview:', err);
      toast.error('Failed to load attendance data');
    }
  };

  /**
   * Load data when date changes
   */
  useEffect(() => {
    loadDailyOverview(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /**
   * Handle attendance status change
   */
  const handleAttendanceChange = (fighterId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [fighterId]: status
    }));
  };

  /**
   * Get status color classes
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  /**
   * Submit attendance records
   */
  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      
      // Create attendance records for changed statuses
      const attendanceRecords = [];
      Object.entries(attendanceData).forEach(([fighterId, status]) => {
        if (status !== 'not_marked') {
          attendanceRecords.push({
            fighterId: parseInt(fighterId),
            status: status,
            sessionType: 'group',
            createdBy: 'admin'
          });
        }
      });

      if (attendanceRecords.length === 0) {
        toast.warning('Please mark attendance for at least one fighter');
        return;
      }

      const result = await submitBulkAttendance(attendanceRecords, selectedDate);
      
      // Handle results
      if (result.errors.length > 0) {
        const errorMessages = result.errors
          .map(error => error.error)
          .join('. ');
        toast.error(errorMessages, { duration: 8000 });
      }

      if (result.successes.length > 0) {
        toast.success(`Successfully updated attendance for ${result.successes.length} fighter(s)`);
      }

      // Refresh the data
      await loadDailyOverview(selectedDate);
      
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to submit attendance: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div key={location.state?.refresh}>
      {loading && coachesWithSessions.length === 0 ? (
        <LoadingSpinner message="Loading daily attendance..." />
      ) : error ? (
        <ErrorDisplay error={error} title="Error loading attendance" />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-500 mt-1">Track daily attendance for all sessions</p>
            </div>
            
            {/* Date Picker and Submit Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
                />
              </div>
              
              <button
                onClick={handleSubmitAttendance}
                disabled={submitting || loading}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-8 py-3.5 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transform hover:scale-105 active:scale-100 ring-2 ring-[#492e51]/30 ring-offset-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Submit Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Coaches with Sessions */}
        {coachesWithSessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions scheduled</h3>
              <p className="text-gray-500">
                There are no coaches with sessions scheduled for{' '}
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {coachesWithSessions.map((coach) => (
              <div key={coach.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Coach Header */}
                <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{coach.name}</h2>
                        <div className="flex items-center space-x-4 mt-1">
                          {coach.schedules.map((schedule, index) => (
                            <span key={index} className="text-white/80 text-sm flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{schedule.weekday} at {formatTime(schedule.time)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm">Fighters</p>
                      <p className="text-2xl font-bold">{coach.fighters.length}</p>
                    </div>
                  </div>
                </div>

                {/* Fighters */}
                {coach.fighters.length > 0 ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coach.fighters.map((fighter) => (
                        <div 
                          key={fighter.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{fighter.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>Sessions: {fighter.sessionsLeft}</span>
                              </div>
                            </div>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ml-2 ${getStatusColor(attendanceData[fighter.id])}`}
                            >
                              {attendanceData[fighter.id] === 'not_marked' 
                                ? 'Not marked' 
                                : attendanceData[fighter.id].charAt(0).toUpperCase() + attendanceData[fighter.id].slice(1)
                              }
                            </span>
                          </div>
                          
                          {/* Attendance Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAttendanceChange(fighter.id, 'present')}
                              disabled={loading || submitting}
                              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                attendanceData[fighter.id] === 'present'
                                  ? 'bg-green-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Present</span>
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(fighter.id, 'absent')}
                              disabled={loading || submitting}
                              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                attendanceData[fighter.id] === 'absent'
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Absent</span>
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(fighter.id, 'late')}
                              disabled={loading || submitting}
                              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                attendanceData[fighter.id] === 'late'
                                  ? 'bg-yellow-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                              }`}
                            >
                              <ClockIcon className="w-3 h-3" />
                              <span>Late</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No fighters assigned to this coach</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
}