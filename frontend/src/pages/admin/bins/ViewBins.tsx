import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../../components/MapView";
import SpotlightCard from "../../components/UIComponents/SpotlightCard";
import {Toaster} from "react-hot-toast";

interface Bin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  fill_level: number;
  status: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ViewBins = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "fill_level" | "created_at">("created_at");

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/bins`)
      .then(res => res.json())
      .then(data => {
        setBins(data.bins || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch bins", err);
        setLoading(false);
      });
  }, []);

  // Filter and sort bins
  const filteredBins = bins
    .filter(bin => {
      const matchesSearch = bin.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || bin.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "fill_level") return (b.fill_level || 0) - (a.fill_level || 0);
      if (sortBy === "created_at") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "maintenance":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "full":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "maintenance":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "full":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Loading bins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-0">
      <Toaster />
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 mb-4 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                All Bins
              </h1>
              <p className="text-white/60">Manage and monitor your e-waste bin network</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span className="text-sm font-semibold text-blue-400">{filteredBins.length} Bins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Search Bins</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <svg className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-4">
                <label className="block text-sm font-semibold text-white/80 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">All Status</option>
                  <option value="active" className="bg-gray-900">Active</option>
                  <option value="maintenance" className="bg-gray-900">Maintenance</option>
                  <option value="full" className="bg-gray-900">Full</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-white/80 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as "name" | "fill_level" | "created_at")}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="created_at" className="bg-gray-900">Newest First</option>
                  <option value="name" className="bg-gray-900">Name (A-Z)</option>
                  <option value="fill_level" className="bg-gray-900">Fill Level</option>
                </select>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Table Section */}
          <div>
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Bins List
                </h2>
              </div>

              <div className="overflow-x-auto">
                <div className="max-h-120 overflow-y-auto">
                {filteredBins.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-white/60 font-medium">No bins found</p>
                    <p className="text-white/40 text-sm mt-2">Try adjusting your filters</p>
                  </div>
                ) : (
                  <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-gray-900">
                          <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Bin</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Fill Level</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>

                    <tbody className="divide-y divide-white/5">
                      {filteredBins.map((bin) => (
                        <tr
                          key={bin.id}
                          className={`transition-all duration-200 hover:bg-white/5 ${
                            selectedBin?.id === bin.id ? "bg-blue-500/10 border-l-4 border-blue-500" : ""
                          }`}
                        >
                          {/* Bin Name & Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white truncate">{bin.name}</p>
                                <p className="text-xs text-white/50">Capacity: {bin.capacity}L</p>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(bin.status)}`}>
                              {getStatusIcon(bin.status)}
                              <span className="capitalize">{bin.status}</span>
                            </div>
                          </td>

                          {/* Fill Level */}
                          <td className="px-6 py-4">
                            <div className="min-w-30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-white">{bin.fill_level}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    bin.fill_level >= 90
                                      ? "bg-linear-to-r from-red-500 to-red-600"
                                      : bin.fill_level >= 60
                                      ? "bg-linear-to-r from-yellow-500 to-yellow-600"
                                      : "bg-linear-to-r from-green-500 to-green-600"
                                  }`}
                                  style={{ width: `${bin.fill_level}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedBin(bin)}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 group"
                                title="Show on Map"
                              >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => navigate(`/admin/bins/${bin.id}`)}
                                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all duration-200 group"
                                title="Edit Bin"
                              >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                // </div>  
                )}
              </div>
              </div>

              {filteredBins.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      Showing <span className="font-semibold text-white">{filteredBins.length}</span> of{" "}
                      <span className="font-semibold text-white">{bins.length}</span> bins
                    </span>
                    {selectedBin && (
                      <span className="text-blue-400 font-medium">
                        {selectedBin.name} selected
                      </span>
                    )}
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Map Section */}
          <div>
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {selectedBin ? "Selected Bin Location" : "All Bins Map"}
                </h2>

                {selectedBin && (
                  <button
                    onClick={() => setSelectedBin(null)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    Show All
                  </button>
                )}
              </div>

              {selectedBin && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white mb-1">{selectedBin.name}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getStatusColor(selectedBin.status)}`}>
                          {getStatusIcon(selectedBin.status)}
                          {selectedBin.status}
                        </span>
                        <span className="text-white/60">
                          {selectedBin.fill_level}% full
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '500px' }}>
                <MapView
                  bins={selectedBin ? [selectedBin] : filteredBins}
                  center={
                    selectedBin
                      ? [selectedBin.lat, selectedBin.lng]
                      : filteredBins.length > 0
                      ? [filteredBins[0].lat, filteredBins[0].lng]
                      : [25.26, 82.98]
                  }
                  zoom={selectedBin ? 16 : 13}
                  height="100%"
                  onMarkerClick={(bin) => setSelectedBin(bin as Bin)}
                />
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBins;