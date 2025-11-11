import { User, Check } from "lucide-react";
import { getSubscriptionStatus } from "../utils/subscriptionStatus";

/**
 * Compact card component for displaying a private fighter with session info
 * Designed for mobile-first, minimal layout
 * @param {Object} props
 * @param {Object} props.fighter - Fighter data
 * @param {Function} props.onRecordSession - Callback when recording session
 */
export default function PrivateFighterCard({ fighter, onRecordSession }) {
  const status = getSubscriptionStatus(fighter);
  const isExpired = fighter.subscriptionStatus?.isExpired;

  return (
    <div className="bg-[#492e51] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{fighter.name}</h3>
              <p className="text-xs text-white/60 truncate">{fighter.coach?.name || 'No Coach'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end ml-2 flex-shrink-0">
            <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium ${status.bgClass} ${status.textClass} mb-1`}>
              {status.text}
            </span>
            <div className="text-right">
              <p className="text-white font-bold text-lg leading-none">{fighter.sessionsLeft}</p>
              <p className="text-white/60 text-xs">sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Body */}
      <div className="p-4 pt-3 space-y-3">
        {/* Minimal Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/60">Progress</span>
            <span className="text-xs text-white/80">{fighter.sessionsLeft}/{fighter.totalSessionCount}</span>
          </div>
          <div className="bg-white/20 rounded-full h-1.5">
            <div
              className="bg-white rounded-full h-1.5 transition-all duration-300"
              style={{
                width: `${Math.min((fighter.sessionsLeft / (fighter.totalSessionCount || 1)) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Compact Record Button */}
        <button
          onClick={() => onRecordSession(fighter)}
          disabled={isExpired}
          className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-lg transition-all duration-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm">Record Session</span>
        </button>
      </div>
    </div>
  );
}
