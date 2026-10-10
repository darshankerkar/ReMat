import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = {
  onScanSuccess: (text: string) => void;
  onClose?: () => void;
};

export default function QRScanner({ onScanSuccess, onClose }: Props) {
  const scannerId = useId().replace(/:/g, "-") || "qr-scanner-root";
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const stopScan = useCallback(async () => {
    const scanner = html5QrcodeRef.current;
    if (!scanner) return;
    html5QrcodeRef.current = null; // clear ref immediately so we don't double-stop
    setIsScanning(false);
    setCameraReady(false);
    try {
      await scanner.stop();
    } catch (_) {
        console.log(_)
    }
    try {
      scanner.clear();
    } catch (_) {
      console.log(_)
    }
  }, []);

  const startScan = useCallback(async () => {
    const element = document.getElementById(scannerId);
    if (!element || scanned) return;

    setError(null);

    // Short delay so any previous camera stream (e.g. from CameraCapture) is fully released
    await new Promise((r) => setTimeout(r, 400));

    try {
      const scanner = new Html5Qrcode(scannerId, { verbose: false });
      html5QrcodeRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) {
        setError("No camera found. Use HTTPS or localhost and allow camera access.");
        return;
      }

      // Prefer back/environment camera for QR scanning
      const backCamera = cameras.find(
        (c) =>
          /rear|back|environment/i.test(c.label) ||
          (c.label && c.label.toLowerCase().includes("back"))
      );
      const cameraId = backCamera?.id ?? cameras[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.333334,
        },
        (decodedText) => {
          // Stop camera fully before closing modal so the camera light turns off
          stopScan().then(() => {
            setScanned(true);
            onScanSuccess(decodedText);
          });
        },
        () => {
          // Scan failure (no QR in frame) - ignore, keep scanning
        }
      );

      setIsScanning(true);
      setCameraReady(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      if (
        /secure context|https|getUserMedia|NotAllowedError|NotFoundError/i.test(
          message
        )
      ) {
        setError(
          "Camera requires a secure context. Please use https://localhost (or run the app over HTTPS) and allow camera access."
        );
      } else {
        setError(message || "Camera access denied");
      }
      setIsScanning(false);
      setCameraReady(false);
    }
  }, [scannerId, scanned, onScanSuccess, stopScan]);

  useEffect(() => {
    startScan();
    return () => {
      // Unmount: stop scanner and release camera synchronously as best we can
      const scanner = html5QrcodeRef.current;
      if (scanner) {
        html5QrcodeRef.current = null;
        scanner.stop().catch(() => {}).finally(() => {
          try {
            scanner.clear();
          } catch (_) {
            console.log(_)
          }
        });
      }
    };
  }, [startScan]);

  if (scanned) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-0">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Scanner mount point - html5-qrcode injects video + canvas here */}
        <div className="relative bg-black aspect-video overflow-hidden flex items-center justify-center">
          <div
            id={scannerId}
            className="w-full h-full min-h-[240px] [&>div]:!min-h-[240px] [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full"
          />
          {/* Scan frame overlay */}
          {isScanning && cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-purple-400/50 rounded-2xl shadow-lg shadow-purple-500/20" />
            </div>
          )}
          {!cameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center text-white/80">
                <div className="w-10 h-10 border-2 border-purple-400/50 border-t-purple-400 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {error ? (
            <div className="text-center px-4 py-6 sm:py-8">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-red-400/60 mx-auto mb-3 sm:mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-white font-semibold mb-2 text-base sm:text-lg">
                Scan Failed
              </p>
              <p className="text-white/60 text-sm px-2 whitespace-pre-line">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  startScan();
                }}
                className="mt-4 sm:mt-6 px-5 py-2.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 active:bg-white/15 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors duration-200 min-h-[44px] touch-manipulation"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-3 sm:mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-white/80 text-xs sm:text-sm font-medium">
                    Scanning...
                  </span>
                </div>
                <p className="text-white/60 text-xs sm:text-sm px-4">
                  Position the QR code in the frame
                </p>
              </div>

              <button
                onClick={() => {
                  stopScan().then(() => onClose?.());
                }}
                className="w-full py-3.5 sm:py-3 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/20 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[auto] touch-manipulation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-sm sm:text-base">Stop Scanning</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
