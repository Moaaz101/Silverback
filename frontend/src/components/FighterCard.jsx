import { useState } from "react"
import { User, Calendar, Target, UserCheck, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

export default function FighterCard({ fighter }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusInfo = (fighter) => {
    const status = fighter.subscriptionStatus;
    
    // If we don't have subscription status yet, fall back to sessions only
    if (!status) {
      if (fighter.sessionsLeft > 5) {
        return { className: "bg-green-500/20 text-green-300", text: "Active" };
      } else if (fighter.sessionsLeft > 0) {
        return { className: "bg-yellow-500/20 text-yellow-300", text: "Low Sessions" };
      } else {
        return { className: "bg-red-500/20 text-red-300", text: "Expired" };
      }
    }
    
    // Check dual expiration system
    if (status.isExpired) {
      return {
        className: "bg-red-500/20 text-red-300",
        text: "Expired"
      };
    } else if (status.isExpiringSoon) {
      return {
        className: "bg-orange-500/20 text-orange-300",
        text: `Expiring Soon`
      };
    } else if (fighter.sessionsLeft <= 5 && fighter.sessionsLeft > 0) {
      return {
        className: "bg-yellow-500/20 text-yellow-300",
        text: "Low Sessions"
      };
    } else {
      return {
        className: "bg-green-500/20 text-green-300",
        text: "Active"
      };
    }
  }
  
  const formatExpirationDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const status = getStatusInfo(fighter)
  
  // Get package type badge
  const packageBadge = fighter.subscriptionType === 'private' 
    ? { text: 'Private', className: 'bg-purple-500/30 text-purple-200' }
    : { text: 'Class', className: 'bg-blue-500/30 text-blue-200' };

  return (
    <div 
      className="bg-[#492e51] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
      style={{ gridRow: 'span 1', alignSelf: 'start' }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header - Always Visible */}
      <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{fighter.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                  {status.text}
                </span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${packageBadge.className}`}>
                  {packageBadge.text}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Sessions</p>
              <p className="text-white font-bold text-lg">{fighter.sessionsLeft}</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        {/* Card Body */}
        <div className="p-6 pt-4 space-y-4">
          {/* Coach Information */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Coach</p>
              <p className="text-white font-medium">{fighter.coach?.name || "Unassigned"}</p>
            </div>
          </div>

          {/* Sessions Progress Bar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white/80" />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Sessions</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${Math.min((fighter.sessionsLeft / (fighter.totalSessionCount || 1)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-white/80 text-sm">{fighter.sessionsLeft}/{fighter.totalSessionCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Subscription Date */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Subscription Start</p>
              <p className="text-white font-medium">
                {new Date(fighter.subscriptionStartDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Subscription Duration */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Subscription Duration</p>
              <p className="text-white font-medium">
                {fighter.subscriptionDurationMonths} {fighter.subscriptionDurationMonths === 1 ? 'Month' : 'Months'}
              </p>
            </div>
          </div>
          
          {/* Expiration Date & Status */}
          {fighter.subscriptionStatus && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white/80" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Expiration</p>
                <p className="text-white font-medium">
                  {formatExpirationDate(fighter.subscriptionStatus.expirationDate)}
                </p>
                {fighter.subscriptionStatus.isExpired ? (
                  <p className="text-red-300 text-xs mt-1">
                    {fighter.subscriptionStatus.expirationReason === 'sessions' 
                      ? 'No sessions remaining' 
                      : `Expired past due - ${fighter.sessionsLeft} unused sessions`}
                  </p>
                ) : fighter.subscriptionStatus.isExpiringSoon ? (
                  <p className="text-orange-300 text-xs mt-1">
                    {fighter.subscriptionStatus.daysRemaining} days remaining
                  </p>
                ) : (
                  <p className="text-green-300 text-xs mt-1">
                    {fighter.subscriptionStatus.daysRemaining} days remaining
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* View Profile Button */}
          <Link 
            to={`/fighters/${fighter.id}`}
            className="mt-2 flex items-center justify-center px-4 py-2 w-full bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking this button
          >
            <ExternalLink size={16} className="mr-2" />
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
