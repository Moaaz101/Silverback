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
  Users,
  Target
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { useCoaches } from "../hooks/useCoaches";
import { usePayments } from "../hooks/usePayments";
import { useFighters } from "../hooks/useFighters"; // Import the hook

export default function NewPaymentForm({ onClose, onPaymentCreated, currentAdmin }) {
  const { toast } = useToast();
  const { coaches } = useCoaches();
  const { createPayment } = usePayments();
  const { fighters, loading: fightersLoading, error: fightersError, refetch: refetchFighters } = useFighters(); // Use the hook
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFighters, setFilteredFighters] = useState([]);
  
  // Form state remains the same
  const [formData, setFormData] = useState({
    paymentType: 'new_signup',
    fighterId: '',
    amount: '',
    method: 'cash',
    sessionsAdded: 12,
    notes: '',
    createdBy: currentAdmin,
    
    fighterData: {
      name: '',
      phone: '',
      coachId: '',
      totalSessionCount: 10,
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      subscriptionDurationMonths: 1,
      subscriptionType: 'group'
    }
  });
  
  // Refetch fighters when payment type changes to existing fighter flows
  useEffect(() => {
    if (formData.paymentType !== 'new_signup') {
      refetchFighters();
    }
  }, [formData.paymentType, refetchFighters]);
  
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
    setStep(3);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let paymentData;
      
      if (formData.paymentType === 'new_signup') {
        paymentData = {
          paymentType: formData.paymentType,
          fighterData: {
            name: formData.fighterData.name,
            phone: formData.fighterData.phone?.trim() || null,
            coachId: formData.fighterData.coachId ? parseInt(formData.fighterData.coachId) : null,
            totalSessionCount: parseInt(formData.sessionsAdded),
            subscriptionDurationMonths: parseInt(formData.fighterData.subscriptionDurationMonths),
            subscriptionStartDate: new Date(formData.fighterData.subscriptionStartDate).toISOString(),
            subscriptionType: formData.fighterData.subscriptionType,
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
          subscriptionType: formData.paymentType === 'renewal' ? 
            formData.fighterData.subscriptionType : undefined,
          notes: formData.notes,
          createdBy: currentAdmin
        };
      }
      
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
              <p className="text-gray-600 text-sm">Register a new fighter</p>
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
              <p className="text-gray-600 text-sm">Renew an existing fighter</p>
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
              <p className="text-gray-600 text-sm">Add more sessions to a fighter</p>
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
  const renderNewFighterStep = () => {
    // Validate required fields before allowing to continue
    const canContinue = () => {
      return (
        formData.fighterData.name.trim() !== '' &&
        formData.fighterData.subscriptionStartDate !== ''
      );
    };

    return (
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
            Fighter Name <span className="text-red-500">*</span>
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
            Subscription Start Date <span className="text-red-500">*</span>
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
            Subscription Duration <span className="text-red-500">*</span>
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
      
      {/* Package Type Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Package Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.fighterData.subscriptionType === 'group' 
              ? 'border-[#492e51] bg-[#492e51]/10' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="subscriptionType"
              value="group"
              checked={formData.fighterData.subscriptionType === 'group'}
              onChange={handleFighterDataChange}
              className="sr-only"
            />
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-[#492e51]" />
              </div>
              <div className="font-semibold">Group Classes</div>
              <div className="text-xs text-gray-500 mt-1">Regular scheduled sessions</div>
            </div>
          </label>
          
          <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.fighterData.subscriptionType === 'private' 
              ? 'border-[#492e51] bg-[#492e51]/10' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="subscriptionType"
              value="private"
              checked={formData.fighterData.subscriptionType === 'private'}
              onChange={handleFighterDataChange}
              className="sr-only"
            />
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-8 h-8 text-[#492e51]" />
              </div>
              <div className="font-semibold">Private Sessions</div>
              <div className="text-xs text-gray-500 mt-1">1-on-1 with coach</div>
            </div>
          </label>
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
          disabled={!canContinue()}
          className="px-6 py-3 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </>
    );
  };
  
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
        {fightersLoading ? (
          <div className="p-6 text-center">
            <LoadingSpinner message="Loading fighters..." />
          </div>
        ) : fightersError ? (
          <div className="p-6 text-center text-red-500">
            Error loading fighters: {fightersError}
          </div>
        ) : filteredFighters.length === 0 ? (
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
        {/* Subscription Duration (only for renewals) */}
        {formData.paymentType === 'renewal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Duration <span className="text-red-500">*</span>
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
        )}

        {/* Package Type Selection (only for renewals) */}
        {formData.paymentType === 'renewal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Package Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.fighterData.subscriptionType === 'group' 
                  ? 'border-[#492e51] bg-[#492e51]/10' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="subscriptionType"
                  value="group"
                  checked={formData.fighterData.subscriptionType === 'group'}
                  onChange={handleFighterDataChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-[#492e51]" />
                  </div>
                  <div className="font-semibold">Group Classes</div>
                  <div className="text-xs text-gray-500 mt-1">Regular scheduled sessions</div>
                </div>
              </label>
              
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.fighterData.subscriptionType === 'private' 
                  ? 'border-[#492e51] bg-[#492e51]/10' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="subscriptionType"
                  value="private"
                  checked={formData.fighterData.subscriptionType === 'private'}
                  onChange={handleFighterDataChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-8 h-8 text-[#492e51]" />
                  </div>
                  <div className="font-semibold">Private Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">1-on-1 with coach</div>
                </div>
              </label>
            </div>
          </div>
        )}

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