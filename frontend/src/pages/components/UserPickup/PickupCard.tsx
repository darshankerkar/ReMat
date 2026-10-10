import type { PickupRequest } from "../../../types";
import SpotlightCard from "../UIComponents/SpotlightCard";

interface Props {
  pickup: PickupRequest;
  onClick?: () => void;
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

const PickupCard = ({ pickup, onClick }: Props) => {
  const config = statusConfig[pickup.status] || statusConfig.open;
  const formattedDate = new Date(pickup.preferred_datetime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
                {pickup.e_waste_type}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} border ${config.border} rounded-full text-sm font-semibold ${config.color}`}>
                  <span>{config.icon}</span>
                  <span className="capitalize">{pickup.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>

          {/* Location if available */}
          {pickup.address_text && (
            <div className="flex items-start gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-2">{pickup.address_text}</span>
            </div>
          )}
        </div>

        {/* Right Section - Status Badge & Arrow */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-4">
          {pickup.status === "accepted" && pickup.points_awarded && (
            <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
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

export default PickupCard;