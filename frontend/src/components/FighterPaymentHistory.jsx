import { useToast } from '../contexts/ToastContext';
import { 
  Calendar, 
  DollarSign, 
  FileText,
  Plus
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { usePayments } from '../hooks/usePayments';

export default function FighterPaymentHistory({ fighterId }) {
  const { toast } = useToast();
  const { payments, loading, error, summary, refetch } = usePayments(fighterId);

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (loading) {
    return <LoadingSpinner message="Loading payment history..." />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
        <div className="bg-gradient-to-r from-[#492e51]/10 to-[#5a3660]/10 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-[#492e51]/20 rounded-full flex items-center justify-center mr-4">
              <DollarSign className="text-[#492e51] w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="text-2xl font-bold">{summary.total.toFixed(2)} EGP</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#492e51]/10 to-[#5a3660]/10 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-[#492e51]/20 rounded-full flex items-center justify-center mr-4">
              <Calendar className="text-[#492e51] w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Records</h3>
              <p className="text-2xl font-bold">{summary.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Records</h2>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Records</h3>
            <p className="text-gray-500 mb-6">This fighter has no recorded payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPaymentTypeLabel(payment.paymentType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      +{payment.sessionsAdded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.amount.toFixed(2)} EGP
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={`/payments/${payment.id}/receipt`} 
                        className="text-[#492e51] hover:text-[#5a3660]"
                      >
                        View Receipt
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <a
          href={`/payments`}
          className="flex items-center justify-center text-sm font-medium text-[#492e51] hover:text-[#5a3660] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record New Payment
        </a>
      </div>
    </div>
  );
}