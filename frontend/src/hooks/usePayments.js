import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../utils/utils';

export function usePayments(fighterId = null) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ total: 0, count: 0 });

  // Function to fetch payments data
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = fighterId 
        ? `http://localhost:4000/payments?fighterId=${fighterId}`
        : 'http://localhost:4000/payments';
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
      
      // Calculate summary statistics
      const total = data.reduce((sum, payment) => sum + payment.amount, 0);
      setSummary({
        total,
        count: data.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false);
    }
  }, [fighterId]);

  // Function to create a new payment
  const createPayment = useCallback(async (paymentData) => {
    try {
      const response = await fetch('http://localhost:4000/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
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
      const response = await fetch(`http://localhost:4000/payments/${paymentId}/receipt`, {
        headers: getAuthHeaders(),
      });
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
    summary,
    refetch: fetchPayments,
    createPayment,
    getPaymentReceipt
  };
}