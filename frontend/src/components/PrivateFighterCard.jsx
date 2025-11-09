import { User, Check } from "lucide-react";
import { getSubscriptionStatus } from "../utils/subscriptionStatus";

/**
 * Card component for displaying a private fighter with session info
 * @param {Object} props
 * @param {Object} props.fighter - Fighter data
 * @param {Function} props.onRecordSession - Callback when recording session
 */
export default function PrivateFighterCard({ fighter, onRecordSession }) {
  const status = getSubscriptionStatus(fighter);
  const isExpired = fighter.subscriptionStatus?.isExpired;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Fighter Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{fighter.name}</h3>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}>
                {status.text}
              </span>
            </div>
            <p className="text-sm text-gray-500">{fighter.coach?.name || 'No Coach'}</p>
          </div>
        </div>
      </div>

      {/* Sessions Info */}
      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Sessions</span>
          <span className="text-lg font-bold text-purple-600">
            {fighter.sessionsLeft}/{fighter.totalSessionCount}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 bg-purple-200 rounded-full h-2">
          <div
            className="bg-purple-600 rounded-full h-2 transition-all duration-300"
            style={{
              width: `${Math.min((fighter.sessionsLeft / (fighter.totalSessionCount || 1)) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Record Button */}
      <button
        onClick={() => onRecordSession(fighter)}
        disabled={isExpired}
        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-4 py-3 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check className="w-5 h-5" />
        <span>Record Session</span>
      </button>
    </div>
  );
}
