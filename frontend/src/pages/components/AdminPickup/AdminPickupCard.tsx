import type { PickupRequest } from "../../../types";
import SpotlightCard from "../UIComponents/SpotlightCard";

interface Props {
  pickup: PickupRequest;
  onClick: () => void;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  open: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "⏳"
  },
  accepted: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "✅"
  },
  rejected: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "❌"
  },
  cancelled: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: "🚫"
  }
};

const AdminPickupCard = ({ pickup, onClick }: Props) => {
  const config = statusConfig[pickup.status] || statusConfig.open;
  const formattedDate = new Date(pickup.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const preferredDate = new Date(pickup.preferred_datetime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SpotlightCard
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left Section - Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-3 bg-purple-500/20 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-purple-300 transition-colors">
                {pickup.e_waste_type || "E-waste Item"}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} border ${config.border} rounded-full text-sm font-semibold ${config.color}`}>
                  <span>{config.icon}</span>
                  <span className="capitalize">{pickup.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Created: {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Pickup: {preferredDate}</span>
            </div>
          </div>

          {/* User Info */}
          {pickup.contact_number && (
            <div className="flex items-center gap-2 text-white/60 text-sm mt-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{pickup.contact_number}</span>
            </div>
          )}
        </div>

        {/* Right Section - Points & Arrow */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-4">
          {pickup.status === "accepted" && pickup.points_awarded && (
            <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
              <p className="text-xs text-green-300/80 uppercase tracking-wider font-semibold mb-0.5">Points</p>
              <p className="text-xl font-bold text-green-400">+{pickup.points_awarded}</p>
            </div>
          )}
          
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default AdminPickupCard;