import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import PickupForm from "../components/UserPickup/PickupForm";
import PickupCard from "../components/UserPickup/PickupCard";
import { useAuth } from "../../auth/useAuth";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import { Toaster } from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const UserPickups = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const userId = profile?.uid;

  useEffect(() => {
    if (!userId) return;

    // Defer setState so it's not synchronous in the effect body (avoids cascading-render warning)
    queueMicrotask(() => setLoading(true));
    fetch(`${BACKEND_URL}/user/pickup-requests?user_id=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pickup requests");
        return res.json();
      })
      .then((data: PickupRequest[]) => setPickups(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSuccess = () => {
    setShowForm(false);
    // Refetch pickups
    if (userId) {
      fetch(`${BACKEND_URL}/user/pickup-requests?user_id=${userId}`)
        .then((res) => res.json())
        .then((data: PickupRequest[]) => setPickups(data))
        .catch(console.error);
    }
  };

  // Calculate stats
  const openRequests = pickups.filter((p) => p.status === "open").length;
  const acceptedRequests = pickups.filter((p) => p.status === "accepted").length;
  const totalPoints = pickups
    .filter((p) => p.status === "accepted")
    .reduce((sum, p) => sum + (p.points_awarded || 0), 0);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
          <div className="text-white text-base sm:text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 sm:pb-8">
      <Toaster />
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl">📦</span>
            <span className="break-words">My Pickup Requests</span>
          </h1>
          <p className="text-sm sm:text-base text-white/60">Manage your e-waste pickup requests and track their status</p>
        </div>

        {/* Stats Grid */}
        {pickups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Open Requests */}
            <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/50 mb-1 font-medium">Open Requests</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{openRequests}</p>
            </SpotlightCard>

            {/* Accepted Requests */}
            <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/50 mb-1 font-medium">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{acceptedRequests}</p>
            </SpotlightCard>

            {/* Total Points */}
            <SpotlightCard className="bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/50 mb-1 font-medium">Points Earned</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{totalPoints}</p>
            </SpotlightCard>
          </div>
        )}

        {/* New Request Button */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto min-h-[48px] px-5 sm:px-6 py-3 sm:py-4 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/30 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
            </svg>
            <span className="text-sm sm:text-base">{showForm ? "Cancel" : "New Pickup Request"}</span>
          </button>
        </div>

        {/* Pickup Form */}
        {showForm && userId && (
          <div className="mb-6 sm:mb-8">
            <PickupForm userId={userId} onSuccess={handleSuccess} />
          </div>
        )}

        {/* Pickups List */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              All Requests
            </h2>
            {pickups.length > 0 && (
              <span className="text-xs sm:text-sm text-white/60 font-medium">{pickups.length} total</span>
            )}
          </div>

          {loading ? (
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-white/60 font-medium">Loading your requests...</p>
              </div>
            </SpotlightCard>
          ) : pickups.length === 0 ? (
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 sm:p-6 bg-purple-500/10 rounded-full mb-4 sm:mb-6">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Pickup Requests Yet</h3>
                <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6 max-w-md px-4">
                  You haven't created any pickup requests. Click the button above to schedule your first e-waste pickup!
                </p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    Create First Request
                  </button>
                )}
              </div>
            </SpotlightCard>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {pickups.map((pickup) => (
                <PickupCard
                  key={pickup.id}
                  pickup={pickup}
                  onClick={() => navigate(`/user/pickup-request/${pickup.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPickups;