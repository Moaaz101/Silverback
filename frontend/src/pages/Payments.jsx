import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Plus,
  FileText,
  Trash2,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import NewPaymentForm from "../components/NewPaymentForm";
import Modal from "../components/Modal";
import { usePayments } from "../hooks/usePayments";
import CoachEarnings from "../components/CoachEarnings";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";


export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { payments, loading, error, refetch, deletePayment } = usePayments();
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  // Reset state when refresh is triggered from navbar
  useEffect(() => {
    if (location.state?.refresh) {
      setShowNewPaymentForm(false);
      setShowDeleteModal(false);
      setSelectedPayment(null);
    }
  }, [location.state?.refresh]);

  // Handle delete payment
  const handleDeleteClick = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    try {
      await deletePayment(selectedPayment.id);
      toast.success(`Payment ${selectedPayment.receiptNumber || `#${selectedPayment.id}`} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedPayment(null);
    } catch (error) {
      toast.error(`Failed to delete payment: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
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
            className="flex items-center space-x-2 bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white px-8 py-3.5 rounded-lg hover:from-[#5a3660] hover:to-[#6b4170] transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl border-2 border-white/30 whitespace-nowrap transform hover:scale-105 active:scale-100 ring-2 ring-[#492e51]/30 ring-offset-2"
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
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => navigate(`/payments/${payment.id}/receipt`)}
                            className="text-[#492e51] hover:text-[#5a3660] font-medium"
                          >
                            View Receipt
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(payment)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPayment(null);
          }}
          title="Delete Payment"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> This action cannot be undone. The payment record and receipt will be permanently deleted.
              </p>
            </div>

            {selectedPayment && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt:</span>
                  <span className="font-medium">{selectedPayment.receiptNumber || `#${selectedPayment.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fighter:</span>
                  <span className="font-medium">{selectedPayment.fighter?.name || selectedPayment.fighterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{selectedPayment.amount.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{getPaymentTypeLabel(selectedPayment.paymentType)}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayment(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Payment'
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
        </div>
      )}
    </div>
  );
}