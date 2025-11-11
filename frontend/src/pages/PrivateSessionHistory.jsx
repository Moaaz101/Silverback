import { useState, useEffect } from "react";
import { Calendar, Filter, User } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import { useToast } from "../contexts/ToastContext";
import { usePrivateSessions } from "../hooks/usePrivateSessions";
import { useCoaches } from "../hooks/useCoaches";

export default function PrivateSessionHistoryPage() {
  const { toast } = useToast();
  const { loading, error, fetchPrivateFighters, fetchPrivateSessionHistory } =
    usePrivateSessions();
  const { coaches } = useCoaches();

  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    fighterId: "",
    coachId: "",
    startDate: "",
    endDate: ""
    });
  const [fighters, setFighters] = useState([]);

  // Fetch private fighters for filter
  const loadPrivateFighters = async () => {
    try {
      const privateFighters = await fetchPrivateFighters();
      setFighters(privateFighters);
    } catch (err) {
      console.error("Error fetching fighters:", err);
    }
  };

  // Fetch private session history
  const loadSessions = async () => {
    try {
      const data = await fetchPrivateSessionHistory({
        fighterId: filters.fighterId || undefined,
        coachId: filters.coachId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: 100,
      });
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast.error("Failed to load session history");
    }
  };

  useEffect(() => {
    loadPrivateFighters();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fighterId, filters.coachId, filters.startDate, filters.endDate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && sessions.length === 0) {
    return <LoadingSpinner message="Loading session history..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} title="Error loading session history" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Private Session History
          </h1>
          <p className="text-gray-500 mt-1">
            View all recorded private training sessions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Fighter Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fighter
              </label>
              <select
                value={filters.fighterId}
                onChange={(e) =>
                  setFilters({ ...filters, fighterId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
              >
                <option value="">All Fighters</option>
                {fighters.map((fighter) => (
                  <option key={fighter.id} value={fighter.id}>
                    {fighter.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coach Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coach
              </label>
              <select
                value={filters.coachId}
                onChange={(e) =>
                  setFilters({ ...filters, coachId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
              >
                <option value="">All Coaches</option>
                {coaches && coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#492e51] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.fighterId || filters.coachId || filters.startDate || filters.endDate) && (
            <button
              onClick={() =>
                setFilters({ fighterId: "", coachId: "", startDate: "", endDate: "" })
              }
              className="mt-4 text-sm text-[#492e51] hover:text-[#5a3660] font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Sessions Found
              </h3>
              <p className="text-gray-500">
                {filters.fighterId || filters.coachId || filters.startDate || filters.endDate
                  ? "No sessions match your filters. Try adjusting your search criteria."
                  : "No private sessions have been recorded yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-9 gap-4 text-sm font-semibold text-gray-700">
                <div className="col-span-3">Date</div>
                <div className="col-span-4">Fighter</div>
                <div className="col-span-2">Coach</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-9 gap-4 items-center">
                    {/* Date */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(session.date)}
                        </span>
                      </div>
                    </div>

                    {/* Fighter */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {session.fighterName}
                        </p>
                      </div>
                    </div>

                    {/* Coach */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700">
                        {session.coachName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{sessions.length}</span>{" "}
                session{sessions.length !== 1 && "s"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
