import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SpotlightCard from "./components/UIComponents/SpotlightCard";
import { Toaster } from "react-hot-toast";

type ConfettiPiece = {
  left: string;
  top: string;
  color: string;
  delay: string;
  duration: string;
};

const CONFETTI_COLORS = [
  "#22c55e",
  "#10b981",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
];


function createConfettiPieces(): ConfettiPiece[] {
  return Array.from({ length: 30 }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `-${Math.random() * 20}%`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
  }));
}

const ThankYouPage = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [confetti] = useState<ConfettiPiece[]>(createConfettiPieces);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-none relative overflow-hidden">
        <Toaster />
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-600/10 animate-pulse"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map((c, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-fall"
                style={{
                left: c.left,
                top: c.top,
                backgroundColor: c.color,
                animationDelay: c.delay,
                animationDuration: c.duration,
                }}
            />
            ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Main Success Card */}
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 mb-8 text-center">
          {/* Success Icon */}
          <div className="relative mx-auto mb-8 w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Thank You! 🌍
          </h1>
          <p className="text-xl sm:text-2xl text-green-400 font-semibold mb-6">
            You've Made a Real Impact!
          </p>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Your responsible e-waste recycling helps protect our planet and contributes to a sustainable future.
          </p>
        </SpotlightCard>

        {/* Impact Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* CO2 Reduction */}
          <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 text-center group hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-2">CO₂</p>
            <p className="text-sm text-white/60">Emissions Prevented</p>
          </SpotlightCard>

          {/* Resources Saved */}
          <SpotlightCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 text-center group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-2">Metals</p>
            <p className="text-sm text-white/60">Recovered & Reused</p>
          </SpotlightCard>

          {/* Waste Diverted */}
          <SpotlightCard className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-xl border border-amber-500/20 rounded-xl p-6 text-center group hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-2">Waste</p>
            <p className="text-sm text-white/60">Kept from Landfills</p>
          </SpotlightCard>
        </div>

        {/* Educational Content */}
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 sm:p-10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full"></span>
            Why E-Waste Recycling Matters
          </h2>
          
          <div className="space-y-6">
            {/* Impact Point 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Reduces Carbon Emissions</h3>
                <p className="text-white/60 leading-relaxed">
                  Recycling e-waste prevents harmful greenhouse gases from being released into the atmosphere. 
                  Each recycled device can save up to <span className="text-green-400 font-semibold">1.5 tons of CO₂ emissions</span> compared to manufacturing new products from raw materials.
                </p>
              </div>
            </div>

            {/* Impact Point 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">♻️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Conserves Precious Resources</h3>
                <p className="text-white/60 leading-relaxed">
                  Electronic devices contain valuable metals like gold, silver, copper, and rare earth elements. 
                  Recycling recovers <span className="text-blue-400 font-semibold">up to 95% of these materials</span>, reducing the need for destructive mining operations.
                </p>
              </div>
            </div>

            {/* Impact Point 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Protects Our Environment</h3>
                <p className="text-white/60 leading-relaxed">
                  E-waste contains toxic substances like lead, mercury, and cadmium. Proper recycling prevents these 
                  hazardous materials from contaminating soil and water, protecting ecosystems and human health.
                </p>
              </div>
            </div>

            {/* Impact Point 4 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Supports Circular Economy</h3>
                <p className="text-white/60 leading-relaxed">
                  Your recycling contribution helps build a sustainable circular economy where materials are continuously 
                  reused, reducing waste and creating <span className="text-purple-400 font-semibold">green jobs</span> in the recycling industry.
                </p>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Call to Action Box */}
        <SpotlightCard className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-8 sm:p-10 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Together, We're Making a Difference! 🌍
            </h2>
            <p className="text-green-50/90 mb-8 text-base sm:text-lg max-w-2xl mx-auto">
              Every item you recycle contributes to a cleaner planet and a sustainable future for generations to come.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/user/dashboard")}
                className="px-8 py-4 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/user/recycle")}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                Recycle More Items
              </button>
            </div>
          </div>
        </SpotlightCard>

        {/* Fun Fact */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-xl">💚</span>
            <p className="text-sm text-white/60">
              <span className="text-green-400 font-semibold">Fun Fact:</span> Recycling 1 million laptops saves the energy equivalent to powering 3,500 homes for a year!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ThankYouPage;