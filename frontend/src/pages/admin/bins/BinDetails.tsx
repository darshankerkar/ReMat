import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MapView from "../../components/MapView";
import SpotlightCard from "../../components/UIComponents/SpotlightCard";
import toast, {Toaster} from "react-hot-toast";

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

const BinDetails = () => {
  const { binId } = useParams();
  const navigate = useNavigate();

  const [bin, setBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/bins/${binId}`)
      .then(res => res.json())
      .then(data => {
        setBin(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch bin", err);
        setLoading(false);
      });
  }, [binId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Loading bin details...</p>
        </div>
      </div>
    );
  }

  if (!bin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <svg className="w-16 h-16 text-red-400/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white font-semibold text-lg mb-2">Bin Not Found</p>
          <p className="text-white/60 mb-6">The requested bin could not be found</p>
          <button
            onClick={() => navigate("/admin/bins")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Back to Bins
          </button>
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/bins/${bin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: bin.name,
          capacity: bin.capacity,
          status: bin.status
        })
      });
      toast.success("Bin updated successfully");
    } catch (err) {
      console.error("Failed to update bin", err);
      toast.error("Failed to update bin");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/bins/${bin.id}`, {
        method: "DELETE"
      });
      toast.success("Bin deleted");
      navigate("/admin/bins");
    } catch (err) {
      console.error("Failed to delete bin", err);
      toast.error("Failed to delete bin");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "from-green-500 to-green-600";
      case "maintenance":
        return "from-yellow-500 to-yellow-600";
      case "full":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen pb-0">
      <Toaster />
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/bins")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 mb-4 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Bins
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className={`p-3 bg-linear-to--br ${getStatusColor(bin.status)} rounded-xl shadow-lg`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                {bin.name}
              </h1>
              <p className="text-white/60">Manage bin settings and information</p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm font-semibold text-blue-400">ID: {bin.id}</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Capacity</p>
            <p className="text-2xl font-bold text-white">{bin.capacity}L</p>
          </SpotlightCard>

          <SpotlightCard className="bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Fill Level</p>
            <p className="text-2xl font-bold text-white">{bin.fill_level}%</p>
          </SpotlightCard>

          <SpotlightCard className={`bg-linear-to-br ${
            bin.status === "active" ? "from-green-500/10 to-green-600/5 border-green-500/20" :
            bin.status === "maintenance" ? "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20" :
            "from-red-500/10 to-red-600/5 border-red-500/20"
          } backdrop-blur-xl border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 ${
                bin.status === "active" ? "bg-green-500/20" :
                bin.status === "maintenance" ? "bg-yellow-500/20" :
                "bg-red-500/20"
              } rounded-lg`}>
                <svg className={`w-6 h-6 ${
                  bin.status === "active" ? "text-green-400" :
                  bin.status === "maintenance" ? "text-yellow-400" :
                  "text-red-400"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Status</p>
            <p className={`text-2xl font-bold capitalize ${
              bin.status === "active" ? "text-green-400" :
              bin.status === "maintenance" ? "text-yellow-400" :
              "text-red-400"
            }`}>{bin.status}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-linear-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Created</p>
            <p className="text-sm font-bold text-white">{new Date(bin.created_at).toLocaleDateString()}</p>
          </SpotlightCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Edit Form */}
          <div className="space-y-6">
            {/* Edit Information */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </h2>

              <div className="space-y-5">
                {/* Bin Name */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Bin Name
                  </label>
                  <input
                    type="text"
                    value={bin.name}
                    onChange={e => setBin({ ...bin, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Capacity (Liters)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bin.capacity}
                      onChange={e => setBin({ ...bin, capacity: Number(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
                      L
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to--r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((bin.capacity / 200) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white/60 font-medium">{bin.capacity}L</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setBin({ ...bin, status: "active" })}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        bin.status === "active"
                          ? "bg-green-500/20 border-2 border-green-500/50 text-green-400"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${bin.status === "active" ? "bg-green-400" : "bg-white/40"}`}></div>
                        <span className="text-sm">Active</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBin({ ...bin, status: "maintenance" })}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        bin.status === "maintenance"
                          ? "bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${bin.status === "maintenance" ? "bg-yellow-400" : "bg-white/40"}`}></div>
                        <span className="text-sm">Maintenance</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBin({ ...bin, status: "full" })}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        bin.status === "full"
                          ? "bg-red-500/20 border-2 border-red-500/50 text-red-400"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${bin.status === "full" ? "bg-red-400" : "bg-white/40"}`}></div>
                        <span className="text-sm">Full</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Fill Level - Read Only */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Current Fill Level
                  </label>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{bin.fill_level}%</span>
                      <span className="text-xs text-white/50">Read Only</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          bin.fill_level >= 90
                            ? "bg-linear-to--r from-red-500 to-red-600"
                            : bin.fill_level >= 60
                            ? "bg-linear-to--r from-yellow-500 to-yellow-600"
                            : "bg-linear-to--r from-green-500 to-green-600"
                        }`}
                        style={{ width: `${bin.fill_level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="w-full px-6 py-4 bg-linear-to--r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </SpotlightCard>

            {/* Danger Zone */}
            <SpotlightCard className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </h2>

              <p className="text-white/60 text-sm mb-6">
                Deleting this bin is permanent and cannot be undone. All associated data will be lost.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Bin
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 font-semibold mb-2">⚠️ Are you absolutely sure?</p>
                    <p className="text-red-200/70 text-sm">
                      This action cannot be undone. This will permanently delete the bin "{bin.name}".
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Yes, Delete
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Right Column - Location & Info */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-6">
            {/* Map */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bin Location
              </h2>

              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-300 mb-1">Coordinates</p>
                    <p className="text-xs text-blue-200/70">
                      {bin.lat.toFixed(6)}, {bin.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '400px' }}>
                <MapView
                  bins={[bin]}
                  center={[bin.lat, bin.lng]}
                  zoom={16}
                  height="100%"
                />
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${bin.lat},${bin.lng}`;
                    window.open(mapsUrl, "_blank");
                  }}
                  className="w-full px-4 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </button>
              </div>
            </SpotlightCard>

            {/* Additional Info */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Information
              </h2>

              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">Created At</p>
                  <p className="text-white font-semibold">{new Date(bin.created_at).toLocaleString()}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">Bin ID</p>
                  <p className="text-white font-semibold font-mono">{bin.id}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">QR Code URL</p>
                  <p className="text-white font-semibold text-sm truncate">
                    /bin/{bin.id}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinDetails;