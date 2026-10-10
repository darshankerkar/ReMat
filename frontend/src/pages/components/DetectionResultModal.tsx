import {type DetectionResult } from "../../types";

interface DetectionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DetectionResult | null;
  onChangeSelection: () => void;
  onScanQR: () => void;
}

const DetectionResultModal = ({ 
  isOpen, 
  onClose, 
  result, 
  onChangeSelection,
  onScanQR 
}: DetectionResultModalProps) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Detection Result
          </h2>
          
          {/* Detection Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300/70 uppercase tracking-wide font-medium mb-2">Waste Type</p>
              <p className="text-2xl font-bold text-white">{result.waste_type}</p>
            </div>
            
            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-sm text-purple-300/70 uppercase tracking-wide font-medium mb-2">Confidence</p>
              <p className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</p>
            </div>
            
            <div className={`p-6 rounded-xl border ${result.is_valid_e_waste === false ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
              <p className="text-sm text-green-300/70 uppercase tracking-wide font-medium mb-2">Points to Earn</p>
              <p className={`text-2xl font-bold ${result.is_valid_e_waste === false ? "text-red-300" : "text-green-400"}`}>
                {result.is_valid_e_waste === false ? "Invalid" : result.points_to_earn ?? result.estimated_value ?? 0}
              </p>
            </div>
          </div>

          {/* Details Section */}
          {result.details && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">About this item</h3>
              <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{result.details}</p>
            </div>
          )}

          {/* Low Confidence Warning */}
          {result.confidence < 0.40 && (
            <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-300 mb-1">Low Confidence Detection</p>
                  <p className="text-sm text-yellow-200/80 mb-3">The AI is not very confident about this detection. Consider using manual selection for better accuracy.</p>
                  <button 
                    onClick={onChangeSelection} 
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 font-semibold rounded-lg transition-all duration-200 text-sm"
                  >
                    Change Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QR Scanner Section */}
          {result.is_valid_e_waste === false ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <h3 className="mb-2 text-lg font-semibold text-red-300">Invalid object</h3>
              <p className="text-sm text-red-100/80">
                This image does not appear to show an e-waste item. Please upload a clear image of an electronic device or component.
              </p>
            </div>
          ) : (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan Bin QR Code
            </h3>
            <p className="text-white/60 text-sm mb-4">Point your camera at the QR code on the e-waste bin</p>
            
            <button
              type="button"
              onClick={onScanQR}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan QR Code
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionResultModal;