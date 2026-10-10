import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import SpotlightCard from "../components/UIComponents/SpotlightCard";

const PAGE_SIZE = 10;

type Transaction = {
  id: string;
  waste_type: string;
  bin_id: string;
  created_at: string;
  points_awarded: number;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const { profile } = useAuth();

  const userId = profile?.uid;

  // Fetch all transactions for stats calculation
  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";
        const res = await fetch(
          `${API_BASE}/user/transactions/${userId}?page=1&limit=10000`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch all transactions");
        }

        const data = await res.json();
        setAllTransactions(data);
      } catch (err) {
        console.error(err);
        setAllTransactions([]);
      }
    };

    if (userId) fetchAllTransactions();
  }, [userId]);

  // Fetch paginated transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";
        const res = await fetch(
          `${API_BASE}/user/transactions/${userId}?page=${page}&limit=${PAGE_SIZE}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTransactions();
  }, [userId, page]);

  // Calculate points for different time periods
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pointsThisWeek = allTransactions
    .filter(txn => new Date(txn.created_at) >= startOfWeek)
    .reduce((sum, txn) => sum + txn.points_awarded, 0);

  const pointsThisMonth = allTransactions
    .filter(txn => new Date(txn.created_at) >= startOfMonth)
    .reduce((sum, txn) => sum + txn.points_awarded, 0);

  const pointsAllTime = allTransactions.reduce((sum, txn) => sum + txn.points_awarded, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
          <div className="text-white text-base sm:text-lg font-medium">Loading transactions… ♻️</div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0 && page === 1) {
    return (
      <div className="min-h-screen pb-6">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              <div className="px-5 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Your Transactions 📊
                </h1>
                <p className="text-sm sm:text-base text-white/60">Track your recycling history and points earned</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12">
            <div className="text-center">
              <div className="text-8xl mb-6">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-3">No Transactions Yet</h3>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Start recycling e-waste to earn points and see your transaction history here!
              </p>
              <div className="inline-block px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium">Planet still waiting 🌱</p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="px-5 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Your Transactions 📊
                  </h1>
                  <p className="text-sm sm:text-base text-white/60">Track your recycling history and points earned</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-6 py-4 bg-linear-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-green-300/80 uppercase tracking-wider font-semibold mb-1">All Time</p>
                    <p className="text-3xl font-bold text-green-400">+{pointsAllTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* This Week */}
          <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {/* <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div> */}
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">This Week</p>
            <p className="text-3xl font-bold text-white">+{pointsThisWeek}</p>
          </SpotlightCard>

          {/* This Month */}
          <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">This Month</p>
            <p className="text-3xl font-bold text-white">+{pointsThisMonth}</p>
          </SpotlightCard>

          {/* All Time */}
          <SpotlightCard className="bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">All Time</p>
            <p className="text-3xl font-bold text-white">+{pointsAllTime}</p>
          </SpotlightCard>
        </div>

        {/* Transactions List */}
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base sm:text-lg font-semibold text-white">Recent Transactions</h3>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {transactions.map((txn, index) => (
              <SpotlightCard
                key={txn.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4 sm:p-5 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">#{(page - 1) * PAGE_SIZE + index + 1}</span>
                    </div>
                    
                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white capitalize text-lg">
                          {txn.waste_type}
                        </p>
                        <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs font-semibold text-green-400">
                          Recycled
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="font-mono">Bin: {txn.bin_id}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{new Date(txn.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="shrink-0 px-5 py-3 bg-linear-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg group-hover:scale-105 transition-transform duration-300">
                    <p className="text-xs text-green-300/80 uppercase tracking-wider font-semibold mb-0.5">Points</p>
                    <p className="text-2xl font-bold text-green-400">+{txn.points_awarded}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </SpotlightCard>

        {/* Pagination Controls */}
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-full sm:w-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 border border-white/20 disabled:border-white/10 rounded-lg font-semibold text-white disabled:text-white/30 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5 group-disabled:opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 bg-linear-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg">
              <span className="text-white/60 text-sm font-medium">Page </span>
              <span className="text-white font-bold text-lg">{page}</span>
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={transactions.length < PAGE_SIZE}
              className="w-full sm:w-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 border border-white/20 disabled:border-white/10 rounded-lg font-semibold text-white disabled:text-white/30 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              Next
              <svg className="w-5 h-5 group-disabled:opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default Transactions;