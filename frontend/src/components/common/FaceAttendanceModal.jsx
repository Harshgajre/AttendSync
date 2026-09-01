import { useState, useEffect, useRef } from "react";
import { loadFaceApiModels, extractFaceDescriptor } from "../../utils/faceApiHelper";
import { getApiUrl } from "../../config/api";

export default function FaceAttendanceModal({ isOpen, onClose, onAttendanceSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanState, setScanState] = useState("initializing"); // 'initializing', 'ready', 'scanning', 'success', 'already_marked', 'failed', 'ineligible', 'no_session'
  const [statusMessage, setStatusMessage] = useState("Loading facial recognition models...");
  const [resultData, setResultData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSessionInfo, setCurrentSessionInfo] = useState(null);

  // Check current session info on open
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const checkCurrentSession = async () => {
      try {
        const res = await fetch(getApiUrl("/api/attendance-sessions/current"));
        const data = await res.json();
        if (isMounted && data.success) {
          setCurrentSessionInfo(data);
        }
      } catch (err) {
        console.error("Failed to check current session:", err);
      }
    };

    const init = async () => {
      try {
        setScanState("initializing");
        setStatusMessage("Loading facial recognition neural engine...");
        setCameraError("");
        setResultData(null);
        setIsProcessing(false);

        await checkCurrentSession();
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

      setStatusMessage("Comparing face descriptor with database & checking lecture session...");

      // 2. Send to student face-scan endpoint
      const response = await fetch(getApiUrl("/api/attendance-sessions/student-face-scan"), {
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
          // Ineligible (e.g. wrong semester/division)
          setScanState("ineligible");
          setStatusMessage(data.message || "You are not eligible for this lecture session.");
        } else if (response.status === 400 && !data.faceMatched && data.currentLecture) {
          // Faculty has not started session
          setScanState("no_session");
          setStatusMessage(data.message || "Attendance session is not active. Please wait for faculty to start it.");
        } else {
          setScanState("failed");
          setStatusMessage(data.message || "Face not recognized. Please register your face first.");
        }
        setIsProcessing(false);
        return;
      }

      setResultData(data);
      stopCamera();

      if (data.alreadyMarked) {
        setScanState("already_marked");
        setStatusMessage(data.message || "Attendance already marked for this lecture.");
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

  const lecture = currentSessionInfo?.currentLecture;
  const isSessionActive = currentSessionInfo?.sessionStarted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-[36px] p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.25)] text-white flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center text-xl transition-all"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Lecture Face Attendance
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Face <span className="text-cyan-400">Verification</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Automated biometric sign-in for active timetable lecture
          </p>
        </div>

        {/* Lecture Session Info Widget */}
        {lecture ? (
          <div className={`w-full border rounded-2xl p-3.5 mb-4 text-xs ${
            isSessionActive
              ? "bg-cyan-950/40 border-cyan-500/30"
              : "bg-amber-950/30 border-amber-500/30"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-sm">
                {lecture.subjectName} ({lecture.subjectCode})
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isSessionActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}>
                {isSessionActive ? "● Session Active" : "Waiting for Faculty"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 text-gray-300">
              <span>⏰ {lecture.startTime} – {lecture.endTime}</span>
              {lecture.facultyName && <span>👤 Prof: {lecture.facultyName}</span>}
              {lecture.room && <span>📍 {lecture.room}</span>}
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-800/60 border border-white/10 rounded-2xl p-3 mb-4 text-center text-xs text-gray-400">
            No lecture currently scheduled in timetable.
          </div>
        )}

        {/* Result Screen or Live Camera */}
        {scanState === "success" || scanState === "already_marked" ? (
          <div className="w-full bg-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-3">
              ✓
            </div>
            <h3 className="text-2xl font-black mb-1">
              {scanState === "success" ? "Attendance Marked!" : "Already Checked In"}
            </h3>
            <p
              className={`text-sm font-semibold mb-6 ${
                scanState === "success" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {resultData?.message}
            </p>

            {/* Student & Lecture Details Card */}
            <div className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-5 text-left space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Student Name</span>
                <span className="font-bold text-white text-base">
                  {resultData?.user?.name || "Verified Student"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Subject</span>
                <span className="font-bold text-cyan-400">
                  {resultData?.lecture?.subjectName || resultData?.attendance?.subjectName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Lecture Time</span>
                <span className="font-semibold text-white">
                  {resultData?.lecture?.startTime || resultData?.attendance?.lectureStartTime} – {resultData?.lecture?.endTime || resultData?.attendance?.lectureEndTime}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Faculty</span>
                <span className="font-semibold text-gray-300">
                  {resultData?.lecture?.faculty || resultData?.attendance?.facultyName || "Assigned Faculty"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-gray-400">Check-In Time</span>
                <span className="font-semibold text-white">
                  {resultData?.attendance?.checkInTime || "Just Now"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Match Confidence</span>
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
                Scan Another Student
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-2xl font-bold text-white shadow-xl shadow-cyan-500/25 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera Scanner View */
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden border border-cyan-500/20 flex items-center justify-center shadow-inner">
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
                          ? "border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.7)] animate-pulse"
                          : scanState === "failed" || scanState === "ineligible" || scanState === "no_session"
                          ? "border-red-400 shadow-[0_0_30px_rgba(248,113,113,0.5)]"
                          : "border-cyan-400/60 border-dashed"
                      }`}
                    >
                      <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                      <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="mt-4 text-center">
              <p
                className={`text-sm font-bold flex items-center justify-center gap-2 ${
                  scanState === "failed" || scanState === "ineligible" || scanState === "no_session"
                    ? "text-red-400"
                    : scanState === "scanning"
                    ? "text-cyan-300"
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

              {scanState === "failed" || scanState === "ineligible" || scanState === "no_session" ? (
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-cyan-400 border border-cyan-500/30 transition"
                >
                  Try Again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleScanAttendance}
                  disabled={!modelsReady || isProcessing || !!cameraError}
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-xl shadow-cyan-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Verifying Face...
                    </>
                  ) : (
                    <>Scan Face & Sign Attendance</>
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
