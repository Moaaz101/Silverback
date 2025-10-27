import { useState, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { useAttendance } from "../hooks/useAttendance";

const AttendanceStatusBadge = ({ status }) => {
  const statusStyles = {
    present: "bg-green-100 text-green-800 border-green-200",
    late: "bg-yellow-100 text-yellow-800 border-yellow-200",
    absent: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${
        statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function FighterAttendanceHistory({ fighterId }) {
  const { loading, error: hookError, getAttendanceHistory } = useAttendance();
  const [attendanceData, setAttendanceData] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fighterId, dateRange.startDate, dateRange.endDate]);

  const fetchAttendanceHistory = async () => {
    if (!fighterId) return;

    setLocalError(null);

    try {
      const data = await getAttendanceHistory(
        fighterId,
        dateRange.startDate || null,
        dateRange.endDate || null
      );
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setLocalError(err.message);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const resetDateRange = () => {
    setDateRange({ startDate: "", endDate: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";

    try {
      // The date comes as ISO string (e.g., "2025-10-20T00:00:00.000Z")
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      // Format the date
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC", // Use UTC to prevent timezone shift
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  const error = hookError || localError;

  if (loading && !attendanceData) {
    return <LoadingSpinner message="Loading attendance history..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>Error loading attendance history: {error}</p>
      </div>
    );
  }

  if (!attendanceData) {
    return null;
  }

  const { fighter, attendance, summary } = attendanceData;

  // Calculate attendance rate
  const attendanceRate =
    summary.totalRecords > 0
      ? Math.round(
          ((summary.present + summary.late) / summary.totalRecords) * 100
        )
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] px-6 py-4 text-white">
        <h2 className="text-xl font-semibold">Attendance History</h2>
      </div>

      {/* Date Filter */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#492e51] focus:border-[#492e51]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#492e51] focus:border-[#492e51]"
            />
          </div>
          <div className="mt-2 md:mt-0 md:ml-2">
            <button
              onClick={resetDateRange}
              disabled={loading}
              className="w-full md:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
        <div className="text-center p-3 bg-[#f8f4f9] rounded-lg">
          <div className="text-lg font-bold text-[#5a3660]">
            {summary.totalRecords}
          </div>
          <div className="text-sm text-gray-500">Total Classes</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-700">
            {summary.present}
          </div>
          <div className="text-sm text-gray-500">Present</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-700">
            {summary.late}
          </div>
          <div className="text-sm text-gray-500">Late</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-700">{summary.absent}</div>
          <div className="text-sm text-gray-500">Absent</div>
        </div>
      </div>

      {/* Attendance Progress */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Attendance Rate
          </span>
          <span className="text-sm font-semibold">{attendanceRate}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#492e51] to-[#5a3660]"
            style={{ width: `${attendanceRate}%` }}
          ></div>
        </div>
      </div>

      {/* Header for Attendance Records */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <h3 className="font-medium">Attendance Details</h3>
      </div>

      {/* Attendance Records */}
      {loading && attendanceData ? (
        <div className="px-6 py-8 text-center">
          <LoadingSpinner message="Updating attendance history..." />
        </div>
      ) : attendance.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex justify-center items-center p-4 bg-gray-100 rounded-full mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">
            No attendance records found for the selected period.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {attendance
            .slice(0, showAllRecords ? undefined : 10)
            .map((record) => {
              console.log(
                "Record date:",
                record.date,
                "Type:",
                typeof record.date
              ); // Add this line to debug
              return (
                <div key={record.id} className="px-6 py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{formatDate(record.date)}</p>
                      <p className="text-sm text-gray-500">
                        Coach: {record.coachName || "Not assigned"}
                      </p>
                    </div>
                    <AttendanceStatusBadge status={record.status} />
                  </div>
                  {record.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Notes: </span>
                      {record.notes}
                    </div>
                  )}
                </div>
              );
            })}

          {!showAllRecords && attendance.length > 10 && (
            <div className="px-6 py-4 text-center">
              <button
                onClick={() => setShowAllRecords(true)}
                className="text-sm text-[#5a3660] hover:text-[#492e51] font-medium flex items-center justify-center mx-auto"
              >
                <span>Show {attendance.length - 10} more records</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
