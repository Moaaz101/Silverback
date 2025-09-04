import { useState } from 'react';
import { useCoaches } from '../hooks/useCoaches';
import { Save } from 'lucide-react';

export default function FighterEditForm({ 
  fighter, 
  onUpdate, 
  onCancel, 
  isSubmitting 
}) {
  const { coaches } = useCoaches();
  const [formData, setFormData] = useState({
    name: fighter?.name || '',
    phone: fighter?.phone || '',
    coachId: fighter?.coachId || '',
    subscriptionStartDate: fighter?.subscriptionStartDate ? 
      new Date(fighter.subscriptionStartDate).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
    subscriptionDurationMonths: fighter?.subscriptionDurationMonths || 1,
    sessionsLeft: fighter?.sessionsLeft || 0
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'coachId' && value ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedFighterData = {
      name: formData.name,
      phone: formData.phone,
      coachId: formData.coachId ? parseInt(formData.coachId) : null,
      subscriptionStartDate: new Date(formData.subscriptionStartDate).toISOString(),
      subscriptionDurationMonths: parseInt(formData.subscriptionDurationMonths),
      sessionsLeft: parseInt(formData.sessionsLeft)
    };
    
    onUpdate(updatedFighterData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Edit Fighter</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          type="button"
        >
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fighter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fighter Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          />
        </div>
        
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Coach Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Coach
          </label>
          <select
            name="coachId"
            value={formData.coachId || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          >
            <option value="">No Coach</option>
            {coaches && coaches.map(coach => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Subscription Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Start Date
          </label>
          <input
            type="date"
            name="subscriptionStartDate"
            value={formData.subscriptionStartDate}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Subscription Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Duration (Months)
          </label>
          <select
            name="subscriptionDurationMonths"
            value={formData.subscriptionDurationMonths}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          >
            <option value={1}>1 Month</option>
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>

        {/* Sessions Left */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sessions Left
          </label>
          <input
            type="number"
            name="sessionsLeft"
            value={formData.sessionsLeft}
            onChange={handleInputChange}
            min="0"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors font-medium flex items-center justify-center disabled:opacity-70"
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
