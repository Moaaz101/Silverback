import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Plus,
  FileText,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import NewPaymentForm from "../components/NewPaymentForm";
import { usePayments } from "../hooks/usePayments";
import CoachEarnings from "../components/CoachEarnings";
import { useAuth } from "../contexts/AuthContext";


export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { payments, loading, error, refetch } = usePayments();
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const { user } = useAuth();

  // Reset state when refresh is triggered from navbar
  useEffect(() => {
    if (location.state?.refresh) {
      setShowNewPaymentForm(false);
    }
  }, [location.state?.refresh]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get payment type display name
  const getPaymentTypeLabel = (type) => {
    const types = {
      'new_signup': 'New Signup',
      'renewal': 'Subscription Renewal',
      'top_up': 'Session Top-Up'
    };
    return types[type] || type;
  };

  // Wrap everything in a div with the refresh key
  return (
    <div key={location.state?.refresh}>
      {loading && !showNewPaymentForm ? (
        <LoadingSpinner message="Loading payments..." />
      ) : showNewPaymentForm ? (
        <NewPaymentForm 
          onClose={() => setShowNewPaymentForm(false)}
          onPaymentCreated={() => {
            setShowNewPaymentForm(false);
            refetch();
          }}
          currentAdmin={user.username}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
          </div>
          <button
            onClick={() => setShowNewPaymentForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-6 py-3 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-medium shadow-lg hover:shadow-xl border border-[#5a3660]/20"
          >
            <CreditCard className="w-5 h-5" />
            <span>New Payment</span>
          </button>
        </div>

        <CoachEarnings />
        
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Payments</h2>
          </div>
          
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-500">Error: {error}</p>
              <button 
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          
          {!error && payments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-500 mb-6">Record your first payment to get started</p>
              <button
                onClick={() => setShowNewPaymentForm(true)}
                className="px-4 py-2 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fighter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.receiptNumber || `RCP-${payment.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.fighter?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentTypeLabel(payment.paymentType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount.toFixed(2)} EGP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => navigate(`/payments/${payment.id}/receipt`)}
                          className="text-[#492e51] hover:text-[#5a3660]"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
}