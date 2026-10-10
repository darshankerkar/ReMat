import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import AdminPickupCard from "../components/AdminPickup/AdminPickupCard";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import { Toaster } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type Tab = "pending" | "accepted" | "rejected";

const AdminPickups = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/admin/pickup-requests`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch admin pickups");
        return res.json();
      })
      .then((data: PickupRequest[]) => setPickups(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = pickups.filter((p) => p.status === "open");
  const accepted = pickups.filter((p) => p.status === "accepted");
  const rejected = pickups.filter((p) => p.status === "rejected");

  const list = tab === "pending" ? pending : tab === "accepted" ? accepted : rejected;

  const tabConfig = [
    {
      id: "pending" as Tab,
      label: "Pending",
      count: pending.length,
      color: "blue",
      icon: "⏳"
    },
    {
      id: "accepted" as Tab,
      label: "Accepted",
      count: accepted.length,
      color: "green",
      icon: "✅"
    },
    {
      id: "rejected" as Tab,
      label: "Rejected",
      count: rejected.length,
      color: "red",
      icon: "❌"
    }
  ];

  return (
    <div className="min-h-screen pb-8">
      <Toaster />
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🔍</span>
            Pickup Requests
          </h1>
          <p className="text-white/60">Review and manage e-waste pickup requests from users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Pending */}
          <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
          </SpotlightCard>

          {/* Accepted */}
          <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Accepted</p>
            <p className="text-3xl font-bold text-white">{accepted.length}</p>
          </SpotlightCard>

          {/* Rejected */}
          <SpotlightCard className="bg-linear-to-br from-red-500/10 to-red-600/5 backdrop-blur-xl border border-red-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-white">{rejected.length}</p>
          </SpotlightCard>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 inline-flex gap-2" role="tablist">
            {tabConfig.map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                role="tab"
                aria-selected={tab === tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  ${tab === tabItem.id
                    ? `bg-${tabItem.color}-500/20 text-${tabItem.color}-300 border border-${tabItem.color}-500/30 shadow-lg`
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{tabItem.icon}</span>
                  <span className="hidden sm:inline">{tabItem.label}</span>
                  <span className={`
                    inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold
                    ${tab === tabItem.id
                      ? `bg-${tabItem.color}-500/30 text-${tabItem.color}-200`
                      : 'bg-white/10 text-white/60'
                    }
                  `}>
                    {tabItem.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {tab === "pending" ? "Pending Requests" : tab === "accepted" ? "Accepted Requests" : "Rejected Requests"}
            </h2>
            {list.length > 0 && (
              <span className="text-sm text-white/60 font-medium">{list.length} {list.length === 1 ? 'request' : 'requests'}</span>
            )}
          </div>

          {loading ? (
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-white/60 font-medium">Loading requests...</p>
              </div>
            </SpotlightCard>
          ) : list.length === 0 ? (
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-purple-500/10 rounded-full mb-6">
                  <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No {tab} requests</h3>
                <p className="text-white/60 max-w-md">
                  {tab === "pending" && "All pickup requests have been reviewed."}
                  {tab === "accepted" && "No requests have been accepted yet."}
                  {tab === "rejected" && "No requests have been rejected yet."}
                </p>
              </div>
            </SpotlightCard>
          ) : (
            <div className="space-y-4">
              {list.map((pickup) => (
                <AdminPickupCard
                  key={pickup.id}
                  pickup={pickup}
                  onClick={() => navigate(`/admin/pickup-requests/${pickup.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPickups;