import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  ChevronLeft } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

// Receipt page component
export function PaymentReceipt() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // TODO: Implement actual receipt logic using the payment/:id/receipt endpoint
  
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
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Receipt</h2>
          
          {/* Receipt content will go here */}
          <div className="text-center py-12">
            <p className="text-gray-500">Receipt page not yet implemented</p>
            <button
              onClick={() => navigate('/payments')}
              className="mt-4 px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}