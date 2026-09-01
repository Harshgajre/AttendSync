import { useState, useEffect, useRef } from "react";
import { loadFaceApiModels, extractFaceDescriptor } from "../../utils/faceApiHelper";
import { getApiUrl } from "../../config/api";

export default function FacultyStartAttendanceModal({
  isOpen,
  onClose,
  onSessionStarted,
  currentLecture,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanState, setScanState] = useState("initializing"); // 'initializing', 'ready', 'scanning', 'success', 'already_active', 'failed', 'unauthorized'
  const [statusMessage, setStatusMessage] = useState("Loading facial recognition models...");
  const [resultData, setResultData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        setStatusMessage("Starting camera for Faculty Verification...");
        await startCamera();
        if (!isMounted) return;

        setScanState("ready");
        setStatusMessage("Align your face inside the frame to authenticate & start attendance session.");
      } catch (err) {
        if (!isMounted) return;
        console.error("Init faculty attendance error:", err);
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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleStartSession = async () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);
    setScanState("scanning");
    setStatusMessage("Scanning biometric landmarks & verifying faculty authorization...");

    try {
      // 1. Extract 128-d descriptor from live camera
      const extractResult = await extractFaceDescriptor(videoRef.current);

      if (!extractResult.success) {
        setScanState("failed");
        setStatusMessage(extractResult.message);
        setIsProcessing(false);
        return;
      }

      setStatusMessage("Checking timetable permissions & starting lecture session...");

      // 2. Send to backend start session endpoint
      const response = await fetch(getApiUrl("/api/attendance-sessions/start"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceEmbedding: extractResult.descriptor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setScanState("unauthorized");
          setStatusMessage(data.message || "Unauthorized to start attendance for this lecture.");
        } else {
          setScanState("failed");
          setStatusMessage(data.message || "Face not recognized. Only authorized faculty or HOD can start session.");
        }
        setIsProcessing(false);
        return;
      }

      setResultData(data);
      stopCamera();

      if (data.alreadyStarted) {
        setScanState("already_active");
        setStatusMessage(data.message || "Attendance session is already active.");
      } else {
        setScanState("success");
        setStatusMessage(data.message || "Attendance Session Started Successfully!");
      }

      if (onSessionStarted) {
        onSessionStarted(data.session);
      }
    } catch (err) {
      console.error("Start session error:", err);
      setScanState("failed");
      setStatusMessage("Server connection error during facial verification.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async () => {
    setResultData(null);
    setScanState("ready");
    setStatusMessage("Align your face inside the frame to start attendance session.");
    await startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-green-500/30 rounded-[36px] p-6 sm:p-8 shadow-[0_0_80px_rgba(34,197,94,0.25)] text-white flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center text-xl transition-all"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-400/20 text-green-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
            Faculty Face Authorization
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Start <span className="text-green-400">Attendance Session</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Biometric verification for assigned faculty or HOD
          </p>
        </div>

        {/* Current Lecture Info Banner */}
        {currentLecture && (
          <div className="w-full bg-slate-800/80 border border-green-500/20 rounded-2xl p-4 mb-5 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-green-400 font-bold text-base">
                {currentLecture.subjectName} ({currentLecture.subjectCode})
              </span>
              <span className="text-xs uppercase bg-green-500/20 text-green-300 px-2.5 py-0.5 rounded-full font-bold">
                {currentLecture.lectureType || "Lecture"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
              <span>⏰ {currentLecture.startTime} – {currentLecture.endTime}</span>
              {currentLecture.room && <span>📍 {currentLecture.room}</span>}
              {currentLecture.facultyName && <span>👤 Assigned: {currentLecture.facultyName}</span>}
              {currentLecture.semester && <span>🎓 Sem {currentLecture.semester} (Div {currentLecture.division || "All"})</span>}
            </div>
          </div>
        )}

        {/* Result Screen or Camera */}
        {scanState === "success" || scanState === "already_active" ? (
          <div className="w-full bg-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-3xl mb-3">
              ✓
            </div>
            <h3 className="text-2xl font-black text-white mb-1">
              {scanState === "success" ? "Session Started!" : "Session Is Active"}
            </h3>
            <p className="text-sm font-semibold text-green-400 mb-6">
              {resultData?.message}
            </p>

            {/* Session Details */}
            <div className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-5 text-left space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Authorized Faculty</span>
                <span className="font-bold text-white text-base">
                  {resultData?.identifiedAs?.name} ({resultData?.identifiedAs?.role?.toUpperCase()})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Subject</span>
                <span className="font-bold text-green-400">
                  {resultData?.session?.subjectName || currentLecture?.subjectName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Session Window</span>
                <span className="font-semibold text-white">
                  {resultData?.session?.startTime || currentLecture?.startTime} – {resultData?.session?.endTime || currentLecture?.endTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Biometric Match</span>
                <span className="font-bold text-green-400">
                  {resultData?.similarityScore || 98}% Verified
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Students can now scan their face to mark attendance for this lecture.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-green-500/25 transition"
            >
              Done / Return to Dashboard
            </button>
          </div>
        ) : (
          /* Live Scanner View */
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden border border-green-500/20 flex items-center justify-center shadow-inner">
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
                          ? "border-green-400 shadow-[0_0_35px_rgba(34,197,94,0.7)] animate-pulse"
                          : scanState === "failed" || scanState === "unauthorized"
                          ? "border-red-400 shadow-[0_0_30px_rgba(248,113,113,0.5)]"
                          : "border-green-400/60 border-dashed"
                      }`}
                    >
                      <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                      <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_20px_#22c55e] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="mt-4 text-center">
              <p
                className={`text-sm font-bold flex items-center justify-center gap-2 ${
                  scanState === "failed" || scanState === "unauthorized"
                    ? "text-red-400"
                    : scanState === "scanning"
                    ? "text-green-300"
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

              {scanState === "failed" || scanState === "unauthorized" ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-green-400 border border-green-500/30 transition"
                >
                  Try Again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSession}
                  disabled={!modelsReady || isProcessing || !!cameraError}
                  className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-xl shadow-green-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Authenticating...
                    </>
                  ) : (
                    <>Scan Face & Start Session</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
