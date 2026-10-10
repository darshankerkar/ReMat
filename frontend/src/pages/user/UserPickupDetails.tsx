import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import type { Bin } from "../../types";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import { Toaster, toast } from "react-hot-toast";

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

const statusConfig: Record<string, { 
  color: string; 
  bg: string; 
  border: string; 
  icon: string;
  title: string;
  description: string;
}> = {
  open: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "⏳",
    title: "Request Pending",
    description: "Your pickup request is being reviewed by our team"
  },
  accepted: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "✅",
    title: "Request Accepted",
    description: "Great! Your e-waste pickup has been scheduled"
  },
  rejected: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "❌",
    title: "Request Rejected",
    description: "Unfortunately, this request could not be processed"
  },
  cancelled: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: "🚫",
    title: "Request Cancelled",
    description: "This pickup request has been cancelled"
  }
};

const PickupDetails = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    setLoading(true);
    fetch(`${BASE_URL}/user/pickup-requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pickup details");
        return res.json();
      })
      .then((data: PickupRequest) => setPickup(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load pickup details");
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleCancel = async () => {
    if (!requestId || !profile?.uid) return;
    if (!confirm("Cancel this request? It will be permanently deleted.")) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${BASE_URL}/user/pickup-requests/${requestId}?user_id=${encodeURIComponent(profile.uid)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to delete request");
      }
      toast.success("Request cancelled successfully");
      navigate("/user/pickup-requests", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete request");
    } finally {
      setDeleting(false);
    }
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    if (!requestId || !profile?.uid || pickup?.status !== "open") return;

    setUpdatingLocation(true);
    try {
      const address_text = await reverseGeocode(coords.lat, coords.lng);
      const res = await fetch(
        `${BASE_URL}/user/pickup-requests/${requestId}/location?user_id=${encodeURIComponent(profile.uid)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: coords.lat,
            longitude: coords.lng,
            address_text: address_text ?? undefined,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to update location");
      }
      const updated: PickupRequest = await res.json();
      setPickup(updated);
      toast.success("Location updated successfully!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update location");
    } finally {
      setUpdatingLocation(false);
    }
  };

  const pickupBin: Bin | undefined = useMemo(() => {
    if (pickup?.latitude == null || pickup?.longitude == null) return undefined;
    return {
      id: "pickup",
      lat: pickup.latitude,
      lng: pickup.longitude,
      name: "Pickup location",
      status: "active",
    };
  }, [pickup?.latitude, pickup?.longitude]);

  const mapCenter: [number, number] | undefined =
    pickup?.latitude != null && pickup?.longitude != null
      ? [pickup.latitude, pickup.longitude]
      : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
          <div className="text-white text-base sm:text-lg font-medium">Loading details...</div>
        </div>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8 max-w-lg w-full text-center">
          <div className="text-5xl sm:text-6xl mb-4">😕</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Request Not Found</h2>
          <p className="text-sm sm:text-base text-white/60 mb-6">The pickup request you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/user/pickup-requests")}
            className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            Back to Requests
          </button>
        </SpotlightCard>
      </div>
    );
  }

  const config = statusConfig[pickup.status] || statusConfig.open;
  const formattedDate = new Date(pickup.preferred_datetime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen pb-6 sm:pb-8">
      <Toaster />
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/user/pickup-requests")}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors min-h-[44px] -ml-2 pl-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">Back to Requests</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Pickup Request Details</h1>
          <p className="text-sm sm:text-base text-white/60">View and manage your pickup request</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Status Card */}
            <SpotlightCard className={`${config.bg} backdrop-blur-xl border ${config.border} rounded-xl p-5 sm:p-6 lg:p-8`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-4xl sm:text-5xl shrink-0">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl sm:text-2xl font-bold ${config.color} mb-2`}>{config.title}</h2>
                  <p className="text-sm sm:text-base text-white/80">{config.description}</p>
                  {pickup.status === "rejected" && pickup.rejection_reason && (
                    <div className="mt-4 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-xs sm:text-sm text-white/60 mb-1 font-semibold">Reason:</p>
                      <p className="text-sm sm:text-base text-white">{pickup.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </SpotlightCard>

            {/* Item Details */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Item Information
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {/* E-waste Type */}
                <div className="flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white/60 mb-1">E-waste Type</p>
                    <p className="text-base sm:text-lg font-semibold text-white break-words">{pickup.e_waste_type || "Not specified"}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>

                {/* Image */}
                {pickup.image_url && (
                  <div className="p-3 sm:p-4 bg-white/5 rounded-lg">
                    <p className="text-xs sm:text-sm text-white/60 mb-2 sm:mb-3">Item Photo</p>
                    <img
                      src={pickup.image_url}
                      alt="E-waste item"
                      className="w-full max-w-md rounded-lg border border-white/10 shadow-xl"
                    />
                  </div>
                )}

                {/* Contact Number */}
                <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white/60 mb-1">Contact Number</p>
                    <p className="text-base sm:text-lg font-semibold text-white break-all">{pickup.contact_number}</p>
                  </div>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>

                {/* Preferred Date & Time */}
                <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white/60 mb-1">Preferred Date & Time</p>
                    <p className="text-base sm:text-lg font-semibold text-white break-words">{formattedDate}</p>
                  </div>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </SpotlightCard>

            {/* Location Section */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pickup Location
              </h3>

              {pickup.address_text && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <p className="text-xs sm:text-sm text-white/60 mb-1">Address</p>
                  <p className="text-sm sm:text-base text-white break-words">{pickup.address_text}</p>
                </div>
              )}

              {pickup.latitude != null && pickup.longitude != null && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <p className="text-xs sm:text-sm text-white/60 mb-1">Coordinates</p>
                  <p className="text-xs sm:text-sm text-white font-mono break-all">
                    {pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              {pickup.status === "open" && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-blue-200">
                      Click on the map to update your pickup location
                    </p>
                  </div>
                </div>
              )}

              {mapCenter && pickupBin && (
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl" style={{ height: "300px" }}>
                  <MapView
                    bins={[pickupBin]}
                    center={mapCenter}
                    zoom={15}
                    height="100%"
                    showPopup={true}
                    onMapClick={pickup.status === "open" ? handleMapClick : undefined}
                  />
                </div>
              )}

              {updatingLocation && (
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">Updating location...</span>
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Right Column - Actions & Points */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Points Card (if accepted) */}
            {pickup.status === "accepted" && pickup.points_awarded && (
              <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-5 sm:p-6 text-center">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎉</div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Points Awarded</h3>
                <p className="text-4xl sm:text-5xl font-bold text-green-400 mb-2 sm:mb-3">+{pickup.points_awarded}</p>
                <p className="text-xs sm:text-sm text-green-300/80">Thank you for recycling!</p>
              </SpotlightCard>
            )}

            {/* Actions Card */}
            {pickup.status === "open" && (
              <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Actions</h3>
                <button
                  onClick={handleCancel}
                  disabled={deleting}
                  className="w-full min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Cancel Request
                    </>
                  )}
                </button>
              </SpotlightCard>
            )}

            {/* Request Info */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Request Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Request ID</p>
                  <p className="text-xs sm:text-sm text-white font-mono break-all">{pickup.id}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-xs sm:text-sm text-white">
                    {new Date(pickup.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} border ${config.border} rounded-full text-xs sm:text-sm font-semibold ${config.color}`}>
                    <span>{config.icon}</span>
                    <span className="capitalize">{pickup.status}</span>
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupDetails;