import CameraCapture from "../components/CameraCapture";
import Confirmation from "../components/Confirmation";
import { useEffect, useRef, useState } from "react";
import MapView from "../components/MapView";
import type { Bin, DetectionResult } from "../../types";
import QRScanner from "../components/QRScanner";
import { useAuth } from "../../auth/useAuth";
import { extractBinIdFromQR } from "../utils/getBinfromQR";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DetectionResultModal from "../components/DetectionResultModal";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";
interface BinResponse {
  id: string | number;
  name: string;
  lat: string | number;
  lng: string | number;
  status: string;
  fill_level: number;
  capacity: number;
}

// Manual override points from your config
const MANUAL_OVERRIDE_POINTS: Record<string, number> = {
  // 🔋 High environmental risk
  "Battery": 80,
  "Power Bank": 90,
  "UPS": 140,

  // 🧠 High value components
  "PCB": 100,
  "Motherboard": 120,
  "Hard Disk": 70,
  "SSD": 80,
  "RAM": 40,

  // 📱 Personal electronics
  "Mobile": 90,
  "Smartphone": 95,
  "Laptop": 120,
  "Tablet": 80,
  "Smartwatch": 50,

  // 🖥️ Peripherals
  "Mouse": 15,
  "Keyboard": 25,
  "Webcam": 30,
  "Speaker": 40,
  "Earphones": 20,
  "Headphones": 35,

  // 🔌 Accessories & cables
  "Charger": 30,
  "Cable": 10,
  "Adapter": 35,
  "Extension Board": 45,

  // 🎮 Media & entertainment
  "DVD Player": 50,
  "Set Top Box": 60,
  "Game Console": 100,

  // 🖨️ Office electronics
  "Printer": 130,
  "Scanner": 90,
  "Router": 60,
  "Modem": 55,

  // 🍳 Large appliances
  "Microwave": 170,
  "Television": 200,
  "Monitor": 150
};


const UserRecycle = () => {
  const navigate = useNavigate()
  const { token } = useAuth();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [display, setDisplay] = useState<boolean>(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnLoading, setTxnLoading] = useState<boolean>(false);
  const [scannedBinId, setScannedBinId] = useState<string | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false);
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState<boolean>(false);
  const [detectionModalOpen, setDetectionModalOpen] = useState<boolean>(false);
  const [resultIsManual, setResultIsManual] = useState<boolean>(false);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const binsResp = await fetch(`${API_BASE}/api/bins/`);
        if (binsResp.ok) {
          const binsData = await binsResp.json();
            const remoteBins: Bin[] = (binsData.bins ?? []).map((b: BinResponse) => ({
              id: b.id,
              name: b.name,
              lat: Number(b.lat),
              lng: Number(b.lng),
              status: b.status,
              fill_level: b.fill_level,
              capacity: b.capacity,
            }));
          setBins(remoteBins);
          if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng]);
        }
      } catch (error) {
        console.error("Error fetching bins:", error);
      }
    };
  
    fetchBins();
  }, [API_BASE]);

  const handleCapture = async (imageData: string | Blob) => {
    setLoading(true);

    try {
      let base64Data: string;
      if (typeof imageData === "string") {
        if (imageData.startsWith("data:")) {
          base64Data = imageData.split(",")[1];
        } else {
          const response = await fetch(imageData);
          const blob = await response.blob();
          base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
          });
        }
      } else {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(imageData);
        });
      }

      if (!GROQ_API_KEY) {
        throw new Error("VITE_GROQ_API_KEY is not configured.");
      }

      const promptText = `Analyze this image for e-waste. Return ONLY valid JSON, with no markdown or extra text, using exactly these keys:
      - "is_valid_e_waste": boolean. Set false if the image is not clearly an electronic device, electronic component, cable, battery, appliance, or related e-waste.
      - "waste_type": a short name for the item, or "Invalid Object" when is_valid_e_waste is false.
      - "confidence": a number from 0 to 1.
      - "details": a concise 2-3 sentence description. For valid e-waste, explain its e-waste value, recoverable materials, or disposal concern. For invalid objects, explain that it is not identifiable as e-waste.
      - "suggested_points": an integer from 0 to 200 based on the item's e-waste value and safe recycling importance. Use 0 for invalid objects.
      Do not classify ordinary non-electronic objects as e-waste.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_VISION_MODEL,
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content: "You are a strict e-waste image classifier. Follow the requested JSON schema exactly.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${base64Data}` },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API failed: ${response.status}`);
      }
      const groqData = await response.json();
      
      let resultText = groqData.choices?.[0]?.message?.content;
      if (typeof resultText !== "string") throw new Error("Groq returned an empty analysis.");
      resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(resultText);
      const isValidEwaste = parsedData.is_valid_e_waste === true;
      const points = isValidEwaste
        ? (MANUAL_OVERRIDE_POINTS[parsedData.waste_type] || Number(parsedData.suggested_points) || 0)
        : 0;

      const data: DetectionResult = {
        waste_type: isValidEwaste ? parsedData.waste_type : "Invalid Object",
        confidence: Number(parsedData.confidence) || 0,
        base_points: points,
        points_to_earn: points,
        is_valid_e_waste: isValidEwaste,
        details: parsedData.details || "This image could not be identified as e-waste.",
      };

      setResult(data);
      setResultIsManual(false);
      setDisplay(true);
      setManualMode(false);
      setDetectionModalOpen(true); // Open detection result modal

      // fetch bins from backend
      const binsResp = await fetch(`${API_BASE}/api/bins/`);
      if (binsResp.ok) {
        const binsData = await binsResp.json();
        const remoteBins: Bin[] = (binsData.bins ?? []).map((b: BinResponse) => ({
          id: b.id,
          name: b.name,
          lat: Number(b.lat),
          lng: Number(b.lng),
          status: b.status,
          fill_level: b.fill_level,
          capacity: b.capacity,
        }));
        setBins(remoteBins);
        if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng]);
      }

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error && error.message.includes("VITE_GROQ_API_KEY")
        ? "Add VITE_GROQ_API_KEY to frontend/.env and restart the app."
        : "Failed to analyze waste with Groq. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSelection = () => {
    setManualMode(true);
    setDisplay(true);
    setDetectionModalOpen(false); // Close detection modal
  };

  const handleManualSelection = () => {
    setManualMode(true);
    setDisplay(true);
  };

  const handleManualItemConfirm = () => {
    if (!selectedItem) return;
    const manualPoints = MANUAL_OVERRIDE_POINTS[selectedItem];
    setResult({
      waste_type: selectedItem,
      confidence: 1.0,
      points_to_earn: manualPoints,
      base_points: manualPoints,
    });
    setResultIsManual(true);
    setManualMode(false);
    setDetectionModalOpen(true); // Open detection modal with manual result
  };

  const handleAccept = async () => {
    if (!result || !scannedBinId || !token) {
      toast.error("Missing required data for transaction");
      return;
    }

    setTxnLoading(true);
    try {
      // Backend: PUT /user/recycle/{binid} with RecyclePayload
      const response = await fetch(`${API_BASE}/user/recycle/${scannedBinId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          waste_type: result.waste_type,
          confidence: result.confidence ?? 0,
          base_points: result.base_points ?? undefined,
          estimated_value: result.points_to_earn ?? result.estimated_value ?? undefined,
          user_override: resultIsManual,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail ?? "Transaction failed");
      }

      const txnData = await response.json();
      toast.success(`Successfully earned ${txnData.points_earned} points!`);
      
      // Reset state
      setResult(null);
      setDisplay(false);
      setScannedBinId(null);
      setConfirmationModalOpen(false);
      navigate('/user/thankyou')
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Failed to complete transaction. Please try again.");
    } finally {
      setTxnLoading(false);
    }
  };

  const handleReject = () => {
    setConfirmationModalOpen(false);
    setScannedBinId(null);
    setDetectionModalOpen(true); // Reopen detection modal
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleCapture(file);
    }
    e.target.value = "";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">♻️</span>
            Recycle E-Waste
          </h1>
          <p className="text-white/60">Scan or select your e-waste item to start earning points</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Camera Scan Card */}
          <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-full">
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-blue-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Camera Scan</h3>
              <p className="text-sm text-white/60 mb-4">Use your camera to detect waste</p>
              <button
                onClick={() => setCameraModalOpen(true)}
                className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-200 font-semibold rounded-lg transition-all duration-200"
              >
                Open Camera
              </button>
            </div>
          </SpotlightCard>

          {/* Upload Photo Card */}
            <SpotlightCard className="bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
              <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-purple-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Photo</h3>
              <p className="text-sm text-white/60 mb-4">Choose from your gallery</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-6 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse Files
              </button>
            </div>
          </SpotlightCard>

          {/* Manual Selection Card */}
            <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 h-full">
              <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-green-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manual Select</h3>
              <p className="text-sm text-white/60 mb-4">Choose item from list</p>
              <button
                type="button"
                onClick={handleManualSelection}
                disabled={loading}
                className="px-6 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Item
              </button>
            </div>
          </SpotlightCard>
        </div>

        {/* Camera Modal */}
        {cameraModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setCameraModalOpen(false)} />
            <div className="relative w-full max-w-2xl mx-4">
              <div className="bg-transparent p-4 rounded-lg">
                <CameraCapture
                  onCapture={(img) => { handleCapture(img); setCameraModalOpen(false); }}
                  onError={(e) => toast.error(e)}
                  facingMode="environment"
                  autoStop={true}
                  autoOpen={true}
                  onClose={() => setCameraModalOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Detection Result Modal */}
        <DetectionResultModal 
          isOpen={detectionModalOpen}
          onClose={() => setDetectionModalOpen(false)}
          result={result}
          onChangeSelection={handleChangeSelection}
          onScanQR={() => {
            setDetectionModalOpen(false);
            setQrScannerModalOpen(true);
          }}
        />

        {/* QR Scanner Modal */}
        {qrScannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setQrScannerModalOpen(false)}
            />
            <div className="relative w-full max-w-3xl">
              <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    Scan Bin QR Code
                  </h3>
                  <button
                    onClick={() => setQrScannerModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <QRScanner
                  onScanSuccess={(decodedText) => {
                    const binId = extractBinIdFromQR(decodedText) ?? decodedText.trim();
                    if (!binId) {
                      toast.error("Invalid QR Code. Please try again.");
                      return;
                    }
                    setScannedBinId(binId);
                    setQrScannerModalOpen(false);
                    setDetectionModalOpen(false); // Close detection modal
                    setConfirmationModalOpen(true); // Open confirmation modal
                  }}
                  onClose={() => setQrScannerModalOpen(false)}
                />
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModalOpen && scannedBinId && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmationModalOpen(false)} />
            <div className="relative w-full max-w-2xl">
              <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-8">
                <button
                  onClick={handleReject}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Confirmation
                  result={result}
                  binId={scannedBinId}
                  binName={bins.find((b) => String(b.id) === scannedBinId)?.name}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  loading={txnLoading}
                />
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin mb-4"></div>
              <p className="text-white font-medium text-lg">Analyzing waste...</p>
              <p className="text-white/50 text-sm mt-2">This may take a few seconds</p>
            </div>
          </SpotlightCard>
        )}

        {/* Manual Mode Selection */}
        {display && manualMode && (
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select Your Item
              </h2>
              <p className="text-white/60 mb-6">Choose the e-waste item you're recycling from the list below:</p>
              
              <select 
                value={selectedItem} 
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-base mb-6 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              >
                <option value="" className="bg-gray-900">-- Choose an item --</option>
                {Object.entries(MANUAL_OVERRIDE_POINTS)
                  .sort((a, b) => b[1] - a[1])
                  .map(([item, points]) => (
                    <option key={item} value={item} className="bg-gray-900">
                      {item} - {points} points
                    </option>
                  ))}
              </select>

              <div className="flex gap-4">
                <button 
                  onClick={handleManualItemConfirm}
                  disabled={!selectedItem}
                  className="flex-1 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
                >
                  Confirm Selection
                </button>
                <button 
                  onClick={() => { 
                    setManualMode(false); 
                    setDisplay(false); 
                    setSelectedItem(""); 
                  }}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SpotlightCard>
        )}

        {/* Map Section */}
        {bins.length > 0 && (
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Nearby E-Waste Bins
              </h2>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">{bins.filter(b => b.status === 'active').length} Active</span>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '450px' }}>
              <MapView
                bins={bins}
                center={userLocation ? [userLocation.lat, userLocation.lng] : mapCenter}
                zoom={13}
                height="100%"
                userLocation={userLocation ?? undefined}
              />
            </div>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
};

export default UserRecycle;