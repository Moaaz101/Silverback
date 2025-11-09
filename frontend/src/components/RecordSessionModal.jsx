import { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";

/**
 * Modal for recording a private training session
 * @param {Object} props
 * @param {Object} props.fighter - Fighter to record session for
 * @param {string} props.selectedDate - Currently selected date
 * @param {Function} props.onDateChange - Callback when date changes
 * @param {Function} props.onSubmit - Callback when form is submitted (should return Promise)
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {boolean} props.isSubmitting - Whether form is currently submitting
 */
export default function RecordSessionModal({ 
  fighter, 
  selectedDate, 
  onDateChange,
  onSubmit, 
  onClose, 
  isSubmitting 
}) {
  const [sessionData, setSessionData] = useState({
    status: 'present',
    notes: '',
    duration: '60'
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    
    try {
      await onSubmit(sessionData);
      // If successful, modal will be closed by parent
    } catch (err) {
      // Display error in modal instead of crashing
      console.log('Modal caught error:', err);
      console.log('Error message:', err.message);
      setError(err.message || err.toString() || 'Failed to record session');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Record Private Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fighter Name */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Fighter</p>
            <p className="text-lg font-semibold text-gray-900">{fighter.name}</p>
            <p className="text-sm text-gray-500">
              {fighter.sessionsLeft}/{fighter.totalSessionCount} sessions left
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error Recording Session</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={sessionData.duration}
              onChange={(e) => setSessionData({...sessionData, duration: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                sessionData.status === 'present' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="present"
                  checked={sessionData.status === 'present'}
                  onChange={(e) => setSessionData({...sessionData, status: e.target.value})}
                  className="sr-only"
                />
                <span className="font-medium">Attended</span>
              </label>
              
              <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                sessionData.status === 'absent' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="absent"
                  checked={sessionData.status === 'absent'}
                  onChange={(e) => setSessionData({...sessionData, status: e.target.value})}
                  className="sr-only"
                />
                <span className="font-medium">Absent</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={sessionData.notes}
              onChange={(e) => setSessionData({...sessionData, notes: e.target.value})}
              rows={3}
              placeholder="e.g., Worked on technique, great progress..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-6 py-3 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Record Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
