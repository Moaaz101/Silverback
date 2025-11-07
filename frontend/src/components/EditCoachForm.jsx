import { useState } from "react"
import { UserCheck, Calendar, Clock, Plus, Trash2 } from "lucide-react"

export default function EditCoachForm({ coach, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: coach.name || "",
    weeklySchedule: coach.schedules?.length > 0 
      ? coach.schedules.map(s => ({
          dayOfWeek: s.weekday,
          time: s.time
        }))
      : [{ dayOfWeek: "Monday", time: "18:00" }]
  })

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: [
        ...prev.weeklySchedule,
        { dayOfWeek: "Monday", time: "18:00" }
      ]
    }))
  }

  const removeScheduleSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.filter((_, i) => i !== index)
    }))
  }

  const updateScheduleSlot = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Coach Name */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <UserCheck className="w-4 h-4" />
          <span>Coach Name</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          placeholder="Enter coach's name"
        />
      </div>

      {/* Weekly Schedule */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Weekly Schedule</span>
        </label>
        
        <div className="space-y-3">
          {formData.weeklySchedule.map((slot, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-gray-400" />
              
              <select
                value={slot.dayOfWeek}
                onChange={(e) => updateScheduleSlot(index, 'dayOfWeek', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <input
                type="time"
                value={slot.time}
                onChange={(e) => updateScheduleSlot(index, 'time', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
              />

              {formData.weeklySchedule.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeScheduleSlot(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addScheduleSlot}
          className="mt-3 flex items-center space-x-2 text-[#492e51] hover:bg-[#492e51]/5 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule Slot</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Coach"}
        </button>
      </div>
    </form>
  )
}
