import { useState, useEffect, useRef } from "react";
import { loadFaceApiModels, extractFaceDescriptor, captureVideoSnapshot } from "../../utils/faceApiHelper";

export default function FaceEnrollmentModal({ isOpen, onClose, onEnrollComplete, role = "Student" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [detectStatus, setDetectStatus] = useState("initializing"); // 'initializing', 'ready', 'detecting', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState("Loading face detection models...");
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [capturedEmbedding, setCapturedEmbedding] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize models and start camera when opened
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        setDetectStatus("initializing");
        setStatusMessage("Loading facial recognition models...");
        setCameraError("");
        setCapturedPreview(null);
        setCapturedEmbedding(null);

        await loadFaceApiModels();
        if (!isMounted) return;

        setModelsReady(true);
        setStatusMessage("Starting camera...");
        await startCamera();
        if (!isMounted) return;

        setDetectStatus("ready");
        setStatusMessage("Position your face inside the frame.");
      } catch (err) {
        if (!isMounted) return;
        console.error("Init enrollment error:", err);
        setCameraError(err.message || "Failed to initialize face recognition.");
        setDetectStatus("error");
      }
    };

    init();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  // Start Camera
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      let msg = "Could not access camera. Please grant camera permission in your browser.";
      if (err.name === "NotAllowedError") {
        msg = "Camera permission denied. Please allow camera access in browser settings to enroll your face.";
      } else if (err.name === "NotFoundError") {
        msg = "No camera device found. Please connect a webcam.";
      }
      setCameraError(msg);
      setDetectStatus("error");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Live Continuous Check
  useEffect(() => {
    if (!isOpen || !modelsReady || capturedPreview || cameraError) return;

    const checkInterval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isProcessing) return;

      try {
        const result = await extractFaceDescriptor(videoRef.current);
        if (result.success) {
          setDetectStatus("detected");
          setStatusMessage("Face Detected Perfectly! Click Capture.");
        } else if (result.reason === "MULTIPLE_FACES") {
          setDetectStatus("warning");
          setStatusMessage("Multiple faces detected! Keep only one face in frame.");
        } else if (result.reason === "NO_FACE") {
          setDetectStatus("ready");
          setStatusMessage("Position your face inside the frame.");
        }
      } catch (err) {
        // quiet background frame check
      }
    }, 400);

    return () => clearInterval(checkInterval);
  }, [isOpen, modelsReady, capturedPreview, cameraError, isProcessing]);

  // Capture & Extract Face Biometrics
  const handleCapture = async () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);
    setDetectStatus("detecting");
    setStatusMessage("Scanning biometric features...");

    try {
      const result = await extractFaceDescriptor(videoRef.current);

      if (!result.success) {
        setDetectStatus("error");
        setStatusMessage(result.message);
        setIsProcessing(false);
        return;
      }

      const snapshot = captureVideoSnapshot(videoRef.current);
      setCapturedPreview(snapshot);
      setCapturedEmbedding(result.descriptor);
      setDetectStatus("success");
      setStatusMessage("Face Biometrics Captured Successfully! ✓");
      stopCamera();
    } catch (err) {
      console.error("Capture error:", err);
      setDetectStatus("error");
      setStatusMessage("Failed to process face biometrics. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Retake
  const handleRetake = async () => {
    setCapturedPreview(null);
    setCapturedEmbedding(null);
    setDetectStatus("ready");
    setStatusMessage("Position your face inside the frame.");
    await startCamera();
  };

  // Confirm Enrollment
  const handleConfirm = () => {
    if (!capturedEmbedding || !capturedPreview) return;
    onEnrollComplete({
      faceEmbedding: capturedEmbedding,
      faceImage: capturedPreview,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-[36px] p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.25)] text-white flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center text-xl transition-all"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Biometric Enrollment
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Scan & Register <span className="text-cyan-400">Face</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Enroll your facial data for instant 1-click slot attendance
          </p>
        </div>

        {/* Camera / Preview Box */}
        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden border border-cyan-500/20 flex items-center justify-center shadow-inner">
          {cameraError ? (
            <div className="p-6 text-center text-red-400">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm font-semibold">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Retry Camera
              </button>
            </div>
          ) : capturedPreview ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={capturedPreview}
                alt="Enrolled Face Preview"
                className="w-full h-full object-cover rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-4">
                <span className="bg-emerald-500/90 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  ✓ Face Biometrics Ready
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* High-tech Face Oval Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-48 h-60 sm:w-56 sm:h-68 rounded-[50%] border-2 transition-all duration-300 relative flex items-center justify-center ${
                    detectStatus === "detected"
                      ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] scale-105"
                      : detectStatus === "warning"
                      ? "border-red-400 shadow-[0_0_30px_rgba(248,113,113,0.5)]"
                      : detectStatus === "detecting"
                      ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse"
                      : "border-cyan-400/50 border-dashed"
                  }`}
                >
                  {/* Corner Marks */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

                  {/* Scanning Laser Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Status Feedback */}
        <div className="mt-4 text-center">
          <p
            className={`text-sm font-bold flex items-center justify-center gap-2 ${
              detectStatus === "detected" || detectStatus === "success"
                ? "text-emerald-400"
                : detectStatus === "warning" || detectStatus === "error"
                ? "text-red-400"
                : "text-cyan-300"
            }`}
          >
            {detectStatus === "detected" && "🟢 "}
            {detectStatus === "warning" && "🔴 "}
            {detectStatus === "detecting" && "⚡ "}
            {statusMessage}
          </p>
        </div>

        {/* Action Controls */}
        <div className="w-full mt-6 flex gap-4">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-gray-300 hover:text-white transition"
              >
                ↺ Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-2xl font-bold text-white shadow-xl shadow-cyan-500/25 transition transform active:scale-95"
              >
                Use This Face ✓
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={!modelsReady || isProcessing || !!cameraError}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-xl shadow-cyan-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Scanning...
                  </>
                ) : (
                  <>📸 Capture Face</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
