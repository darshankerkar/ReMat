import { useEffect, useState } from "react";
import SpotlightCard from "../../components/UIComponents/SpotlightCard";
// import { useAuth } from "../../../auth/useAuth";
import toast, { Toaster } from "react-hot-toast";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";

type WasteDistribution = {
  waste_type: string;
  count: number;
  total_points: number;
  percentage: number;
};

type TimelineData = {
  date: string;
  count: number;
  points: number;
};

type Transaction = {
  id: string;
  waste_type: string;
  bin_id: string;
  created_at: string;
  points_awarded: number;
  user_id: string;
};

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   points: number;
// };

type TimeFilter = "day" | "week" | "month" | "year" | "all";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  const [wasteDistribution, setWasteDistribution] = useState<WasteDistribution[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get leaderboard to get all users
        const usersRes = await fetch(`${API_BASE}/user/leaderboard?limit=1000`);
        
        if (!usersRes.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await usersRes.json();
        // setUsers(usersData);

        // Fetch transactions for all users
        const allTxns: Transaction[] = [];
        
        for (const user of usersData) {
          try {
            const txnRes = await fetch(
              `${API_BASE}/user/transactions/${user.id}?page=1&limit=10000`
            );
            
            if (txnRes.ok) {
              const txnData = await txnRes.json();
              allTxns.push(...txnData);
            }
          } catch (err) {
            console.error(`Error fetching transactions for user ${user.id}:`, err);
          }
        }

        setAllTransactions(allTxns);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        toast.error("Error fetching analytics data.")
        setAllTransactions([]);
        // setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data based on time filter
  useEffect(() => {
    if (allTransactions.length === 0) return;

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case "day":
        filterDate.setDate(now.getDate() - 1);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        filterDate.setFullYear(2000);
        break;
    }

    const filtered = allTransactions.filter(
      (t) => new Date(t.created_at) >= filterDate
    );

    // Calculate waste distribution
    const distributionMap: { [key: string]: { count: number; points: number } } = {};
    filtered.forEach((t) => {
      if (!distributionMap[t.waste_type]) {
        distributionMap[t.waste_type] = { count: 0, points: 0 };
      }
      distributionMap[t.waste_type].count += 1;
      distributionMap[t.waste_type].points += t.points_awarded;
    });

    const total = filtered.length;
    const distribution: WasteDistribution[] = Object.entries(distributionMap)
      .map(([waste_type, data]) => ({
        waste_type,
        count: data.count,
        total_points: data.points,
        percentage: (data.count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    setWasteDistribution(distribution);

    // Calculate timeline data
    const timelineMap: { [key: string]: { count: number; points: number } } = {};
    filtered.forEach((t) => {
      const date = new Date(t.created_at);
      const dateKey = date.toISOString().split("T")[0];
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { count: 0, points: 0 };
      }
      timelineMap[dateKey].count += 1;
      timelineMap[dateKey].points += t.points_awarded;
    });

    const timeline: TimelineData[] = Object.entries(timelineMap)
      .map(([date, data]) => ({
        date,
        count: data.count,
        points: data.points,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setTimelineData(timeline);
  }, [allTransactions, timeFilter]);

  // Calculate totals
  const totalItems = allTransactions.length;
  const totalPoints = allTransactions.reduce((sum, t) => sum + t.points_awarded, 0);
  const uniqueUsers = new Set(allTransactions.map((t) => t.user_id)).size;
  const avgPointsPerItem = totalItems > 0 ? Math.round(totalPoints / totalItems) : 0;

  // Colors for charts
  const chartColors = [
    "rgba(16, 185, 129, 0.8)", // green
    "rgba(59, 130, 246, 0.8)", // blue
    "rgba(168, 85, 247, 0.8)", // purple
    "rgba(249, 115, 22, 0.8)", // orange
    "rgba(236, 72, 153, 0.8)", // pink
    "rgba(234, 179, 8, 0.8)", // yellow
    "rgba(20, 184, 166, 0.8)", // teal
    "rgba(239, 68, 68, 0.8)", // red
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-lg font-medium">Loading analytics…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Toaster />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    📊 Collection Analytics
                  </h1>
                  <p className="text-base text-white/60">
                    Track waste collection trends and performance metrics
                  </p>
                </div>

                {/* Time Filter */}
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
                  {(["day", "week", "month", "year", "all"] as TimeFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        timeFilter === filter
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Total Items</p>
            <p className="text-3xl font-bold text-white">{totalItems.toLocaleString()}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Total Points</p>
            <p className="text-3xl font-bold text-white">{totalPoints.toLocaleString()}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Active Users</p>
            <p className="text-3xl font-bold text-white">{uniqueUsers}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Avg Points/Item</p>
            <p className="text-3xl font-bold text-white">{avgPointsPerItem}</p>
          </SpotlightCard>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Waste Type Distribution - Pie Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full">
              <SpotlightCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Waste Type Distribution
                </h2>

                {wasteDistribution.length > 0 ? (
                  <div className="flex flex-col items-center">
                    {/* Pie Chart SVG */}
                    <svg viewBox="0 0 200 200" className="w-64 h-64 mb-6">
                      {wasteDistribution.map((item, index) => {
                        let currentAngle = 0;
                        for (let i = 0; i < index; i++) {
                          currentAngle += (wasteDistribution[i].percentage / 100) * 360;
                        }
                        const angle = (item.percentage / 100) * 360;
                        const largeArc = angle > 180 ? 1 : 0;

                        const startAngle = (currentAngle - 90) * (Math.PI / 180);
                        const endAngle = (currentAngle + angle - 90) * (Math.PI / 180);

                        const x1 = 100 + 80 * Math.cos(startAngle);
                        const y1 = 100 + 80 * Math.sin(startAngle);
                        const x2 = 100 + 80 * Math.cos(endAngle);
                        const y2 = 100 + 80 * Math.sin(endAngle);

                        const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        return (
                          <g key={item.waste_type}>
                            <path
                              d={pathData}
                              fill={chartColors[index % chartColors.length]}
                              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="1"
                            />
                          </g>
                        );
                      })}
                      <circle cx="100" cy="100" r="50" fill="rgba(0,0,0,0.4)" />
                    </svg>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {wasteDistribution.map((item, index) => (
                        <div
                          key={item.waste_type}
                          className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{item.waste_type}</p>
                            <p className="text-white/50 text-xs">
                              {item.count} ({item.percentage.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">
                    No data available
                  </div>
                )}
              </SpotlightCard>
            </div>

          {/* Points by Waste Type - Bar Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full">
              <SpotlightCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Points by Waste Type
                </h2>

                {wasteDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {wasteDistribution.map((item, index) => {
                      const maxPoints = Math.max(...wasteDistribution.map((d) => d.total_points));
                      const widthPercent = (item.total_points / maxPoints) * 100;

                      return (
                        <div key={item.waste_type} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white font-medium">{item.waste_type}</span>
                            <span className="text-white/60">{item.total_points.toLocaleString()} pts</span>
                          </div>
                          <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                              style={{
                                width: `${widthPercent}%`,
                                backgroundColor: chartColors[index % chartColors.length],
                              }}
                            >
                              {widthPercent > 15 && (
                                <span className="text-white text-xs font-semibold">
                                  {item.count} items
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">
                    No data available
                  </div>
                )}
              </SpotlightCard>
            </div>
        </div>

        {/* Timeline Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <SpotlightCard>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Collection Timeline
              </h2>

              {timelineData.length > 0 ? (
                <div className="space-y-6">
                  {/* Line Chart */}
                  <div className="relative h-64 bg-white/5 rounded-xl p-4">
                    <svg viewBox="0 0 800 200" className="w-full h-full">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={i * 50}
                          x2="800"
                          y2={i * 50}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Line path */}
                      {timelineData.length > 1 && (() => {
                        const maxCount = Math.max(...timelineData.map((d) => d.count));
                        const points = timelineData.map((d, i) => {
                          const x = (i / (timelineData.length - 1)) * 800;
                          const y = 200 - (d.count / maxCount) * 180;
                          return `${x},${y}`;
                        });

                        return (
                          <>
                            {/* Area fill */}
                            <path
                              d={`M 0,200 L ${points.join(" L ")} L 800,200 Z`}
                              fill="url(#gradient)"
                              opacity="0.3"
                            />
                            {/* Line */}
                            <polyline
                              points={points.join(" ")}
                              fill="none"
                              stroke="rgba(168, 85, 247, 0.8)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Points */}
                            {timelineData.map((d, i) => {
                              const x = (i / (timelineData.length - 1)) * 800;
                              const y = 200 - (d.count / maxCount) * 180;
                              return (
                                <circle
                                  key={i}
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill="rgba(168, 85, 247, 1)"
                                  className="hover:r-6 transition-all cursor-pointer"
                                />
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                          <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Timeline Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                    {timelineData.slice().reverse().map((item) => (
                      <div
                        key={item.date}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <p className="text-white/50 text-xs mb-1">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-white font-semibold">{item.count} items</p>
                        <p className="text-purple-400 text-sm">{item.points} pts</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-white/40">
                  No timeline data available
                </div>
              )}
            </SpotlightCard>
          </div>
      </div>
    </div>
  );
};

export default Analytics;