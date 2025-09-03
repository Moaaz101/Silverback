import { useState, useEffect, useRef, useCallback } from 'react';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch payments data
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:4000/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to create a new payment
  const createPayment = useCallback(async (paymentData) => {
    try {
      const response = await fetch('http://localhost:4000/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const newPayment = await response.json();
      await fetchPayments(); // Refresh the payments list
      return newPayment;
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err; // Let the component handle this error
    }
  }, [fetchPayments]);

  // Function to get a specific payment receipt
  const getPaymentReceipt = useCallback(async (paymentId) => {
    try {
      const response = await fetch(`http://localhost:4000/payments/${paymentId}/receipt`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment receipt');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching payment receipt:', err);
      throw err; // Let the component handle this error
    }
  }, []);

  // Fetch payments on initial load
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Return everything needed by components using this hook
  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    createPayment,
    getPaymentReceipt
  };
}