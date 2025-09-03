import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Printer } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { usePayments } from "../hooks/usePayments"; // Import the hook

export default function PaymentReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const receiptRef = useRef(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getPaymentReceipt } = usePayments(); // Use the hook
  
  useEffect(() => {
    fetchReceipt();
  }, [id]);
  
  const fetchReceipt = async () => {
    try {
      setLoading(true);
      // Use the getPaymentReceipt function from the hook
      const data = await getPaymentReceipt(id);
      setReceipt(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(`Error loading receipt: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return <LoadingSpinner message="Loading receipt..." />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/payments')}
            className="mb-6 inline-flex items-center text-[#492e51] hover:text-[#5a3660] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Payments</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button 
              onClick={fetchReceipt}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/payments')}
            className="inline-flex items-center text-[#492e51] hover:text-[#5a3660] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Payments</span>
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              <span>Print</span>
            </button>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8" 
          id="receipt-content" 
          ref={receiptRef}
        >
          {receipt && (
            <div className="receipt">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">RECEIPT</h2>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Receipt Number</p>
                  <p className="font-medium text-gray-900">{receipt.receiptNumber}</p>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Date</p>
                    <p className="font-medium">{formatDate(receipt.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Payment Type</p>
                    <p className="font-medium">{getPaymentTypeLabel(receipt.paymentType)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Fighter</p>
                    <p className="font-medium">{receipt.fighter.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Payment Method</p>
                    <p className="font-medium capitalize">{receipt.paymentMethod}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="font-medium">Description</span>
                  <span className="font-medium">Amount</span>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div>
                    <p className="font-medium">
                      {getPaymentTypeLabel(receipt.paymentType)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {receipt.sessionsAdded} sessions
                    </p>
                  </div>
                  <span className="font-medium">${receipt.amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-4 mt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">${receipt.amount.toFixed(2)}</span>
                </div>
              </div>
              
              {receipt.notes && (
                <div className="mb-8">
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-gray-700">{receipt.notes}</p>
                </div>
              )}
              
              <div className="text-center text-gray-500 text-sm mt-16 border-t border-gray-200 pt-6">
                <p>Recorded by: {receipt.recordedBy}</p>
                <p className="mt-1">Silverback Gym Management</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}