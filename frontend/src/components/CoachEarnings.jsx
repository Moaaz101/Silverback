import { useState } from 'react';
import { useCoachEarnings } from '../hooks/useCoachEarnings';
import { DollarSign, Users, BarChart2, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function CoachEarnings() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const { earnings, loading, error } = useCoachEarnings(month, year);

  const totalEarningsAllCoaches = earnings.reduce((sum, coach) => sum + coach.totalEarnings, 0);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Coach Earnings</h2>
          <p className="text-sm text-gray-500">Earnings summary for the selected period</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none transition-all"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading && <LoadingSpinner message="Calculating earnings..." />}
        {error && (
          <div className="text-center text-red-500 flex flex-col items-center gap-2">
            <AlertCircle />
            <span>Error: {error}</span>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="bg-gradient-to-r from-[#492e51]/10 to-[#5a3660]/10 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#492e51]/20 rounded-full flex items-center justify-center mr-4">
                  <DollarSign className="text-[#492e51] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Earnings (Selected Period)</h3>
                  <p className="text-3xl font-bold text-gray-800">${totalEarningsAllCoaches.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {earnings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earnings.map(coach => (
                  <div key={coach.coachId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-gray-800 mb-3">{coach.coachName}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-2"><DollarSign size={16} /> Total Earnings</span>
                        <span className="font-medium text-gray-900">${coach.totalEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-2"><Users size={16} /> Payments</span>
                        <span className="font-medium text-gray-900">{coach.paymentCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Earnings Data</h3>
                <p className="text-gray-500">No payments were recorded for any active coaches in this period.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}