import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../../components/MapView";
import SpotlightCard from "../../components/UIComponents/SpotlightCard";
import toast from "react-hot-toast";

interface Location {
  lat: number;
  lng: number;
}

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const AddBin = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [status, setStatus] = useState("active");

  const [location, setLocation] = useState<Location | null>(null);

  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const searchAddress = async (query: string) => {
    if (query.length < 3) return [];

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query
        )}`
      );
      return await res.json();
    } catch {
      return [];
    } finally {
      setSearching(false);
    }
  };

  const geocodeFinalAddress = async (query: string): Promise<Location | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      if (!data || data.length === 0) return null;

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name) {
      setError("Please enter a bin name.");
      return;
    }

    let finalLocation = location;

    if (!finalLocation && address) {
      const resolved = await geocodeFinalAddress(address);
      if (resolved) {
        finalLocation = resolved;
        setLocation(resolved);
      } else {
        setError(
          "Unable to determine location from the entered address. Please select a suggestion or click on the map."
        );
        return;
      }
    }

    if (!finalLocation) {
      setError("Please select a location using address search or map click.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/bins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          capacity,
          status,
          lat: finalLocation.lat,
          lng: finalLocation.lng
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create bin");
      }

      toast.success("Bin created successfully");
      navigate("/admin/bins");
    } catch (err) {
      console.error("Create bin failed", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create bin. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-0">
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
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add New Bin
          </h1>
          <p className="text-white/60">Deploy a new e-waste collection bin to your network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h2>

              <div className="space-y-5">
                {/* Bin Name */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Bin Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Campus Main Gate Bin"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
                      value={capacity}
                      onChange={e => setCapacity(Number(e.target.value))}
                      min="1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
                      L
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((capacity / 200) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white/60 font-medium">{capacity}L</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Initial Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("active")}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        status === "active"
                          ? "bg-green-500/20 border-2 border-green-500/50 text-green-400"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${status === "active" ? "bg-green-400" : "bg-white/40"}`}></div>
                        <span className="text-sm">Active</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus("maintenance")}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        status === "maintenance"
                          ? "bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${status === "maintenance" ? "bg-yellow-400" : "bg-white/40"}`}></div>
                        <span className="text-sm">Maintenance</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus("full")}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        status === "full"
                          ? "bg-red-500/20 border-2 border-red-500/50 text-red-400"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${status === "full" ? "bg-red-400" : "bg-white/40"}`}></div>
                        <span className="text-sm">Full</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Location Search */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location <span className="text-red-400">*</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Search Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={async e => {
                        const val = e.target.value;
                        setAddress(val);
                        setLocation(null);

                        if (val.length >= 3) {
                          const results = await searchAddress(val);
                          setSuggestions(results);
                        } else {
                          setSuggestions([]);
                        }
                      }}
                      placeholder="Type address or landmark"
                      className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    />
                    <svg className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                    <div className="max-h-60 overflow-y-auto">
                      {suggestions.map(item => (
                        <button
                          key={item.place_id}
                          type="button"
                          onClick={() => {
                            setAddress(item.display_name);
                            setLocation({
                              lat: parseFloat(item.lat),
                              lng: parseFloat(item.lon)
                            });
                            setSuggestions([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-150 border-b border-white/5 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-sm text-white/80">{item.display_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Location Display */}
                {location && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-green-300 mb-1">Location Selected</p>
                        <p className="text-xs text-green-200/70">
                          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SpotlightCard>

            {/* Error Display */}
            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-300 mb-1">Error</p>
                    <p className="text-sm text-red-200/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Bin...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Bin
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/admin/bins")}
                disabled={submitting}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Select Location on Map
              </h2>

              <p className="text-sm text-white/60 mb-4">
                Click on the map to set the bin location or search for an address above
              </p>

              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '500px' }}>
                <MapView
                  bins={
                    location
                      ? [{ id: "preview", lat: location.lat, lng: location.lng, status: "active" }]
                      : []
                  }
                  center={location ? [location.lat, location.lng] : undefined}
                  zoom={location ? 16 : 13}
                  height="100%"
                  onMapClick={(coords: Location) => {
                    setLocation(coords);
                    setSuggestions([]);
                  }}
                  showPopup={false}
                />
              </div>

              {location && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-blue-300 mb-1">Pro Tip</p>
                      <p className="text-xs text-blue-200/70">
                        You can drag the map to adjust your view and click anywhere to change the bin location
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBin;