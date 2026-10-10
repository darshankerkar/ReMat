import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";
import { type Bin } from "../../types";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import toast, {Toaster} from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const AdminDashboard = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [bins, setBins] = useState<Bin[]>([]);
  const [loadingBins, setLoadingBins] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    active: true,
    maintenance: true,
    full: true
  });

  /* -----------------------------
     Fetch bins
  ------------------------------ */
  useEffect(() => {
    fetch(`${API_BASE}/api/bins`)
      .then(res => res.json())
      .then(data => {
        setBins(data.bins || []);
        setLoadingBins(false);
      })
      .catch(err => {
        console.error("Failed to fetch bins", err);
        setLoadingBins(false);
      });
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-lg font-medium">Setting up your account…</div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully")
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Failed to logout!")
    }
  };

  const totalBins = bins.length;
  const activeBins = bins.filter(b => b.status === "active");
  const maintenanceBins = bins.filter(b => b.status === "maintenance");
  const fullBins = bins.filter(b => b.status === "full" || (b.fill_level ?? 0) >= 90);

  const filteredBins = bins.filter(bin => {
    if (filters.full && (bin.status === "full" || (bin.fill_level ?? 0) >= 90)) return true;
    if (filters.active && bin.status === "active" && (bin.fill_level ?? 0) < 90) return true;
    if (filters.maintenance && bin.status === "maintenance") return true;
    return false;
  });

  // Calculate average fill level
  const totalCapacity = bins.reduce((sum, b) => sum + (b.capacity || 0), 0);
  const totalFillLevel = bins.reduce((sum, b) => sum + (b.fill_level || 0), 0);
  const avgFillPercentage = totalCapacity > 0 ? Math.round((totalFillLevel / totalCapacity) * 100) : 0;

  return (
    <div className="min-h-screen pb-0">
      <Toaster />
      {/* Main Content */}
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    Admin Dashboard 🛠️
                  </h1>
                  <p className="text-base text-white/60">Monitor and manage your e-waste bin network</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-red-600/10 hover:bg-red-500/20 border border-red-800/30 hover:border-red-500/50 text-red-500 hover:text-red-600 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 group"
                  >
                    <svg className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Bins Card */}
          <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group ">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Total Bins</p>
            <p className="text-3xl font-bold text-white">{totalBins}</p>
          </SpotlightCard>

          {/* Active Bins Card */}
          <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group hover:cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Active Bins</p>
            <p className="text-3xl font-bold text-white">{activeBins.length}</p>
          </SpotlightCard>

          {/* Full Bins Card */}
          <SpotlightCard className="bg-linear-to-br from-red-500/10 to-red-600/5 backdrop-blur-xl border border-red-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 group hover:cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              {fullBins.length > 0 && (
                <span className="text-xs font-semibold text-red-400 bg-red-500/20 px-3 py-1 rounded-full">
                  Needs Attention
                </span>
              )}
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Full Bins</p>
            <p className="text-3xl font-bold text-white">{fullBins.length}</p>
          </SpotlightCard>

          {/* Maintenance Bins Card */}
          <SpotlightCard className="bg-linear-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group hover:cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Under Maintenance</p>
            <p className="text-3xl font-bold text-white">{maintenanceBins.length}</p>
          </SpotlightCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <SpotlightCard 
            className="bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4" onClick={() => navigate("/admin/bins/add")}>
              <div className="p-4 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Add New Bin</h3>
                <p className="text-sm text-white/60">Deploy a new e-waste bin</p>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </SpotlightCard>

          <SpotlightCard 
            className="bg-linear-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group"
            // onClick={() => navigate("/admin/bins")}
          >
            <div className="flex items-center gap-4" onClick={() => navigate("/admin/bins")}>
              <div className="p-4 bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">View All Bins</h3>
                <p className="text-sm text-white/60">Manage existing bins</p>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </SpotlightCard>

          <SpotlightCard 
            className="bg-linear-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4" onClick={() => navigate("/admin/route")}>
              <div className="p-4 bg-orange-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Pickup Route</h3>
                <p className="text-sm text-white/60">Plan collection routes</p>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </SpotlightCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Filters & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map Filters */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Map Filters
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full group-hover:scale-110 transition-transform"></div>
                    <span className="text-white font-medium">Active Bins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.active}
                    onChange={() => setFilters({ ...filters, active: !filters.active })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-2 focus:ring-green-500/50 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full group-hover:scale-110 transition-transform"></div>
                    <span className="text-white font-medium">Maintenance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.maintenance}
                    onChange={() => setFilters({ ...filters, maintenance: !filters.maintenance })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full group-hover:scale-110 transition-transform"></div>
                    <span className="text-white font-medium">Full Bins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.full}
                    onChange={() => setFilters({ ...filters, full: !filters.full })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-red-500 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                </label>
              </div>
            </SpotlightCard>

            {/* System Stats */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Average Fill Level</span>
                    <span className="text-sm font-semibold text-white">{avgFillPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${avgFillPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-white/60">Network Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-green-400">Online</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-white/60">Filtered Bins</span>
                    <span className="text-sm font-semibold text-white">{filteredBins.length}</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col h-full min-h-150">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Bin Locations
                </h2>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-white/80 text-sm font-medium">{filteredBins.length} Shown</span>
                </div>
              </div>
              
              <div className="flex-1 min-h-0">
                {loadingBins ? (
                  <div className="flex items-center justify-center h-full bg-white/5 rounded-xl">
                    <div className="text-center">
                      <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                      <p className="text-white/60 font-medium">Loading bins…</p>
                    </div>
                  </div>
                ) : bins.length === 0 ? (
                  <div className="flex items-center justify-center h-full bg-white/5 rounded-xl">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-white/60 font-medium">No bins deployed yet</p>
                      <p className="text-white/40 text-sm mt-2">Add your first bin to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl h-full w-full">
                    <MapView
                      bins={filteredBins}
                      center={filteredBins.length > 0 ? [filteredBins[0].lat, filteredBins[0].lng] : [25.26, 82.98]}
                      zoom={13}
                      height="100%"
                      onMarkerClick={(bin: Bin) => navigate(`/admin/bins/${bin.id}`)}
                    />
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;