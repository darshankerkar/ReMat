import { useEffect, useState } from "react";
import MapView from "../../components/MapView";
import type { Bin } from "../../../types";
import SpotlightCard from "../../components/UIComponents/SpotlightCard";

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

const PickupRoute = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBins, setSelectedBins] = useState<Bin[]>([]);
  const [routePath, setRoutePath] = useState<Location[]>([]);

  const [startLocation, setStartLocation] = useState<Location | null>(null);

  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  // View state for mobile
  const [showTable, setShowTable] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`${API_BASE}/api/bins`)
      .then(res => res.json())
      .then(data => setBins(data.bins || []));
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) return [];
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
        query
      )}`
    );
    return res.json();
  };

  const detectCurrentLocation = () => {
    setError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setStartLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => setError("Unable to access current location")
    );
  };

  const toggleBin = (bin: Bin) => {
    setSelectedBins(prev =>
      prev.find(b => b.id === bin.id)
        ? prev.filter(b => b.id !== bin.id)
        : [...prev, bin]
    );
  };

  const optimizeRoute = async () => {
    setError(null);

    if (!startLocation) {
      setError("Please select a starting location first.");
      return;
    }

    if (selectedBins.length === 0) {
      setError("Please select at least one bin for pickup.");
      return;
    }

    setOptimizing(true);
    try {
      const res = await fetch(`${API_BASE}/api/route/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startLocation,
          bins: selectedBins.map(b => ({
            lat: b.lat,
            lng: b.lng
          }))
        })
      });

      const data = await res.json();
      setRoutePath(data.path);
    } catch (err) {
      console.error(err);
      setError("Failed to optimize route. Please try again.");
    } finally {
      setOptimizing(false);
    }
  };

  // Filter bins
  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status?: string) => {
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

  return (
    <div className="min-h-screen pb-0">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            Pickup Route Planner
          </h1>
          <p className="text-white/60">Plan optimized collection routes for multiple bins</p>
        </div>

        {/* Start Location */}
        <div className="mb-6">
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Starting Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <button
                  onClick={detectCurrentLocation}
                  className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Use Current Location
                </button>
              </div>

              <div className="relative">
                <input
                  placeholder="Search starting address"
                  value={address}
                  onChange={async e => {
                    const val = e.target.value;
                    setAddress(val);

                    if (val.length >= 3) {
                      const results = await searchAddress(val);
                      setSuggestions(results);
                    } else {
                      setSuggestions([]);
                    }
                  }}
                  className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                />
                <svg className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl z-10 max-h-60 overflow-y-auto">
                    {suggestions.map(item => (
                      <button
                        key={item.place_id}
                        type="button"
                        onClick={() => {
                          setAddress(item.display_name);
                          setStartLocation({
                            lat: parseFloat(item.lat),
                            lng: parseFloat(item.lon)
                          });
                          setSuggestions([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
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
                )}
              </div>
            </div>

            {startLocation && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-green-300 mb-1">Starting Point Set</p>
                    <p className="text-xs text-green-200/70">
                      {startLocation.lat.toFixed(6)}, {startLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <SpotlightCard className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
            <p className="text-xs text-blue-300/70 uppercase tracking-wide font-medium mb-1">Total Bins</p>
            <p className="text-2xl font-bold text-white">{bins.length}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
            <p className="text-xs text-purple-300/70 uppercase tracking-wide font-medium mb-1">Selected</p>
            <p className="text-2xl font-bold text-purple-400">{selectedBins.length}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
            <p className="text-xs text-green-300/70 uppercase tracking-wide font-medium mb-1">Full Bins</p>
            <p className="text-2xl font-bold text-green-400">{bins.filter(b => b.status === "full" || (b.fill_level ?? 0) >= 90).length}</p>
          </SpotlightCard>

          {/* <SpotlightCard className="bg-orange-500/10 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4">
            <p className="text-xs text-orange-300/70 uppercase tracking-wide font-medium mb-1">Route Stops</p>
            <p className="text-2xl font-bold text-orange-400">{routePath.length > 0 ? routePath.length : "-"}</p>
          </SpotlightCard> */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Table/List Column */}
          <div className="xl:col-span-1">
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              {/* Header with Toggle */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Select Bins
                  </h2>

                  {/* Mobile View Toggle */}
                  <button
                    onClick={() => setShowTable(!showTable)}
                    className="xl:hidden px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {showTable ? "Show Map" : "Show List"}
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search bins..."
                      className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    />
                    <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-gray-900">All Status</option>
                    <option value="active" className="bg-gray-900">Active</option>
                    <option value="maintenance" className="bg-gray-900">Maintenance</option>
                    <option value="full" className="bg-gray-900">Full</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className={`${showTable ? "block" : "hidden xl:block"}`}>
                <div className="overflow-x-auto max-h-150 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white/10 backdrop-blur-xl z-10">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedBins.length === filteredBins.length && filteredBins.length > 0}
                            onChange={() => {
                              if (selectedBins.length === filteredBins.length) {
                                setSelectedBins([]);
                              } else {
                                setSelectedBins(filteredBins);
                              }
                            }}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Bin</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Fill</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {filteredBins.map(bin => (
                        <tr
                          key={bin.id}
                          onClick={() => toggleBin(bin)}
                          className={`transition-all duration-200 hover:bg-white/5 cursor-pointer ${
                            selectedBins.find(b => b.id === bin.id) ? "bg-blue-500/10 border-l-4 border-blue-500" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={!!selectedBins.find(b => b.id === bin.id)}
                              onChange={() => toggleBin(bin)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-linear-to--br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <p className="font-semibold text-white text-sm truncate">{bin.name}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold ${getStatusColor(bin.status)}`}>
                              <span className="capitalize">{bin.status}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="min-w-20">
                              <span className="text-sm font-semibold text-white block mb-1">{bin.fill_level}%</span>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    (bin.fill_level ?? 0) >= 90
                                      ? "bg-red-500"
                                      : (bin.fill_level ?? 0) >= 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${bin.fill_level}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredBins.length === 0 && (
                    <div className="p-12 text-center">
                      <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-white/60 font-medium">No bins found</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      <span className="font-semibold text-white">{selectedBins.length}</span> of{" "}
                      <span className="font-semibold text-white">{filteredBins.length}</span> selected
                    </span>
                    {selectedBins.length > 0 && (
                      <button
                        onClick={() => setSelectedBins([])}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Map Column */}
          <div className={`xl:col-span-1 ${!showTable ? "block" : "hidden xl:block"}`}>
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Route Map
                </h2>

                {routePath.length > 0 && (
                  <button
                    onClick={() => setRoutePath([])}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    Clear Route
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl mb-4" style={{ height: '520px' }}>
                <MapView
                  bins={[
                    ...bins,
                    ...(startLocation
                      ? [
                          {
                            id: "start",
                            name: "Start Location",
                            lat: startLocation.lat,
                            lng: startLocation.lng,
                            status: "start"
                          }
                        ]
                      : [])
                  ]}
                  selectedBinIds={selectedBins.map(b => b.id) as string[]}
                  onMarkerSelect={toggleBin}
                  routePath={routePath}
                  center={
                    startLocation
                      ? [startLocation.lat, startLocation.lng]
                      : bins.length > 0
                      ? [bins[0].lat, bins[0].lng]
                      : undefined
                  }
                  height="100%"
                />
              </div>

              <button
                onClick={optimizeRoute}
                disabled={optimizing || !startLocation || selectedBins.length === 0}
                className="w-full px-6 py-4 bg-linear-to--r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {optimizing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Optimizing Route...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Optimize Route
                  </>
                )}
              </button>

              {routePath.length > 0 && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-green-300 mb-1">Route Optimized!</p>
                      <p className="text-xs text-green-200/70">
                        Optimized path with {routePath.length} stops including start location
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

export default PickupRoute;