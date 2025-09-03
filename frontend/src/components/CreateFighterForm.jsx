import { useState, useEffect } from "react"
import { User, UserCheck, Calendar, Target } from "lucide-react"
import { useCoaches } from "../hooks/useCoaches"

export default function CreateFighterForm({ onSubmit, onCancel }) {
  const { coaches, loading: coachesLoading, error: coachesError } = useCoaches()
  const [formData, setFormData] = useState({
    name: "",
    coachId: "",
    totalSessionCount: 10,
    subscriptionStartDate: new Date().toISOString().split('T')[0], // Today's date
    subscriptionDurationMonths: 1 // Default to 1 month
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Prepare data for submission
      const fighterData = {
        ...formData,
        coachId: formData.coachId ? parseInt(formData.coachId) : null,
        totalSessionCount: parseInt(formData.totalSessionCount),
        subscriptionDurationMonths: parseInt(formData.subscriptionDurationMonths),
        subscriptionStartDate: new Date(formData.subscriptionStartDate).toISOString(), // Convert to full ISO DateTime
        sessionsLeft: parseInt(formData.totalSessionCount) // Start with full sessions
      }
      
      await onSubmit(fighterData)
    } catch (error) {
      console.error("Error creating fighter:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fighter Name */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4" />
          <span>Fighter Name</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          placeholder="Enter fighter's name"
        />
      </div>

      {/* Coach Selection */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <UserCheck className="w-4 h-4" />
          <span>Assign Coach</span>
        </label>
        <select
          name="coachId"
          value={formData.coachId}
          onChange={handleChange}
          disabled={coachesLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {coachesLoading ? "Loading coaches..." : "Select a coach"}
          </option>
          {!coachesLoading && !coachesError && coaches.map(coach => (
            <option key={coach.id} value={coach.id}>
              {coach.name}
            </option>
          ))}
        </select>
        {coachesError && (
          <p className="mt-1 text-sm text-red-600">
            Error loading coaches: {coachesError}
          </p>
        )}
      </div>

      {/* Session Count */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <Target className="w-4 h-4" />
          <span>Total Sessions</span>
        </label>
        <input
          type="number"
          name="totalSessionCount"
          value={formData.totalSessionCount}
          onChange={handleChange}
          min="1"
          max="100"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          placeholder="Number of sessions"
        />
      </div>

      {/* Subscription Start Date */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4" />
          <span>Subscription Start Date</span>
        </label>
        <input
          type="date"
          name="subscriptionStartDate"
          value={formData.subscriptionStartDate}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Subscription Duration */}
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4" />
          <span>Subscription Duration</span>
        </label>
        <select
          name="subscriptionDurationMonths"
          value={formData.subscriptionDurationMonths}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
        >
          <option value={1}>1 Month</option>
          <option value={2}>2 Months</option>
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
          <option value={12}>12 Months</option>
        </select>
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
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Fighter"}
        </button>
      </div>
    </form>
  )
}
