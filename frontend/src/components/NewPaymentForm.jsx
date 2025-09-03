import { useState, useEffect } from "react";
import {
  CreditCard,
  User,
  UserPlus,
  RefreshCw,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { useCoaches } from "../hooks/useCoaches";
import { usePayments } from "../hooks/usePayments"; // Import the hook

export default function NewPaymentForm({ onClose, onPaymentCreated, currentAdmin }) {
  const { toast } = useToast();
  const { coaches } = useCoaches();
  const { createPayment } = usePayments(); // Use the hook
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fighters, setFighters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFighters, setFilteredFighters] = useState([]);
  
  // Form state remains the same
  const [formData, setFormData] = useState({
    paymentType: 'new_signup', // Default to new signup
    fighterId: '',
    amount: '',
    method: 'cash', // Default to cash
    sessionsAdded: 12, // Default
    notes: '',
    createdBy: currentAdmin,
    
    // For new fighter creation
    fighterData: {
      name: '',
      phone: '',
      coachId: '',
      totalSessionCount: 10,
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      subscriptionDurationMonths: 1
    }
  });
  
  // Fetch fighters for selection on existing fighter flows
  useEffect(() => {
    if (formData.paymentType !== 'new_signup') {
      fetchFighters();
    }
  }, [formData.paymentType]);
  
  // Filter fighters based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFighters(fighters);
    } else {
      const filtered = fighters.filter(fighter => 
        fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFighters(filtered);
    }
  }, [searchTerm, fighters]);
  
  const fetchFighters = async () => {
    try {
      const response = await fetch('http://localhost:4000/fighters');
      if (!response.ok) {
        throw new Error('Failed to fetch fighters');
      }
      const data = await response.json();
      setFighters(data);
      setFilteredFighters(data);
    } catch (err) {
      toast.error(`Error loading fighters: ${err.message}`);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFighterDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      fighterData: {
        ...prev.fighterData,
        [name]: value
      }
    }));
  };
  
  const handleSelectFighter = (fighterId) => {
    setFormData(prev => ({
      ...prev,
      fighterId
    }));
    setStep(3); // Move to payment details after fighter selection
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare the data based on payment type
      let paymentData;
      
      if (formData.paymentType === 'new_signup') {
        paymentData = {
          paymentType: formData.paymentType,
          fighterData: {
            ...formData.fighterData,
            coachId: formData.fighterData.coachId || null,
            totalSessionCount: parseInt(formData.sessionsAdded),
            subscriptionDurationMonths: parseInt(formData.fighterData.subscriptionDurationMonths),
            subscriptionStartDate: new Date(formData.fighterData.subscriptionStartDate).toISOString(),
            sessionsLeft: parseInt(formData.sessionsAdded)
          },
          amount: parseFloat(formData.amount),
          method: formData.method,
          sessionsAdded: parseInt(formData.sessionsAdded),
          notes: formData.notes,
          createdBy: currentAdmin
        };
      } else {
        paymentData = {
          paymentType: formData.paymentType,
          fighterId: parseInt(formData.fighterId),
          amount: parseFloat(formData.amount),
          method: formData.method,
          sessionsAdded: parseInt(formData.sessionsAdded),
          subscriptionDurationMonths: formData.paymentType === 'renewal' ? 
            parseInt(formData.fighterData.subscriptionDurationMonths) : undefined,
          notes: formData.notes,
          createdBy: currentAdmin
        };
      }
      
      // Use the createPayment function from the hook
      const payment = await createPayment(paymentData);
      
      toast.success('Payment recorded successfully!');
      onPaymentCreated(payment);
      
    } catch (err) {
      console.error('Error creating payment:', err);
      toast.error(`Failed to record payment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render different steps based on current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderPaymentTypeStep();
      case 2:
        return formData.paymentType === 'new_signup' 
          ? renderNewFighterStep() 
          : renderExistingFighterStep();
      case 3:
        return renderPaymentDetailsStep();
      default:
        return renderPaymentTypeStep();
    }
  };
  
  // Step 1: Select payment type
  const renderPaymentTypeStep = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Record New Payment</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div 
          className={`p-6 border rounded-xl cursor-pointer transition-all ${
            formData.paymentType === 'new_signup' 
              ? 'border-[#492e51] bg-[#492e51]/5 ring-1 ring-[#492e51]' 
              : 'border-gray-200 hover:border-[#492e51]/50'
          }`}
          onClick={() => {
            setFormData(prev => ({ ...prev, paymentType: 'new_signup' }));
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#492e51]/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-[#492e51]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">New Signup</h3>
              <p className="text-gray-600 text-sm">Register a new fighter with initial payment</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`p-6 border rounded-xl cursor-pointer transition-all ${
            formData.paymentType === 'renewal' 
              ? 'border-[#492e51] bg-[#492e51]/5 ring-1 ring-[#492e51]' 
              : 'border-gray-200 hover:border-[#492e51]/50'
          }`}
          onClick={() => {
            setFormData(prev => ({ ...prev, paymentType: 'renewal' }));
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#492e51]/10 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#492e51]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Subscription Renewal</h3>
              <p className="text-gray-600 text-sm">Renew an existing fighter's subscription</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`p-6 border rounded-xl cursor-pointer transition-all ${
            formData.paymentType === 'top_up' 
              ? 'border-[#492e51] bg-[#492e51]/5 ring-1 ring-[#492e51]' 
              : 'border-gray-200 hover:border-[#492e51]/50'
          }`}
          onClick={() => {
            setFormData(prev => ({ ...prev, paymentType: 'top_up' }));
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#492e51]/10 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-[#492e51]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Add Sessions</h3>
              <p className="text-gray-600 text-sm">Add more sessions to an existing fighter</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-6 py-3 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors font-medium flex items-center"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </>
  );
  
  // Step 2A: New Fighter Information
  const renderNewFighterStep = () => (
    <>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <button 
          type="button" 
          onClick={() => setStep(1)}
          className="flex items-center hover:text-[#492e51]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Payment Type
        </button>
        <span>›</span>
        <span className="font-medium text-gray-900">Fighter Information</span>
        <span>›</span>
        <span className="text-gray-400">Payment Details</span>
      </div>
    
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Fighter Information</h2>
      
      <div className="space-y-6">
        {/* Fighter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fighter Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.fighterData.name}
            onChange={handleFighterDataChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
            placeholder="Enter fighter's name"
          />
        </div>
        
        {/* Fighter Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.fighterData.phone}
            onChange={handleFighterDataChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
            placeholder="Enter fighter's phone"
          />
        </div>

        {/* Coach Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Coach (Optional)
          </label>
          <select
            name="coachId"
            value={formData.fighterData.coachId}
            onChange={handleFighterDataChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          >
            <option value="">Select a coach</option>
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
            value={formData.fighterData.subscriptionStartDate}
            onChange={handleFighterDataChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Subscription Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Duration
          </label>
          <select
            name="subscriptionDurationMonths"
            value={formData.fighterData.subscriptionDurationMonths}
            onChange={handleFighterDataChange}
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
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="px-6 py-3 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors font-medium flex items-center"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </>
  );
  
  // Step 2B: Select Existing Fighter
  const renderExistingFighterStep = () => (
    <>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <button 
          type="button" 
          onClick={() => setStep(1)}
          className="flex items-center hover:text-[#492e51]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Payment Type
        </button>
        <span>›</span>
        <span className="font-medium text-gray-900">Select Fighter</span>
        <span>›</span>
        <span className="text-gray-400">Payment Details</span>
      </div>
    
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Fighter</h2>
      
      {/* Search box */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search fighters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
      
      {/* Fighters list */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredFighters.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No fighters found. Please try a different search term.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredFighters.map(fighter => (
              <li 
                key={fighter.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectFighter(fighter.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{fighter.name}</h3>
                    <p className="text-sm text-gray-500">
                      {fighter.sessionsLeft} sessions left
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          <span>Back</span>
        </button>
      </div>
    </>
  );
  
  // Step 3: Payment Details
  const renderPaymentDetailsStep = () => (
    <>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <button 
          type="button" 
          onClick={() => setStep(1)}
          className="flex items-center hover:text-[#492e51]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Payment Type
        </button>
        <span>›</span>
        <button 
          type="button" 
          onClick={() => setStep(2)}
          className="flex items-center hover:text-[#492e51]"
        >
          {formData.paymentType === 'new_signup' ? 'Fighter Information' : 'Select Fighter'}
        </button>
        <span>›</span>
        <span className="font-medium text-gray-900">Payment Details</span>
      </div>
    
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sessions {formData.paymentType === 'top_up' ? 'to Add' : 'Included'}
          </label>
          <input
            type="number"
            name="sessionsAdded"
            value={formData.sessionsAdded}
            onChange={handleChange}
            min="1"
            max="100"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
            placeholder="Number of sessions"
          />
        </div>
        
        {/* Payment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
        
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                formData.method === 'cash'
                  ? 'border-[#492e51] bg-[#492e51]/5 ring-1 ring-[#492e51]'
                  : 'border-gray-200 hover:border-[#492e51]/50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, method: 'cash' }))}
            >
              <span className="font-medium">Cash</span>
            </div>
            <div
              className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                formData.method === 'bank_transfer'
                  ? 'border-[#492e51] bg-[#492e51]/5 ring-1 ring-[#492e51]'
                  : 'border-gray-200 hover:border-[#492e51]/50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, method: 'bank_transfer' }))}
            >
              <span className="font-medium">Bank Transfer</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
            placeholder="Add any additional notes..."
          />
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors font-medium flex items-center disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Processing...' : 'Complete Payment'}</span>
            {!isSubmitting && <CreditCard className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </form>
    </>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {renderStep()}
      </div>
    </div>
  );
}