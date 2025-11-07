import { useState } from "react"
import { UserCheck, Calendar, Clock, ChevronDown, ChevronUp, Users, Edit, Trash2 } from "lucide-react"

export default function CoachCard({ coach, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

const formatTime = (time24h) => {
  // If time is already in 12-hour format or invalid, return as is
  if (!time24h || !time24h.includes(':')) return time24h;
  
  try {
    // Parse hours and minutes from 24h format (e.g., "14:30")
    const [hours24, minutes] = time24h.split(':');
    const hours24Num = parseInt(hours24, 10);
    
    // Convert to 12-hour format
    const period = hours24Num >= 12 ? 'PM' : 'AM';
    const hours12 = hours24Num % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hours12}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time24h; // Return original format if parsing fails
  }
};

  const getScheduleCount = (schedules) => {
    return schedules ? schedules.length : 0
  }

  const scheduleCount = getScheduleCount(coach.schedules)

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
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{coach.name}</h2>
              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 bg-blue-500/20 text-blue-300">
                Coach
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Schedule Slots</p>
              <p className="text-white font-bold text-lg">{scheduleCount}</p>
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
          {/* Fighters Count */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Assigned Fighters</p>
              <p className="text-white font-medium">{coach.fighters?.length || 0} fighters</p>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white/80" />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-2">Weekly Schedule</p>
              {coach.schedules && coach.schedules.length > 0 ? (
                <div className="space-y-1">
                  {coach.schedules.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-1">
                      <span className="text-white/80 text-sm">{schedule.weekday}</span>
                      <span className="text-white text-sm font-medium">{formatTime(schedule.time)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">No schedule set</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(coach);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(coach);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
