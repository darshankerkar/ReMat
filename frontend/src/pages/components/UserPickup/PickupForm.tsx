import { useState, useMemo } from "react";
import MapView from "../MapView";
import type { Bin } from "../../../types";
import SpotlightCard from "../UIComponents/SpotlightCard";
import toast from "react-hot-toast";

interface Props {
  userId: string;
  onSuccess: () => void;
}

type Location = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: [number, number] = [25.26, 82.98];

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}

const PickupForm = ({ userId, onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [phone, setPhone] = useState("");
  const [datetime, setDatetime] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const searchAddress = async (query: string) => {
    if (query.length < 3) return [];

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
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
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
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

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    toast.loading("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(newLoc);
        const name = await reverseGeocode(newLoc.lat, newLoc.lng);
        if (name) setAddressQuery(name);
        toast.dismiss();
        toast.success("Location obtained successfully!");
      },
      () => {
        toast.dismiss();
        toast.error("Failed to get current location");
      }
    );
  };

  const handleAddressChange = async (value: string) => {
    setAddressQuery(value);
    setLocation(null);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const results = await searchAddress(value);
    setSuggestions(results);
  };

  const selectAddress = async (displayName: string) => {
    setAddressQuery(displayName);
    setSuggestions([]);

    const loc = await geocodeFinalAddress(displayName);
    if (!loc) {
      toast.error("Failed to resolve address");
      return;
    }

    setLocation(loc);
    toast.success("Location set successfully!");
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    setLocation({ lat: coords.lat, lng: coords.lng });
    const name = await reverseGeocode(coords.lat, coords.lng);
    if (name) setAddressQuery(name);
    toast.success("Location updated!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const pickupBin: Bin | undefined = useMemo(() => {
    if (!location) return undefined;
    return {
      id: "pickup",
      lat: location.lat,
      lng: location.lng,
      name: "Pickup location",
      status: "active",
    };
  }, [location]);

  const mapCenter: [number, number] = location ? [location.lat, location.lng] : DEFAULT_CENTER;

  const submit = async () => {
    if (!file) {
      toast.error("Please upload an image");
      return;
    }
    if (!type.trim()) {
      toast.error("Please enter e-waste type");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    if (!datetime) {
      toast.error("Please select preferred date and time");
      return;
    }
    if (!location) {
      toast.error("Please select a pickup location");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("e_waste_type", type);
    fd.append("contact_number", phone);
    fd.append("preferred_datetime", datetime);
    fd.append("latitude", String(location.lat));
    fd.append("longitude", String(location.lng));
    fd.append("image", file);

    try {
      const res = await fetch(`${BASE_URL}/user/pickup-requests`, {
        method: "POST",
        body: fd
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create pickup request");
      }

      toast.success("Pickup request created successfully! 🎉");
      
      // Reset form
      setFile(null);
      setType("");
      setPhone("");
      setDatetime("");
      setLocation(null);
      setAddressQuery("");
      setPreviewUrl(null);
      
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create pickup request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">➕</span>
          Request Pickup
        </h3>

        <div className="space-y-6">
          {/* E-waste Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              E-waste Type *
            </label>
            <input
              type="text"
              placeholder="e.g., Washing Machine, TV, Laptop"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Upload Image *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all duration-200"
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg" />
                    <p className="text-sm text-white/60">Click to change image</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-center">
                      <p className="text-white font-medium">Click to upload image</p>
                      <p className="text-sm text-white/40 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Phone Number and Date/Time - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                placeholder="e.g., +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Preferred Date & Time *
              </label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pickup Location *
            </h4>

            {/* Current Location Button */}
            <button
              type="button"
              onClick={useCurrentLocation}
              className="w-full sm:w-auto mb-4 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Use Current Location
            </button>

            {/* Address Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search address..."
                value={addressQuery}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="mb-4 bg-white/5 border border-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectAddress(s.display_name)}
                    className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-white/40 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-sm">{s.display_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Location Confirmation */}
            {location && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-green-300 font-semibold mb-1">Location Selected</p>
                    <p className="text-sm text-green-200/80">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div>
              <p className="text-sm text-white/60 mb-2">Click on the map to set pickup location:</p>
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl" style={{ height: "320px" }}>
                <MapView
                  bins={pickupBin ? [pickupBin] : []}
                  center={mapCenter}
                  zoom={location ? 15 : 12}
                  height="100%"
                  showPopup={true}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full py-4 px-6 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/30 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Request
              </>
            )}
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default PickupForm;