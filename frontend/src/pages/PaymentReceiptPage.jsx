import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Printer } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { usePayments } from "../hooks/usePayments";
import silverbackLogo from "../assets/SilverbackLogo.png";

export default function PaymentReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const receiptRef = useRef(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getPaymentReceipt } = usePayments();

  useEffect(() => {
    fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
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
    const printContent = document
      .getElementById("receipt-content")
      .cloneNode(true);

    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Build the HTML content
    iframeDoc.open();
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Receipt - Silverback Gym</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 30px;
            background: white;
            color: black;
          }
          
          .receipt {
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1, h2 {
            color: #492e51;
          }
          
          .border-b {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .border-t {
            border-top: 1px solid #e5e7eb;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          
          .flex {
            display: flex;
          }
          
          .justify-between {
            justify-content: space-between;
          }
          
          .items-center {
            align-items: center;
          }
          
          .flex-col {
            flex-direction: column;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-8 { margin-bottom: 2rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-4 { margin-top: 1rem; }
          .mt-16 { margin-top: 4rem; }
          
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
          .pb-6 { padding-bottom: 1.5rem; }
          .pt-6 { padding-top: 1.5rem; }
          
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .text-xl { font-size: 1.25rem; }
          .text-2xl { font-size: 1.5rem; }
          
          .font-medium { font-weight: 500; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          
          .text-gray-500 { color: #6b7280; }
          .text-gray-700 { color: #374151; }
          .text-gray-900 { color: #111827; }
          
          .h-20 {
            height: 5rem;
          }
          
          .w-auto {
            width: auto;
          }
          
          img {
            max-width: 30%;
            height: auto;
          }
          
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
            
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for content and images to load
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      }, 250);
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentTypeLabel = (type) => {
    const types = {
      new_signup: "New Signup",
      renewal: "Subscription Renewal",
      top_up: "Session Top-Up",
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
            onClick={() => navigate("/payments")}
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
            onClick={() => navigate("/payments")}
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
              {/* Header with Logo */}
              <div className="flex flex-col items-center mb-8 border-b border-gray-200 pb-6">
                <img
                  src={silverbackLogo}
                  alt="Silverback Gym"
                  className="h-40 w-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-[#492e51] mb-1">
                  Silverback Gym
                </h1>
                <p className="text-gray-500 text-sm">
                  Premium Fitness & Training
                </p>
              </div>

              {/* Receipt Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">RECEIPT</h2>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Receipt Number</p>
                  <p className="font-medium text-gray-900">
                    {receipt.receiptNumber}
                  </p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Date</p>
                    <p className="font-medium">{formatDate(receipt.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Payment Type</p>
                    <p className="font-medium">
                      {getPaymentTypeLabel(receipt.paymentType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Fighter</p>
                    <p className="font-medium">{receipt.fighter.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Subscription Type</p>
                    <p className="font-medium capitalize">
                      {receipt.fighter.subscriptionType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Payment Method</p>
                    <p className="font-medium capitalize">
                      {receipt.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
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
                  <span className="font-medium">
                    {receipt.amount.toFixed(2)} EGP
                  </span>
                </div>

                <div className="flex justify-between items-center py-4 mt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">
                    {receipt.amount.toFixed(2)} EGP
                  </span>
                </div>
              </div>

              {/* Notes */}
              {receipt.notes && (
                <div className="mb-8">
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-gray-700">{receipt.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm mt-16 border-t border-gray-200 pt-6">
                <p>Recorded by: {receipt.recordedBy}</p>
                <p className="mt-1">Silverback Gym Management System</p>
                <p className="mt-2 text-xs">Thank you for your business!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
