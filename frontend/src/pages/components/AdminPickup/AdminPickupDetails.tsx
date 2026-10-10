import { useState } from "react";
import type { PickupRequest } from "../../../types";
import SpotlightCard from "../UIComponents/SpotlightCard";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface Props {
  pickup: PickupRequest;
  adminId: string;
  onClose: () => void;
  onAction: () => void;
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
    title: "Pending Review",
    description: "This request is awaiting your action"
  },
  accepted: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "✅",
    title: "Request Accepted",
    description: "This pickup has been approved and points awarded"
  },
  rejected: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "❌",
    title: "Request Rejected",
    description: "This request has been declined"
  }
};

const AdminPickupDetails = ({
  pickup,
  adminId,
  onClose,
  onAction
}: Props) => {
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    if (!points || isNaN(Number(points)) || Number(points) <= 0) {
      toast.error("Please enter valid points to award");
      return;
    }

    setLoading(true);

    try {
      const url = `${BASE_URL}/admin/pickup-requests/${pickup.id}/accept?admin_id=${encodeURIComponent(adminId)}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points_awarded: Number(points) })
      });

      if (!res.ok) {
        throw new Error("Failed to accept request");
      }

      toast.success(`Request accepted! ${points} points awarded.`);
      onAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    if (!confirm("Are you sure you want to reject this request?")) return;

    setLoading(true);

    try {
      const url = `${BASE_URL}/admin/pickup-requests/${pickup.id}/reject?admin_id=${encodeURIComponent(adminId)}`;
      const res = await fetch(url, {
        method: "PATCH"
      });

      if (!res.ok) {
        throw new Error("Failed to reject request");
      }

      toast.success("Request rejected");
      onAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6">
      {/* Status Card */}
      <SpotlightCard className={`${config.bg} backdrop-blur-xl border ${config.border} rounded-xl p-6 sm:p-8`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{config.icon}</div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${config.color} mb-2`}>{config.title}</h2>
              <p className="text-white/80">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </SpotlightCard>

      {/* Item Details */}
      <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Request Details
        </h3>

        <div className="space-y-6">
          {/* E-waste Type */}
          <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-white/60 mb-1">E-waste Type</p>
              <p className="text-lg font-semibold text-white">{pickup.e_waste_type || "Not specified"}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          {/* Image */}
          {pickup.image_url && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-white/60 mb-3 font-semibold">Item Photo</p>
              <div className="relative group">
                <img
                  src={pickup.image_url}
                  alt="E-waste item"
                  className="w-full max-w-2xl rounded-lg border border-white/10 shadow-xl"
                />
                <a
                  href={pickup.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Contact & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Number */}
            <div className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-white/60 mb-1">Contact Number</p>
                <p className="text-lg font-semibold text-white">{pickup.contact_number}</p>
              </div>
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>

            {/* Preferred Date & Time */}
            <div className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/60 mb-1">Preferred Pickup</p>
                <p className="text-base font-semibold text-white">{formattedDate}</p>
              </div>
              <svg className="w-6 h-6 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Address */}
          {pickup.address_text && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-white/60 mb-2 font-semibold">Pickup Address</p>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-white">{pickup.address_text}</p>
              </div>
            </div>
          )}

          {/* Coordinates */}
          {pickup.latitude != null && pickup.longitude != null && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-white/60 mb-1">Coordinates</p>
              <p className="text-white font-mono text-sm">
                {pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </SpotlightCard>

      {/* Actions Card - Only for Open Status */}
      {pickup.status === "open" && (
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Review Actions
          </h3>

          <div className="space-y-4">
            {/* Points Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Points to Award *
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              />
              <p className="text-xs text-white/40 mt-2">Enter the number of points to award for this e-waste item</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Accept Button */}
              <button
                onClick={accept}
                disabled={loading}
                className="px-6 py-4 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/30 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Request
                  </>
                )}
              </button>

              {/* Reject Button */}
              <button
                onClick={reject}
                disabled={loading}
                className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Request
              </button>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Result Cards - For Accepted/Rejected Status */}
      {pickup.status === "accepted" && (
        <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-400 mb-2">Request Accepted</h3>
          <p className="text-white/80 mb-4">This pickup has been successfully approved</p>
          {pickup.points_awarded && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <span className="text-sm text-green-300/80 font-semibold">Points Awarded:</span>
              <span className="text-2xl font-bold text-green-400">+{pickup.points_awarded}</span>
            </div>
          )}
        </SpotlightCard>
      )}

      {pickup.status === "rejected" && (
        <SpotlightCard className="bg-linear-to-br from-red-500/10 to-red-600/5 backdrop-blur-xl border border-red-500/20 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-red-400 mb-2">Request Rejected</h3>
          <p className="text-white/80">This pickup request has been declined</p>
        </SpotlightCard>
      )}
    </div>
  );
};

export default AdminPickupDetails;