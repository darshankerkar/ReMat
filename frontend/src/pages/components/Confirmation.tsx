import type { DetectionResult } from "../../types";

type ConfirmationProps = {
  result: DetectionResult;
  binId: string;
  binName?: string;
  onAccept: () => void | Promise<void>;
  onReject: () => void;
  loading?: boolean;
};

const Confirmation = ({
  result,
  binId,
  binName,
  onAccept,
  onReject,
  loading = false,
}: ConfirmationProps) => {
  const pointsToEarn = result.points_to_earn ?? result.estimated_value ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-green-400 to-emerald-500 rounded-full mb-3 sm:mb-4 shadow-lg shadow-green-500/30">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">Confirm Transaction</h2>
        <p className="text-white/60 text-sm sm:text-base px-4">Review your recycling details before proceeding</p>
      </div>

      {/* Transaction Details Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Waste Type */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Waste Type</p>
              <p className="text-base sm:text-lg font-semibold text-white truncate">{result.waste_type}</p>
            </div>
          </div>
        </div>

        {/* Points Grid - Better mobile layout */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-[10px] sm:text-xs text-purple-300/70 uppercase tracking-wide font-medium mb-0.5 sm:mb-1">Base Points</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{result.base_points ?? result.estimated_value ?? 0}</p>
          </div>
          
          <div className="p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-[10px] sm:text-xs text-green-300/70 uppercase tracking-wide font-medium mb-0.5 sm:mb-1">You'll Earn</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">+{pointsToEarn}</p>
          </div>
        </div>

        {/* Confidence */}
        <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide font-medium">Detection Confidence</p>
            <span className="text-xs sm:text-sm font-bold text-white">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Bin Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Recycling Bin</p>
            <p className="text-sm sm:text-base font-semibold text-white truncate">{binName || `Bin #${binId}`}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button 
          onClick={onReject}
          disabled={loading}
          className="w-full sm:flex-1 px-6 py-3.5 sm:py-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group min-h-[52px] sm:min-h-[auto] touch-manipulation"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm sm:text-base">Cancel</span>
        </button>
        
        <button 
          onClick={onAccept}
          disabled={loading}
          className="w-full sm:flex-1 px-6 py-3.5 sm:py-4 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px] sm:min-h-[auto] touch-manipulation"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm sm:text-base">Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm sm:text-base">Confirm & Earn Points</span>
            </>
          )}
        </button>
      </div>

      {/* Info Banner - Compact on mobile */}
      <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed">
          By confirming, you agree that the waste has been properly disposed in the designated bin. Points will be credited to your account instantly.
        </p>
      </div>
    </div>
  );
};

export default Confirmation;