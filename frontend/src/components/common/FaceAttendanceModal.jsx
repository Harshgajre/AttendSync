import { useState, useEffect, useRef } from "react";
import { loadFaceApiModels, extractFaceDescriptor } from "../../utils/faceApiHelper";
import { getApiUrl } from "../../config/api";

export default function FaceAttendanceModal({ isOpen, onClose, onAttendanceSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanState, setScanState] = useState("initializing"); // 'initializing', 'ready', 'scanning', 'success', 'already_marked', 'failed'
  const [statusMessage, setStatusMessage] = useState("Loading facial recognition models...");
  const [resultData, setResultData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        setScanState("initializing");
        setStatusMessage("Loading facial recognition neural engine...");
        setCameraError("");
        setResultData(null);
        setIsProcessing(false);

        await loadFaceApiModels();
        if (!isMounted) return;

        setModelsReady(true);
        setStatusMessage("Starting camera...");
        await startCamera();
        if (!isMounted) return;

        setScanState("ready");
        setStatusMessage("Align your face inside the scanner frame.");
      } catch (err) {
        if (!isMounted) return;
        console.error("Init attendance error:", err);
        setCameraError(err.message || "Failed to initialize camera or models.");
        setScanState("failed");
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
      let msg = "Could not access camera. Please allow camera permissions.";
      if (err.name === "NotAllowedError") {
        msg = "Camera permission denied. Please allow camera access in browser settings.";
      }
      setCameraError(msg);
      setScanState("failed");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Scan and verify face with backend
  const handleScanAttendance = async () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);
    setScanState("scanning");
    setStatusMessage("Scanning biometric landmarks & verifying identity...");

    try {
      // 1. Extract 128-d descriptor from live camera
      const extractResult = await extractFaceDescriptor(videoRef.current);

      if (!extractResult.success) {
        setScanState("failed");
        setStatusMessage(extractResult.message);
        setIsProcessing(false);
        return;
      }

      setStatusMessage("Comparing face with database & resolving active slot...");

      // 2. Send to backend face-scan endpoint
      const response = await fetch(getApiUrl("/api/attendance/face-scan"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceEmbedding: extractResult.descriptor,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.faceMatched) {
        setScanState("failed");
        setStatusMessage(data.message || "Face not recognized. Please register your face first.");
        setIsProcessing(false);
        return;
      }

      setResultData(data);
      stopCamera();

      if (data.alreadyMarked) {
        setScanState("already_marked");
        setStatusMessage(data.message || "Attendance already marked for this slot.");
      } else {
        setScanState("success");
        setStatusMessage(data.message || "Face Verified & Attendance Marked Successfully");
        if (onAttendanceSuccess) {
          onAttendanceSuccess(data);
        }
      }
    } catch (err) {
      console.error("Attendance scan error:", err);
      setScanState("failed");
      setStatusMessage("Server connection error during face verification.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset & Scan Again
  const handleResetScan = async () => {
    setResultData(null);
    setScanState("ready");
    setStatusMessage("Align your face inside the scanner frame.");
    await startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-[36px] p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.25)] text-white flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center text-xl transition-all"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live Face Attendance
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Face <span className="text-emerald-400">Sign-In</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Automated user identification & active slot attendance
          </p>
        </div>

        {/* Card Body: Camera or Result Display */}
        {scanState === "success" || scanState === "already_marked" ? (
          <div className="w-full bg-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center">
            {/* Status Headline */}
            <h3 className="text-2xl font-black mb-1">
              {scanState === "success"
                ? "Attendance Marked"
                : "Already Checked In"}
            </h3>
            <p
              className={`text-sm font-semibold mb-6 ${
                scanState === "success" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {resultData?.message}
            </p>

            {/* User & Slot Details Card */}
            <div className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-5 text-left space-y-3.5 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 font-medium">User Name</span>
                <span className="font-bold text-white text-base">
                  {resultData?.user?.name || "Verified User"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 font-medium">Role & Org</span>
                <span className="font-semibold text-cyan-300">
                  {resultData?.user?.role} • {resultData?.user?.collegeOrCompany}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 font-medium">Active Slot</span>
                <span className="font-bold text-emerald-400">
                  {resultData?.slot?.name || resultData?.attendance?.slotName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 font-medium">Check-In Time</span>
                <span className="font-semibold text-white">
                  {resultData?.attendance?.checkInTime || "Just Now"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Match Confidence</span>
                <span className="font-bold text-emerald-400">
                  {resultData?.similarityScore || 98}% Verified
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleResetScan}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-gray-300 hover:text-white transition"
              >
                Scan Another User
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-2xl font-bold text-white shadow-xl shadow-emerald-500/25 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera Scanner View */
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden border border-emerald-500/20 flex items-center justify-center shadow-inner">
              {cameraError ? (
                <div className="p-6 text-center text-red-400">
                  <p className="text-sm font-semibold">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Retry Camera
                  </button>
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

                  {/* Target Scanner Frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className={`w-52 h-64 sm:w-60 sm:h-72 rounded-3xl border-2 transition-all duration-300 relative flex items-center justify-center ${
                        scanState === "scanning"
                          ? "border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.7)] animate-pulse"
                          : scanState === "failed"
                          ? "border-red-400 shadow-[0_0_30px_rgba(248,113,113,0.5)]"
                          : "border-emerald-400/60 border-dashed"
                      }`}
                    >
                      {/* Corner Accents */}
                      <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                      {/* Scanning Line */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="mt-4 text-center">
              <p
                className={`text-sm font-bold flex items-center justify-center gap-2 ${
                  scanState === "failed"
                    ? "text-red-400"
                    : scanState === "scanning"
                    ? "text-emerald-300"
                    : "text-gray-300"
                }`}
              >
                {statusMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-6 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScanAttendance}
                disabled={!modelsReady || isProcessing || !!cameraError}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-xl shadow-emerald-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Verifying Identity...
                  </>
                ) : (
                  <>Scan & Mark Attendance</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
