import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import type { Bin } from "../../types";
import AdminPickupDetails from "../components/AdminPickup/AdminPickupDetails";
import MapView from "../components/MapView";
import { useAuth } from "../../auth/useAuth";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import { Toaster, toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE = BASE_URL.replace(/\/?(user|admin).*$/, "") || BASE_URL;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface AdminLocation {
  lat: number;
  lng: number;
}

const AdminPickupDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLocation, setAdminLocation] = useState<AdminLocation | null>(null);
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    
    setLoading(true);
    fetch(`${BASE_URL}/admin/pickup-requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pickup request");
        return res.json();
      })
      .then((data: PickupRequest) => setPickup(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load pickup details");
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleClose = () => {
    navigate("/admin/pickup-requests");
  };

  const handleAction = () => {
    navigate("/admin/pickup-requests");
  };

  const requestAdminLocation = () => {
    setRouteError(null);
    if (!navigator.geolocation) {
      setRouteError("Geolocation is not supported by your browser");
      toast.error("Geolocation not supported");
      return;
    }

    toast.loading("Getting your location...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setAdminLocation(loc);
        setRoutePath([]);
        toast.dismiss();
        toast.success("Location obtained!");
        
        if (pickup?.latitude != null && pickup?.longitude != null) {
          fetchRoute(loc, pickup.latitude, pickup.longitude);
        }
      },
      () => {
        toast.dismiss();
        setRouteError("Could not get your location");
        toast.error("Failed to get location");
      }
    );
  };

  const fetchRoute = async (
    start: { lat: number; lng: number },
    destLat: number,
    destLng: number
  ) => {
    setLoadingRoute(true);
    setRouteError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/route/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: { lat: start.lat, lng: start.lng },
          bins: [{ lat: destLat, lng: destLng }],
        }),
      });
      
      if (!res.ok) throw new Error("Failed to get route");
      
      const data = await res.json();
      setRoutePath(data.path ?? []);
      toast.success("Route loaded successfully!");
    } catch (error) {
      setRouteError("Failed to load route");
      toast.error("Failed to load route: " + error);
    } finally {
      setLoadingRoute(false);
    }
  };

  const distanceKm = useMemo(() => {
    if (
      !adminLocation ||
      pickup?.latitude == null ||
      pickup?.longitude == null
    )
      return null;
    return haversineKm(
      adminLocation.lat,
      adminLocation.lng,
      pickup.latitude,
      pickup.longitude
    );
  }, [adminLocation, pickup?.latitude, pickup?.longitude]);

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

  const mapCenter: [number, number] | undefined = useMemo(() => {
    if (pickup?.latitude != null && pickup?.longitude != null) {
      if (adminLocation)
        return [
          (pickup.latitude + adminLocation.lat) / 2,
          (pickup.longitude + adminLocation.lng) / 2,
        ];
      return [pickup.latitude, pickup.longitude];
    }
    return undefined;
  }, [pickup?.latitude, pickup?.longitude, adminLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-lg font-medium">Loading details...</div>
        </div>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Not Found</h2>
          <p className="text-white/60 mb-6">The pickup request you're looking for doesn't exist.</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-semibold rounded-lg transition-all duration-200"
          >
            Back to Requests
          </button>
        </SpotlightCard>
      </div>
    );
  }

  const adminId = profile?.uid ?? "";

  return (
    <div className="min-h-screen pb-8">
      <Toaster />
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleClose}
            className="mb-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Requests
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Request Details</h1>
          <p className="text-white/60">Review and manage this pickup request</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <AdminPickupDetails
              pickup={pickup}
              adminId={adminId}
              onClose={handleClose}
              onAction={handleAction}
            />
          </div>

          {/* Right Column - Map & Route */}
          <div className="lg:col-span-1 space-y-6">
            {pickup.latitude != null && pickup.longitude != null && (
              <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map & Route
                </h3>

                {/* Location Button */}
                <button
                  onClick={requestAdminLocation}
                  disabled={loadingRoute}
                  className="w-full mb-4 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingRoute ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
                      Loading Route...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {adminLocation ? "Update Location & Route" : "Get My Location"}
                    </>
                  )}
                </button>

                {/* Error Message */}
                {routeError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-300">{routeError}</p>
                  </div>
                )}

                {/* Distance Info */}
                {adminLocation && distanceKm != null && (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-300/80 uppercase tracking-wider font-semibold mb-1">Distance</p>
                        <p className="text-2xl font-bold text-green-400">{distanceKm.toFixed(1)} km</p>
                      </div>
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Map */}
                {mapCenter && (
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl" style={{ height: "400px" }}>
                    <MapView
                      bins={pickupBin ? [pickupBin] : []}
                      center={mapCenter}
                      zoom={13}
                      height="100%"
                      showPopup={true}
                      userLocation={adminLocation ?? undefined}
                      routePath={routePath.length > 1 ? routePath : undefined}
                    />
                  </div>
                )}
              </SpotlightCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPickupDetail;